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
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final com.psgtech.eduvault.repository.StudentStreakRepository studentStreakRepository;
    private final EmailNotificationService emailNotificationService;

    public ClassroomService(ClassroomRepository classroomRepository, ClassroomTeacherRepository classroomTeacherRepository,
                            ClassroomStudentRepository classroomStudentRepository, ClassroomPostRepository classroomPostRepository,
                            AssignmentSubmissionRepository assignmentSubmissionRepository,
                            UserRepository userRepository, SchoolClassRepository schoolClassRepository,
                            com.psgtech.eduvault.repository.StudentStreakRepository studentStreakRepository,
                            EmailNotificationService emailNotificationService) {
        this.classroomRepository = classroomRepository;
        this.classroomTeacherRepository = classroomTeacherRepository;
        this.classroomStudentRepository = classroomStudentRepository;
        this.classroomPostRepository = classroomPostRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.userRepository = userRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.studentStreakRepository = studentStreakRepository;
        this.emailNotificationService = emailNotificationService;
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
        if (classroomStudentRepository.findByClassroomAndStudent(classroom, student).isPresent()) {
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

        Classroom classroom = new Classroom();
        classroom.setName(request.getName());
        classroom.setSubject(request.getSubject());
        
        if (request.getSchoolClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(request.getSchoolClassId())
                    .orElse(null);
            classroom.setSchoolClass(schoolClass);
        }
        
        classroom.setDescription(request.getDescription());
        classroom.setCreatedBy(teacher);
        classroom = classroomRepository.save(classroom);

        ClassroomTeacher ct = new ClassroomTeacher();
        ct.setClassroom(classroom);
        ct.setTeacher(teacher);
        ct.setPermissionLevel(PermissionLevel.OWNER);
        classroomTeacherRepository.save(ct);

        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            StudentEnrollRequest enrollRequest = new StudentEnrollRequest();
            enrollRequest.setStudentIds(request.getStudentIds());
            enrollStudents(classroom.getId(), enrollRequest, email);
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

    @Transactional
    public void removeStudent(Long id, Long studentId, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        if (ct.getPermissionLevel() != PermissionLevel.OWNER) {
            throw new AccessDeniedException("Only the owner can remove students");
        }
        User student = userRepository.findById(studentId).orElseThrow(() -> new IllegalArgumentException("Student not found"));
        classroomStudentRepository.findByClassroomAndStudent(ct.getClassroom(), student).ifPresent(classroomStudentRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getStudents(Long id, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        
        java.util.Set<User> allStudents = new java.util.HashSet<>();
        

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
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setDueDate(request.getDueDate());
        post.setAttachmentUrl(request.getAttachmentUrl());
        post = classroomPostRepository.save(post);
        emailNotificationService.notifyStudentsNewPost(post);
        return mapToPostResponse(post);
    }

    @Transactional
    public PostResponse editPost(Long id, Long postId, PostRequest request, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        ClassroomPost post = classroomPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (!post.getClassroom().getId().equals(ct.getClassroom().getId())) {
            throw new IllegalArgumentException("Post does not belong to this classroom");
        }
        
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setDueDate(request.getDueDate());
        post.setAttachmentUrl(request.getAttachmentUrl());
        
        post = classroomPostRepository.save(post);
        return mapToPostResponse(post);
    }

    @Transactional
    public void deletePost(Long id, Long postId, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        ClassroomPost post = classroomPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (!post.getClassroom().getId().equals(ct.getClassroom().getId())) {
            throw new IllegalArgumentException("Post does not belong to this classroom");
        }
        
        if (post.getType() == PostType.ASSIGNMENT) {
            assignmentSubmissionRepository.deleteByPost(post);
        }
        
        classroomPostRepository.delete(post);
    }

    @Transactional
    public AssignmentSubmissionResponse submitAssignment(Long id, Long postId, AssignmentSubmissionRequest request, String email) {
        Classroom classroom = verifyStudentAccess(id, email);
        User student = getUserByEmail(email);
        
        ClassroomPost post = classroomPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        
        if (!post.getClassroom().getId().equals(classroom.getId()) || post.getType() != PostType.ASSIGNMENT) {
            throw new IllegalArgumentException("Invalid assignment post");
        }
        
        AssignmentSubmission submission = assignmentSubmissionRepository.findByPostAndStudent(post, student)
                .orElse(new AssignmentSubmission());
                
        submission.setPost(post);
        submission.setStudent(student);
        submission.setFileUrl(request.getFileUrl());
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        
        submission = assignmentSubmissionRepository.save(submission);
        
        return mapToAssignmentSubmissionResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> getAssignmentSubmissions(Long id, Long postId, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        ClassroomPost post = classroomPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
                
        if (!post.getClassroom().getId().equals(ct.getClassroom().getId())) {
            throw new IllegalArgumentException("Post does not belong to this classroom");
        }
        
        return assignmentSubmissionRepository.findByPost(post).stream()
                .map(this::mapToAssignmentSubmissionResponse)
                .collect(Collectors.toList());
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

    @Transactional
    public void deleteClassroom(Long id, String email) {
        ClassroomTeacher ct = verifyTeacherAccess(id, email);
        if (ct.getPermissionLevel() != PermissionLevel.OWNER) {
            throw new AccessDeniedException("Only the owner can delete the classroom");
        }
        
        Classroom classroom = ct.getClassroom();
        classroomPostRepository.deleteByClassroom(classroom);
        classroomStudentRepository.deleteByClassroom(classroom);
        classroomTeacherRepository.deleteByClassroom(classroom);
        classroomRepository.delete(classroom);
    }

    private ClassroomResponse mapToClassroomResponse(Classroom classroom) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .name(classroom.getName())
                .subject(classroom.getSubject())
                .schoolClassId(classroom.getSchoolClass() != null ? classroom.getSchoolClass().getId() : null)
                .targetClassName(classroom.getSchoolClass() != null ? classroom.getSchoolClass().getName() : null)
                .description(classroom.getDescription())
                .createdById(classroom.getCreatedBy().getId())
                .createdByName(classroom.getCreatedBy().getName())
                .createdAt(classroom.getCreatedAt())
                .build();
    }

    private PostResponse mapToPostResponse(ClassroomPost post) {
        return PostResponse.builder()
                .id(post.getId())
                .type(post.getType())
                .title(post.getTitle())
                .content(post.getContent())
                .dueDate(post.getDueDate())
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

        java.time.LocalDate today = java.time.LocalDate.now();
        int currentStreak = 0;
        int highestStreak = 0;
        java.time.LocalDate lastActiveDate = null;
        boolean activeToday = false;
        String streakStatus = "INACTIVE";

        var streakOpt = studentStreakRepository.findByStudentId(user.getId());
        if (streakOpt.isPresent()) {
            var streak = streakOpt.get();
            highestStreak = streak.getHighestStreak();
            lastActiveDate = streak.getLastActiveDate();

            if (lastActiveDate != null) {
                if (lastActiveDate.isEqual(today)) {
                    currentStreak = streak.getCurrentStreak();
                    activeToday = true;
                    streakStatus = "ACTIVE";
                } else if (lastActiveDate.isEqual(today.minusDays(1))) {
                    currentStreak = streak.getCurrentStreak();
                    activeToday = false;
                    streakStatus = "AT_RISK";
                } else {
                    currentStreak = 0;
                    streakStatus = "BROKEN";
                }
            }
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstName(firstName)
                .lastName(lastName)
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .registrationId(user.getRegistrationId())
                .currentStreak(currentStreak)
                .highestStreak(highestStreak)
                .lastActiveDate(lastActiveDate)
                .activeToday(activeToday)
                .streakStatus(streakStatus)
                .build();
    }

    private AssignmentSubmissionResponse mapToAssignmentSubmissionResponse(AssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .postId(submission.getPost().getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getName())
                .fileUrl(submission.getFileUrl())
                .submittedAt(submission.getSubmittedAt())
                .score(submission.getScore())
                .feedback(submission.getFeedback())
                .build();
    }
}
