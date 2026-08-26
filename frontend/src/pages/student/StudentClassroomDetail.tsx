import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../api/client';
import { assessmentApi } from '../../services/assessmentApi';
import PostList from '../../components/classroom/PostList';
import { useAuth } from '../../context/AuthContext';

const StudentClassroomDetail: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [classroom, setClassroom] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('STREAM');
    
    useEffect(() => {
        fetchClassroom();
        fetchPosts();
        fetchAssessments();
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

    const fetchAssessments = async () => {
        if (!id) return;
        try {
            const data = await assessmentApi.getStudentClassroomAssessments(Number(id));
            setAssessments(data);
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
                    <div className="col-span-full">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessments ({assessments.length})</h3>
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
                                                    Deadline: {a.deadline ? new Date(a.deadline).toLocaleString() : 'No deadline'} • Total Marks: {a.totalMarks}
                                                </p>
                                                <div className="mt-2">
                                                    {a.status === 'NOT_STARTED' && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">Not Started</span>}
                                                    {a.status === 'IN_PROGRESS' && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">In Progress</span>}
                                                    {a.status === 'SUBMITTED' && <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-medium">Submitted</span>}
                                                    {a.status === 'GRADED' && <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">Graded</span>}
                                                </div>
                                            </div>
                                            <div>
                                                {a.status === 'NOT_STARTED' && (
                                                    <Link to={`/student/assessments/${a.id}`} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                                        Start
                                                    </Link>
                                                )}
                                                {a.status === 'IN_PROGRESS' && (
                                                    <Link to={`/student/assessments/${a.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                        Resume
                                                    </Link>
                                                )}
                                                {(a.status === 'SUBMITTED' || a.status === 'GRADED') && (
                                                    <Link to={`/student/assessments/${a.id}/result`} className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                        View Result
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClassroomDetail;
