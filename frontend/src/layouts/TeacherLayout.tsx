import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import { Menu, PenTool } from 'lucide-react';

const TeacherLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="theme-teacher flex flex-col h-screen overflow-hidden bg-background-app text-gray-900 dark:text-gray-100 font-sans">
            {/* Top Navigation Bar with 3-line hamburger menu button */}
            <header className="h-14 px-4 sm:px-6 border-b border-border-subtle bg-background-surface/90 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 transition-all flex items-center gap-2 border border-border-subtle shadow-xs active:scale-95 cursor-pointer"
                        title={isSidebarOpen ? "Hide Sidebar (3-line button)" : "Show Sidebar (3-line button)"}
                        aria-label="Toggle Navigation"
                    >
                        <Menu size={20} />
                        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline text-gray-600 dark:text-gray-300">Menu</span>
                    </button>
                    <Link to="/teacher" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
                            <PenTool size={18} />
                        </div>
                        <div>
                            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">Eduvault</span>
                            <span className="text-[10px] text-gray-400 font-medium ml-2 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 hidden md:inline">Teacher Portal</span>
                        </div>
                    </Link>
                </div>
            </header>

            <TeacherSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 p-6 md:p-10 overflow-y-auto animate-fade-in relative">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default TeacherLayout;
