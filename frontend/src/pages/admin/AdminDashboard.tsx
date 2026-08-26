import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [studentsRes, teachersRes, classesRes] = await Promise.all([
                    client.get('/admin/students'),
                    client.get('/admin/teachers'),
                    client.get('/admin/classes')
                ]);
                setStats({
                    students: studentsRes.data.length,
                    teachers: teachersRes.data.length,
                    classes: classesRes.data.length
                });
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Students', value: stats.students, icon: <Users size={24} className="text-primary" />, trend: '+12%' },
        { title: 'Total Teachers', value: stats.teachers, icon: <GraduationCap size={24} className="text-green-500" />, trend: '+4%' },
        { title: 'Total Classes', value: stats.classes, icon: <BookOpen size={24} className="text-purple-500" />, trend: '+2%' },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Overview</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your institution's core metrics and data.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, idx) => (
                    <div key={idx} className="modern-card p-6 flex flex-col relative group transition-all duration-300 hover:shadow-floating hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700/50 group-hover:bg-primary/10 transition-colors">
                                {card.icon}
                            </div>
                            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-full">
                                <TrendingUp size={12} className="mr-1" />
                                {card.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
                            {isLoading ? (
                                <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            ) : (
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for future sections */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 modern-card p-8 min-h-[300px] flex items-center justify-center border-dashed">
                    <p className="text-gray-400 text-sm font-medium">Activity Chart Visualization</p>
                </div>
                <div className="modern-card p-8 min-h-[300px] flex items-center justify-center border-dashed">
                    <p className="text-gray-400 text-sm font-medium">Recent Activity Log</p>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
