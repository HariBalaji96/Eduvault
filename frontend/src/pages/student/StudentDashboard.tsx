import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { streakApi, type StudentStreak } from '../../services/streakApi';
import { Users, FolderOpen, Flame, Award, ArrowRight, CheckCircle, AlertTriangle, Code2, Trophy } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [streak, setStreak] = useState<StudentStreak | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [classroomsRes, streakData] = await Promise.allSettled([
                    client.get('/student/classrooms'),
                    streakApi.getMyStreak()
                ]);

                if (classroomsRes.status === 'fulfilled') {
                    setClassrooms(classroomsRes.value.data);
                }
                if (streakData.status === 'fulfilled') {
                    setStreak(streakData.value);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Generate last 7 days for the visual tracker
    const getLast7Days = () => {
        const days = [];
        const today = new Date();
        const activeDatesSet = new Set(streak?.recentActiveDates || []);
        if (streak?.activeToday) {
            activeDatesSet.add(today.toISOString().split('T')[0]);
        }

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const isToday = i === 0;
            const hasRun = activeDatesSet.has(dateStr);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            days.push({
                dateStr,
                dayName,
                isToday,
                hasRun
            });
        }
        return days;
    };

    const last7Days = getLast7Days();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Daily Coding Streak Hero Widget */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-zinc-900/40 border border-amber-500/20 p-6 md:p-8 shadow-xl backdrop-blur-sm">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Left: Streak Flame & Numbers */}
                    <div className="flex items-center gap-5">
                        <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl ${
                            streak?.activeToday 
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                : streak?.streakStatus === 'AT_RISK'
                                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 text-amber-500 border border-amber-500/40'
                                    : 'bg-zinc-800 text-gray-400 border border-zinc-700'
                        }`}>
                            <Flame size={44} className={streak?.currentStreak && streak.currentStreak > 0 ? "fill-current animate-bounce" : ""} />
                            {streak?.activeToday && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {streak?.currentStreak ?? 0}
                                </h2>
                                <span className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">
                                    Day{streak?.currentStreak === 1 ? '' : 's'} Streak
                                </span>
                                
                                {streak?.activeToday ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30">
                                        <CheckCircle size={13} /> Active Today
                                    </span>
                                ) : streak?.streakStatus === 'AT_RISK' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                                        <AlertTriangle size={13} /> Run code today!
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                                        {streak?.currentStreak === 0 ? 'No Active Streak' : 'Streak Broken'}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg">
                                {streak?.message || "Run at least one code execution per day in the code editor to keep your daily streak alive!"}
                            </p>
                        </div>
                    </div>

                    {/* Right: Stats & Action */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                        {/* Weekly Tracker Dots */}
                        <div className="bg-white/60 dark:bg-zinc-900/60 border border-border-subtle rounded-xl p-3 flex items-center justify-between gap-3">
                            {last7Days.map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-medium text-gray-400 uppercase">
                                        {day.dayName}
                                    </span>
                                    <div 
                                        title={`${day.dateStr}: ${day.hasRun ? 'Code executed' : 'No execution'}`}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-transform ${
                                            day.hasRun 
                                                ? 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/30 scale-105' 
                                                : day.isToday 
                                                    ? 'border-2 border-dashed border-amber-500/60 text-amber-500 bg-amber-500/5' 
                                                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
                                        }`}
                                    >
                                        {day.hasRun ? <Flame size={14} className="fill-current" /> : '•'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Best Streak & Executions */}
                        <div className="flex flex-row sm:flex-col gap-3 justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                <Award size={15} className="text-amber-500" />
                                <span>Best: <strong className="text-gray-900 dark:text-white font-bold">{streak?.highestStreak ?? 0} days</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                <Code2 size={15} className="text-primary" />
                                <span>Runs: <strong className="text-gray-900 dark:text-white font-bold">{streak?.totalExecutions ?? 0}</strong></span>
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <button
                                onClick={() => navigate('/student/leaderboard')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 border border-border-subtle transition-all duration-200 shadow-sm active:scale-[0.98] whitespace-nowrap"
                            >
                                <Trophy size={16} className="text-amber-500" />
                                <span>Leaderboard</span>
                            </button>
                            <button
                                onClick={() => navigate('/student/practice')}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-primary hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20 active:scale-[0.98] whitespace-nowrap"
                            >
                                <span>Code Editor</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">My Classrooms</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Access your assigned classes and learning materials.</p>
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
                                    <Users size={14} className="text-gray-400" />
                                    {c.createdByName}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default StudentDashboard;
