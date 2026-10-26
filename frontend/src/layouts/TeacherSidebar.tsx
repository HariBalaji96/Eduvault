import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, PenTool, Trophy, X, FilePlus2 } from 'lucide-react';

interface TeacherSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isOpen, onClose }) => {
    const { logout } = useAuth();

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
                aria-label="Teacher Navigation Drawer"
            >
                <div className="px-6 py-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
                                <PenTool size={22} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">Eduvault</h2>
                                <p className="text-xs font-medium text-gray-500">Teacher Portal</p>
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
                        Teaching
                    </div>
                    <ul className="space-y-1.5">
                        <li>
                            <NavLink 
                                to="/teacher" 
                                end 
                                onClick={() => onClose()}
                                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100'}`}
                            >
                                <LayoutDashboard size={18} /> My Classrooms
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/teacher/assessments/build" 
                                onClick={() => onClose()}
                                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100'}`}
                            >
                                <FilePlus2 size={18} /> Build Assessment
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/teacher/leaderboard" 
                                onClick={() => onClose()}
                                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100'}`}
                            >
                                <Trophy size={18} /> Streak Leaderboard
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className="p-6 border-t border-border-subtle">
                    <button 
                        onClick={logout} 
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 cursor-pointer"
                    >
                        <LogOut size={18} /> <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default TeacherSidebar;
