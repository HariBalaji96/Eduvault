import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { assessmentApi } from '../../services/assessmentApi';
import PostComposer from '../../components/classroom/PostComposer';
import PostList from '../../components/classroom/PostList';
import Modal from '../../components/Modal';
import { UserPlus, Trash2, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClassroomDetail: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('STREAM');
    const [isCollabModalOpen, setCollabModalOpen] = useState(false);
    const [collabId, setCollabId] = useState('');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);

    const [isEnrollModalOpen, setEnrollModalOpen] = useState(false);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [studentIdsToEnroll, setStudentIdsToEnroll] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [isEditPostModalOpen, setEditPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [isSubmissionsModalOpen, setSubmissionsModalOpen] = useState(false);
    const [currentSubmissions, setCurrentSubmissions] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchClassroom();
        fetchPosts();
        fetchTeachers(); 
        fetchStudents();
        fetchAssessments();
        fetchAllStudents();
    }, [id]);

    const fetchClassroom = async () => {
        try {
            const res = await client.get(`/teacher/classrooms/${id}`);
            setClassroom(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await client.get(`/teacher/classrooms/${id}/posts`);
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAssessments = async () => {
        if (!id) return;
        try {
            const data = await assessmentApi.getTeacherClassroomAssessments(Number(id));
            setAssessments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await client.get('/admin/teachers');
            setTeachers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await client.get(`/teacher/classrooms/${id}/students`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await client.get('/teacher/classrooms/all-students');
            setAvailableStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreatePost = async (postData: any) => {
        await client.post(`/teacher/classrooms/${id}/posts`, postData);
        fetchPosts();
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await client.delete(`/teacher/classrooms/${id}/posts/${postId}`);
            fetchPosts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete post');
        }
    };

    const handleUpdatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        setIsSubmitting(true);
        try {
            await client.patch(`/teacher/classrooms/${id}/posts/${editingPost.id}`, {
                type: editingPost.type,
                title: editingPost.title,
                content: editingPost.content,
                dueDate: editingPost.dueDate ? (editingPost.dueDate.length === 16 ? editingPost.dueDate + ':00' : editingPost.dueDate) : null,
                attachmentUrl: editingPost.attachmentUrl
            });
            setEditPostModalOpen(false);
            setEditingPost(null);
            fetchPosts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditPostModal = (post: any) => {
        setEditingPost({
            ...post,
            dueDate: post.dueDate ? post.dueDate.slice(0, 16) : ''
        });
        setEditPostModalOpen(true);
    };

    const openSubmissionsModal = async (postId: number) => {
        try {
            const res = await client.get(`/teacher/classrooms/${id}/posts/${postId}/submissions`);
            setCurrentSubmissions(res.data);
            setSubmissionsModalOpen(true);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to fetch submissions');
        }
    };

    const handleDeleteAssessment = async (assessmentId: number) => {
        if (!window.confirm("Are you sure you want to delete this assessment? This will delete all submissions and cannot be undone.")) return;
        try {
            await client.delete(`/teacher/assessments/${assessmentId}`);
            fetchAssessments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete assessment');
        }
    };

    const handleAddCollaborator = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post(`/teacher/classrooms/${id}/teachers`, { teacherId: Number(collabId) });
            setCollabModalOpen(false);
            setCollabId('');
            alert('Collaborator added successfully');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to add collaborator');
        }
    };

    const handleDeleteClassroom = async () => {
        if (!window.confirm("Are you sure you want to delete this classroom? This action will permanently remove all posts, enrolled students, and classroom settings. This action cannot be undone.")) return;
        try {
            await client.delete(`/teacher/classrooms/${id}`);
            navigate('/teacher');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete classroom');
        }
    };

    const handleEnrollStudents = async (e: React.FormEvent) => {
        e.preventDefault();
        if (studentIdsToEnroll.length === 0) return;
        try {
            await client.post(`/teacher/classrooms/${id}/students`, { studentIds: studentIdsToEnroll });
            setEnrollModalOpen(false);
            setStudentIdsToEnroll([]);
            setSearchQuery('');
            fetchStudents(); 
            alert('Students enrolled successfully');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to enroll students');
        }
    };

    const handleRemoveStudent = async (studentId: number) => {
        if (!window.confirm("Are you sure you want to remove this student from the classroom?")) return;
        try {
            await client.delete(`/teacher/classrooms/${id}/students/${studentId}`);
            fetchStudents();
            fetchAllStudents();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to remove student');
        }
    };

    if (!classroom) return <div className="flex h-64 items-center justify-center">Loading...</div>;

    const isOwner = user && classroom.createdByName === user.name;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mb-6 p-8 flex flex-col justify-end text-white shadow-md relative">
                <h1 className="text-4xl font-bold mb-2">{classroom.name}</h1>
                <p className="text-lg opacity-90">{classroom.subject}</p>
                {isOwner && (
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <button onClick={() => setCollabModalOpen(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <UserPlus size={18} /> Add Collaborator
                        </button>
                        <button onClick={handleDeleteClassroom} className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Trash2 size={18} /> Delete Classroom
                        </button>
                    </div>
                )}
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {['STREAM', 'STUDENTS', 'ASSESSMENTS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-primary text-primary dark:border-primary dark:text-primary' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {activeTab === 'STREAM' && (
                    <>
                        <div className="md:col-span-1">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upcoming</h3>
                                <p className="text-sm text-gray-500">No work due soon</p>
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <PostComposer onSubmit={handleCreatePost} />
                            <PostList 
                                posts={posts} 
                                isTeacher={true} 
                                onEditPost={openEditPostModal} 
                                onViewSubmissions={openSubmissionsModal} 
                                onDeletePost={handleDeletePost}
                            />
                        </div>
                    </>
                )}
                {activeTab === 'STUDENTS' && (
                    <div className="col-span-full">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enrolled Students ({students.length})</h3>
                                {isOwner && (
                                    <button onClick={() => setEnrollModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
                                        <UserPlus size={16} /> Add Students
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {students.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No students found.</div>
                                ) : (
                                    students.map(s => (
                                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                                    {s.firstName?.[0]}{s.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{s.firstName} {s.lastName}</p>
                                                    <p className="text-sm text-gray-500">{s.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                                    (s.currentStreak && s.currentStreak > 0)
                                                        ? s.activeToday
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/40'
                                                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'
                                                }`}>
                                                    <Flame size={13} className={s.currentStreak && s.currentStreak > 0 ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                                                    <span>{s.currentStreak || 0} {s.currentStreak === 1 ? 'day' : 'days'} streak</span>
                                                    {s.activeToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active today" />}
                                                </div>
                                                {isOwner && (
                                                    <button onClick={() => handleRemoveStudent(s.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="Remove student">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'ASSESSMENTS' && (
                    <div className="col-span-full">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessments ({assessments.length})</h3>
                                <Link to={`/teacher/assessments/build?classroomId=${id}`} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                                    Create Assessment
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {assessments.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No assessments found for this classroom.</div>
                                ) : (
                                    assessments.map(a => (
                                        <div key={a.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white text-lg">{a.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Status: <span className={a.publishedAt ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>{a.publishedAt ? "Published" : "Draft"}</span>
                                                    {a.publishedAt && ` • Published on: ${new Date(a.publishedAt).toLocaleDateString()}`}
                                                    <br />
                                                    Deadline: {a.deadline ? new Date(a.deadline).toLocaleString() : 'No deadline'} • Total Marks: {a.totalMarks}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {a.publishedAt && (
                                                    <Link to={`/teacher/assessments/${a.id}/results`} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        View Submissions
                                                    </Link>
                                                )}
                                                <Link to={`/teacher/assessments/${a.id}/edit`} className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                    {a.publishedAt ? "View Details" : "Edit"}
                                                </Link>
                                                <button onClick={() => handleDeleteAssessment(a.id)} className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isCollabModalOpen} onClose={() => setCollabModalOpen(false)} title="Add Collaborating Teacher">
                <form onSubmit={handleAddCollaborator} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Teacher</label>
                        <select required value={collabId} onChange={e => setCollabId(e.target.value)} className="modern-input">
                            <option value="">Select a teacher...</option>
                            {teachers.filter(t => `${t.firstName} ${t.lastName}`.trim() !== user?.name).map(t => (
                                <option key={t.id} value={t.id}>{`${t.firstName} ${t.lastName}`.trim()} ({t.email})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Invite Collaborator</button>
                </form>
            </Modal>

            <Modal isOpen={isEnrollModalOpen} onClose={() => { setEnrollModalOpen(false); setStudentIdsToEnroll([]); setSearchQuery(''); }} title="Add Students">
                <form onSubmit={handleEnrollStudents} className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Select Students ({studentIdsToEnroll.length} selected)</label>
                            <button 
                                type="button" 
                                className="text-xs text-primary hover:underline"
                                onClick={() => {
                                    const notEnrolled = availableStudents.filter(s => !students.some(es => es.id === s.id));
                                    setStudentIdsToEnroll(notEnrolled.map(s => s.id));
                                }}
                            >
                                Select All (Not Enrolled)
                            </button>
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            className="modern-input" 
                            placeholder="Search by name, email, or roll no..." 
                        />
                        <div className="modern-input max-h-[300px] overflow-y-auto space-y-2 p-3 bg-gray-50 dark:bg-zinc-800/50">
                            {availableStudents
                                .filter(s => !students.some(es => es.id === s.id))
                                .filter(s => {
                                    const searchLower = searchQuery.toLowerCase();
                                    return (s.firstName?.toLowerCase().includes(searchLower) || 
                                            s.lastName?.toLowerCase().includes(searchLower) || 
                                            s.email?.toLowerCase().includes(searchLower) || 
                                            s.registrationId?.toLowerCase().includes(searchLower));
                                })
                                .map(student => (
                                <label key={student.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={studentIdsToEnroll.includes(student.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setStudentIdsToEnroll([...studentIdsToEnroll, student.id]);
                                            } else {
                                                setStudentIdsToEnroll(studentIdsToEnroll.filter(id => id !== student.id));
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {student.firstName} {student.lastName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {student.registrationId || 'No Roll No'} • {student.email}
                                        </span>
                                    </div>
                                </label>
                            ))}
                            {availableStudents.filter(s => !students.some(es => es.id === s.id)).length === 0 && (
                                <div className="p-4 text-center text-sm text-gray-500">All available students are already enrolled.</div>
                            )}
                            {availableStudents.filter(s => !students.some(es => es.id === s.id)).length > 0 && availableStudents.filter(s => !students.some(es => es.id === s.id)).filter(s => {
                                    const searchLower = searchQuery.toLowerCase();
                                    return (s.firstName?.toLowerCase().includes(searchLower) || 
                                            s.lastName?.toLowerCase().includes(searchLower) || 
                                            s.email?.toLowerCase().includes(searchLower) || 
                                            s.registrationId?.toLowerCase().includes(searchLower));
                                }).length === 0 && (
                                <div className="p-4 text-center text-sm text-gray-500">No students found matching "{searchQuery}".</div>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Enroll Selected Students</button>
                </form>
            </Modal>

            {editingPost && (
                <Modal isOpen={isEditPostModalOpen} onClose={() => setEditPostModalOpen(false)} title="Edit Post">
                    <form onSubmit={handleUpdatePost} className="space-y-4">
                        {editingPost.type === 'ASSIGNMENT' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={editingPost.title || ''} 
                                        onChange={e => setEditingPost({...editingPost, title: e.target.value})} 
                                        className="modern-input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={editingPost.dueDate || ''} 
                                        onChange={e => setEditingPost({...editingPost, dueDate: e.target.value})} 
                                        className="modern-input"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <textarea 
                                required 
                                value={editingPost.content || ''} 
                                onChange={e => setEditingPost({...editingPost, content: e.target.value})} 
                                className="modern-input min-h-[100px]"
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="modern-button w-full mt-2 shadow-primary/20">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </Modal>
            )}

            <Modal isOpen={isSubmissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} title="Student Submissions">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {currentSubmissions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No submissions yet.</p>
                    ) : (
                        currentSubmissions.map(sub => (
                            <div key={sub.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{sub.studentName}</p>
                                    <p className="text-xs text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>
                                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded font-medium text-sm transition-colors">
                                    View File
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};
export default ClassroomDetail;
