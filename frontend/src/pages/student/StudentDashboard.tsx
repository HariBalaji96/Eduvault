import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { BookOpen, Users, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const res = await client.get('/student/classrooms');
                setClassrooms(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClassrooms();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">My Classrooms</h1>
                <p className="text-gray-500 dark:text-gray-400">Access your assigned classes and learning materials.</p>
            </div>
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="modern-card p-6 min-h-[220px] animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mb-6"></div>
                            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : classrooms.length === 0 ? (
                <div className="modern-card p-16 text-center border-dashed">
                    <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <FolderOpen size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Classrooms Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">You have not been assigned to any classrooms yet. They will appear here once your teacher adds you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => navigate(`/student/classrooms/${c.id}`)}
                            className="modern-card p-6 h-full flex flex-col hover:-translate-y-1 hover:shadow-floating transition-all duration-300 hover:border-primary/30 relative overflow-hidden cursor-pointer group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                            <div className="flex justify-between items-start mb-6 mt-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary-dark">
                                    {c.subject}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">{c.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 flex-1 mb-6">
                                {c.description || 'No description provided.'}
                            </p>
                            <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <BookOpen size={14} className="text-gray-400" />
                                    {c.schoolClassName}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users size={14} className="text-gray-400" />
                                    {c.createdByName}
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
