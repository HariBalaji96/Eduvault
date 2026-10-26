import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { Menu, GraduationCap, Flame, Code } from 'lucide-react';
import { streakApi, type StudentStreak } from '../services/streakApi';

const StudentLayout: React.FC = () => {
    // Sidebar is hidden by default as requested; clicking 3-line button shows it!
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [streak, setStreak] = useState<StudentStreak | null>(null);
    const location = useLocation();

    // Auto-close sidebar on route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        streakApi.getMyStreak()
            .then(data => setStreak(data))
            .catch(() => {});
    }, []);

    return (
        <div className="theme-student flex flex-col h-screen overflow-hidden bg-background-app text-gray-900 dark:text-gray-100 font-sans">
            {/* Top Navigation Bar with 3-Line Hamburger Menu */}
            <header className="h-14 px-4 sm:px-6 border-b border-border-subtle bg-background-surface/90 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
                <div className="flex items-center gap-3">
                    {/* The 3-Line Button */}
                    <button
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 transition-all flex items-center gap-2 border border-border-subtle shadow-xs active:scale-95 cursor-pointer"
                        title={isSidebarOpen ? "Hide Sidebar (3-line button)" : "Show Sidebar (3-line button)"}
                        aria-label="Toggle Navigation Menu"
                    >
                        <Menu size={20} />
                        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline text-gray-600 dark:text-gray-300">
                            Menu
                        </span>
                    </button>

                    <Link to="/student/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">Eduvault</span>
                            <span className="text-[10px] text-gray-400 font-medium ml-2 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 hidden md:inline">
                                Student Portal
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {streak && streak.currentStreak > 0 && (
                        <Link 
                            to="/student/leaderboard" 
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                streak.activeToday 
                                    ? 'bg-amber-400/10 text-amber-500 border-amber-500/30 hover:bg-amber-400/20' 
                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse hover:bg-orange-500/30'
                            }`}
                            title="View Streak Leaderboard"
                        >
                            <Flame size={14} className="fill-current" />
                            <span>{streak.currentStreak}d Streak</span>
                        </Link>
                    )}
                    <Link
                        to="/student/practice"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                        title="Open Practice Code Editor"
                    >
                        <Code size={14} />
                        <span className="hidden sm:inline">Practice Code</span>
                    </Link>
                </div>
            </header>

            {/* Collapsible Sidebar Drawer */}
            <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area: Takes 100% full width when sidebar is hidden */}
            <main className="flex-1 overflow-y-auto animate-fade-in relative p-4 sm:p-6 lg:p-8 flex flex-col">
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
