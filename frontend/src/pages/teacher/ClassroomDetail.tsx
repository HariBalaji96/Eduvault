import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
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

    useEffect(() => {
        fetchClassroom();
        fetchPosts();
        fetchTeachers(); 
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

    const fetchTeachers = async () => {
        try {
            const res = await client.get('/admin/teachers');
            setTeachers(res.data);
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
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
                        Student enrollment feature UI goes here.
                    </div>
                )}
                {activeTab === 'ASSESSMENTS' && (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
                        Assessment feature UI goes here.
                    </div>
                )}
            </div>

            <Modal isOpen={isCollabModalOpen} onClose={() => setCollabModalOpen(false)} title="Add Collaborating Teacher">
                <form onSubmit={handleAddCollaborator} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Teacher</label>
                        <select required value={collabId} onChange={e => setCollabId(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select a teacher...</option>
                            {teachers.filter(t => t.name !== user?.name).map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
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
