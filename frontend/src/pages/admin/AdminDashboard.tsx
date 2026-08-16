import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 });

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
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Students', value: stats.students, icon: <Users size={40} className="text-blue-500" /> },
        { title: 'Total Teachers', value: stats.teachers, icon: <GraduationCap size={40} className="text-green-500" /> },
        { title: 'Total Classes', value: stats.classes, icon: <BookOpen size={40} className="text-purple-500" /> },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {cards.map((card, idx) => (
                    <div key={idx} className="flex items-center gap-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full">{card.icon}</div>
                        <div>
                            <p className="text-2xl font-medium text-gray-900 dark:text-white">{card.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminDashboard;
