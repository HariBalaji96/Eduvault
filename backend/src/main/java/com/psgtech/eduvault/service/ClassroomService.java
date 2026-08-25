package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.admin.UserResponse;
import com.psgtech.eduvault.dto.classroom.*;
import com.psgtech.eduvault.entity.*;
import com.psgtech.eduvault.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final ClassroomTeacherRepository classroomTeacherRepository;
    private final ClassroomStudentRepository classroomStudentRepository;
    private final ClassroomPostRepository classroomPostRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;

    public ClassroomService(ClassroomRepository classroomRepository, ClassroomTeacherRepository classroomTeacherRepository,
                            ClassroomStudentRepository classroomStudentRepository, ClassroomPostRepository classroomPostRepository,
                            UserRepository userRepository, SchoolClassRepository schoolClassRepository) {
        this.classroomRepository = classroomRepository;
        this.classroomTeacherRepository = classroomTeacherRepository;
        this.classroomStudentRepository = classroomStudentRepository;
        this.classroomPostRepository = classroomPostRepository;
        this.userRepository = userRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private ClassroomTeacher verifyTeacherAccess(Long classroomId, String email) {
        User teacher = getUserByEmail(email);
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found"));
        return classroomTeacherRepository.findByClassroomAndTeacher(classroom, teacher)
                .orElseThrow(() -> new AccessDeniedException("You do not have access to this classroom"));
    }

    private Classroom verifyStudentAccess(Long classroomId, String email) {
        User student = getUserByEmail(email);
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new IllegalArgumentException("Classroom not found"));
        
        boolean hasAccess = false;
        if (student.getSchoolClass() != null && classroom.getSchoolClass() != null 
            && student.getSchoolClass().getId().equals(classroom.getSchoolClass().getId())) {
            hasAccess = true;
        } else if (classroomStudentRepository.findByClassroomAndStudent(classroom, student).isPresent()) {
            hasAccess = true;
        }
        
        if (!hasAccess) {
            throw new AccessDeniedException("You do not have access to this classroom");
        }
        return classroom;
    }

    @Transactional
    public ClassroomResponse createClassroom(ClassroomRequest request, String email) {
        User teacher = getUserByEmail(email);
        SchoolClass schoolClass = schoolClassRepository.findById(request.getSchoolClassId())
                .orElseThrow(() -> new IllegalArgumentException("School class not found"));

        Classroom classroom = new Classroom();
        classroom.setName(request.getName());
        classroom.setSubject(request.getSubject());
        classroom.setDescription(request.getDescription());
        classroom.setSchoolClass(schoolClass);
        classroom.setCreatedBy(teacher);
        classroom = classroomRepository.save(classroom);

        ClassroomTeacher ct = new ClassroomTeacher();
        ct.setClassroom(classroom);
        ct.setTeacher(teacher);
        ct.setPermissionLevel(PermissionLevel.OWNER);
        classroomTeacherRepository.save(ct);

        // Auto-enroll all students mapped to this SchoolClass
        List<User> students = userRepository.findBySchoolClassIdAndRole(schoolClass.getId(), Role.STUDENT);
        for (User student : students) {
            ClassroomStudent cs = new ClassroomStudent();
            cs.setClassroom(classroom);
            cs.setStudent(student);
            classroomStudentRepository.save(cs);
        }

        return mapToClassroomResponse(classroom);
    }

    @Transactional(readOnly = true)
    public List<ClassroomResponse> getMyClassrooms(String email) {
        User teacher = getUserByEmail(email);
        return classroomTeacherRepository.findByTeacher(teacher).stream()
                .map(ct -> mapToClassroomResponse(ct.getClassroom()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassroomResponse> getStudentClassrooms(String email) {
        User student = getUserByEmail(email);
        java.util.Set<Classroom> classrooms = new java.util.HashSet<>();
        
        if (student.getSchoolClass() != null) {
            classrooms.addAll(classroomRepository.findBySchoolClass(student.getSchoolClass()));
        }
        
        classroomStudentRepository.findByStudentId(student.getId()).forEach(cs -> {
            classrooms.add(cs.getClassroom());
        });
        
        return classrooms.stream()
                .map(this::mapToClassroomResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassroomResponse> getAllClassrooms() {
        return classroomRepository.findAll().stream()
                .map(this::mapToClassroomResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClassroomResponse getClassroomDetails(Long id, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        return mapToClassroomResponse(ct.getClassroom());
    }

    @Transactional(readOnly = true)
    public ClassroomResponse getStudentClassroomDetails(Long id, String email) {
        Classroom classroom = verifyStudentAccess(id, email);
        return mapToClassroomResponse(classroom);
    }

    @Transactional
    public void addCollaborator(Long id, CollaboratorRequest request, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        if (ct.getPermissionLevel() != PermissionLevel.OWNER) {
            throw new AccessDeniedException("Only the owner can add collaborators");
        }
        User newTeacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        
        if (classroomTeacherRepository.findByClassroomAndTeacher(ct.getClassroom(), newTeacher).isPresent()) {
            throw new IllegalArgumentException("Teacher is already a collaborator");
        }

        ClassroomTeacher newCt = new ClassroomTeacher();
        newCt.setClassroom(ct.getClassroom());
        newCt.setTeacher(newTeacher);
        newCt.setPermissionLevel(PermissionLevel.COLLABORATOR);
        classroomTeacherRepository.save(newCt);
    }

    @Transactional
    public void enrollStudents(Long id, StudentEnrollRequest request, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        List<User> students = userRepository.findAllById(request.getStudentIds());
        for (User student : students) {
            if (student.getRole() == Role.STUDENT && 
                classroomStudentRepository.findByClassroomAndStudent(ct.getClassroom(), student).isEmpty()) {
                ClassroomStudent cs = new ClassroomStudent();
                cs.setClassroom(ct.getClassroom());
                cs.setStudent(student);
                classroomStudentRepository.save(cs);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getStudents(Long id, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        
        java.util.Set<User> allStudents = new java.util.HashSet<>();
        
        if (ct.getClassroom().getSchoolClass() != null) {
            allStudents.addAll(userRepository.findBySchoolClassIdAndRole(ct.getClassroom().getSchoolClass().getId(), Role.STUDENT));
        }
        
        classroomStudentRepository.findByClassroom(ct.getClassroom()).forEach(cs -> {
            allStudents.add(cs.getStudent());
        });
        
        return allStudents.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PostResponse createPost(Long id, PostRequest request, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        ClassroomPost post = new ClassroomPost();
        post.setClassroom(ct.getClassroom());
        post.setAuthor(ct.getTeacher());
        post.setType(request.getType());
        post.setContent(request.getContent());
        post.setAttachmentUrl(request.getAttachmentUrl());
        post = classroomPostRepository.save(post);
        return mapToPostResponse(post);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPosts(Long id, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        return classroomPostRepository.findByClassroomOrderByCreatedAtDesc(ct.getClassroom()).stream()
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getStudentClassroomPosts(Long id, String email) {
        Classroom classroom = verifyStudentAccess(id, email);
        return classroomPostRepository.findByClassroomOrderByCreatedAtDesc(classroom).stream()
                .map(this::mapToPostResponse)
                .collect(Collectors.toList());
    }

    private ClassroomResponse mapToClassroomResponse(Classroom classroom) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .name(classroom.getName())
                .subject(classroom.getSubject())
                .description(classroom.getDescription())
                .schoolClassId(classroom.getSchoolClass() != null ? classroom.getSchoolClass().getId() : null)
                .schoolClassName(classroom.getSchoolClass() != null ? classroom.getSchoolClass().getName() : null)
                .createdById(classroom.getCreatedBy().getId())
                .createdByName(classroom.getCreatedBy().getName())
                .createdAt(classroom.getCreatedAt())
                .build();
    }

    private PostResponse mapToPostResponse(ClassroomPost post) {
        return PostResponse.builder()
                .id(post.getId())
                .type(post.getType())
                .content(post.getContent())
                .attachmentUrl(post.getAttachmentUrl())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getName())
                .createdAt(post.getCreatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        String fullName = user.getName() != null ? user.getName().trim() : "";
        int spaceIdx = fullName.indexOf(' ');
        String firstName = spaceIdx > 0 ? fullName.substring(0, spaceIdx) : fullName;
        String lastName = spaceIdx > 0 ? fullName.substring(spaceIdx + 1) : "";
        return UserResponse.builder()
                .id(user.getId())
                .firstName(firstName)
                .lastName(lastName)
                .email(user.getEmail())
                .role(user.getRole())
                .schoolClassId(user.getSchoolClass() != null ? user.getSchoolClass().getId() : null)
                .schoolClassName(user.getSchoolClass() != null ? user.getSchoolClass().getName() : null)
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
