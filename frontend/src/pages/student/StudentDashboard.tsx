import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const res = await client.get('/student/classrooms');
                setClassrooms(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchClassrooms();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classrooms</h1>
            
            {classrooms.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Classrooms Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">You have not been assigned to any classrooms yet. They will appear here once your teacher adds you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => navigate(`/student/classrooms/${c.id}`)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                        >
                            <div className="h-32 bg-gradient-to-r from-green-500 to-teal-600 p-6 flex flex-col justify-end text-white">
                                <h3 className="text-xl font-bold truncate">{c.name}</h3>
                                <p className="text-sm opacity-90 truncate">{c.subject} • {c.schoolClassName}</p>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 flex-1">
                                    {c.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>Teacher: {c.createdByName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
