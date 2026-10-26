import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Code, LogOut, GraduationCap, Flame, ArrowRight, Trophy, X } from 'lucide-react';
import { streakApi, type StudentStreak } from '../services/streakApi';

interface StudentSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const [streak, setStreak] = useState<StudentStreak | null>(null);

    useEffect(() => {
        streakApi.getMyStreak()
            .then(data => setStreak(data))
            .catch(err => console.error("Could not fetch streak for sidebar", err));
    }, []);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const navItems = [
        { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/student/assessments', label: 'Assessments', icon: <FileText size={18} /> },
        { 
            path: '/student/practice', 
            label: 'Practice', 
            icon: <Code size={18} />,
            badge: streak && streak.currentStreak > 0 ? (
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    streak.activeToday 
                        ? 'bg-amber-400/20 text-amber-500 border border-amber-500/30' 
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse'
                }`}>
                    <Flame size={11} className="fill-current" />
                    {streak.currentStreak}d
                </span>
            ) : null
        },
        { path: '/student/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
    ];

    return (
        <>
            {/* Backdrop overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-out Sidebar Drawer */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col justify-between border-r border-border-subtle bg-background-surface w-64 md:w-72 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Student Navigation Drawer"
            >
                <div className="px-6 py-6 overflow-y-auto">
                    {/* Brand Header & Close Button */}
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
                                <GraduationCap size={22} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">Eduvault</h2>
                                <p className="text-xs font-medium text-gray-500">Student Portal</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Hide Sidebar"
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-2">
                        Learning
                    </div>
                    <ul className="space-y-1.5">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => onClose()}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                                                : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100'
                                        }`
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 border-t border-border-subtle space-y-3">
                    {/* Mini Streak Widget in Sidebar */}
                    {streak && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                        streak.activeToday ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-500/20 text-amber-500'
                                    }`}>
                                        <Flame size={14} className={streak.currentStreak > 0 ? "fill-current" : ""} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {streak.currentStreak} Day{streak.currentStreak === 1 ? '' : 's'} Streak
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400">Best: {streak.highestStreak}d</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                                <span>{streak.activeToday ? 'Active today ✅' : 'Run code today ⚡'}</span>
                                <Link 
                                    to="/student/practice" 
                                    onClick={() => onClose()}
                                    className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                                >
                                    Code <ArrowRight size={10} />
                                </Link>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 cursor-pointer"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default StudentSidebar;
