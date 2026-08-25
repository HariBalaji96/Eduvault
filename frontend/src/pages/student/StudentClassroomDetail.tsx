import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import PostList from '../../components/classroom/PostList';
import { useAuth } from '../../context/AuthContext';

const StudentClassroomDetail: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [classroom, setClassroom] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('STREAM');
    
    useEffect(() => {
        fetchClassroom();
        fetchPosts();
    }, [id]);

    const fetchClassroom = async () => {
        try {
            const res = await client.get(`/student/classrooms/${id}`);
            setClassroom(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await client.get(`/student/classrooms/${id}/posts`);
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!classroom) return <div className="flex h-64 items-center justify-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="h-48 bg-gradient-to-r from-green-600 to-teal-700 rounded-xl mb-6 p-8 flex flex-col justify-end text-white shadow-md relative">
                <h1 className="text-4xl font-bold mb-2">{classroom.name}</h1>
                <p className="text-lg opacity-90">{classroom.subject} • {classroom.schoolClassName}</p>
                <p className="text-sm opacity-80 mt-1">Teacher: {classroom.createdByName}</p>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                {['STREAM', 'ASSESSMENTS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === tab 
                            ? 'border-green-600 text-green-600 dark:border-green-500 dark:text-green-400' 
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
                            <PostList posts={posts} />
                        </div>
                    </>
                )}
                {activeTab === 'ASSESSMENTS' && (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500">
                        Check the Assessments tab on the left menu for your tests.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClassroomDetail;
