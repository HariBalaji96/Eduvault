import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { assessmentApi } from '../../services/assessmentApi';
import PostComposer from '../../components/classroom/PostComposer';
import PostList from '../../components/classroom/PostList';
import Modal from '../../components/Modal';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClassroomDetail: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [classroom, setClassroom] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('STREAM');
    const [isCollabModalOpen, setCollabModalOpen] = useState(false);
    const [collabId, setCollabId] = useState('');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);

    useEffect(() => {
        fetchClassroom();
        fetchPosts();
        fetchTeachers(); 
        fetchStudents();
        fetchAssessments();
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

    const handleCreatePost = async (postData: any) => {
        await client.post(`/teacher/classrooms/${id}/posts`, postData);
        fetchPosts();
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

    if (!classroom) return <div className="flex h-64 items-center justify-center">Loading...</div>;

    const isOwner = user && classroom.createdByName === user.name;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl mb-6 p-8 flex flex-col justify-end text-white shadow-md relative">
                <h1 className="text-4xl font-bold mb-2">{classroom.name}</h1>
                <p className="text-lg opacity-90">{classroom.subject} • {classroom.schoolClassName}</p>
                {isOwner && (
                    <button onClick={() => setCollabModalOpen(true)} className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <UserPlus size={18} /> Add Collaborator
                    </button>
                )}
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {['STREAM', 'STUDENTS', 'ASSESSMENTS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' 
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
                            <PostList posts={posts} />
                        </div>
                    </>
                )}
                {activeTab === 'STUDENTS' && (
                    <div className="col-span-full">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enrolled Students ({students.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {students.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No students found.</div>
                                ) : (
                                    students.map(s => (
                                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {s.firstName?.[0]}{s.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{s.firstName} {s.lastName}</p>
                                                    <p className="text-sm text-gray-500">{s.email}</p>
                                                </div>
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
                                <Link to="/teacher/assessments" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
                                                    <Link to={`/teacher/assessments/${a.id}/submissions`} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        View Submissions
                                                    </Link>
                                                )}
                                                <Link to={`/teacher/assessments/${a.id}/edit`} className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                    Edit
                                                </Link>
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
                        <select required value={collabId} onChange={e => setCollabId(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select a teacher...</option>
                            {teachers.filter(t => `${t.firstName} ${t.lastName}`.trim() !== user?.name).map(t => (
                                <option key={t.id} value={t.id}>{`${t.firstName} ${t.lastName}`.trim()} ({t.email})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Invite Collaborator</button>
                </form>
            </Modal>
        </div>
    );
};
export default ClassroomDetail;
