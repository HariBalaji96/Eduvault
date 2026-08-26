import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, PenTool } from 'lucide-react';

const TeacherSidebar: React.FC = () => {
    const { logout } = useAuth();
    return (
        <div className="flex h-screen flex-col justify-between border-r border-border-subtle bg-background-surface w-64 md:w-72 shadow-soft z-20 relative">
            <div className="px-6 py-8">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
                        <PenTool size={22} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">Eduvault</h2>
                        <p className="text-xs font-medium text-gray-500">Teacher Portal</p>
                    </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 px-2">
                    Teaching
                </div>
                <ul className="space-y-1.5">
                    <li>
                        <NavLink to="/teacher" end className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100'}`}>
                            <LayoutDashboard size={18} /> My Classrooms
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/teacher/assessments/build" className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/80 dark:hover:text-gray-100'}`}>
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> Build Assessment
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="p-6 border-t border-border-subtle">
                <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                    <LogOut size={18} /> <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};
export default TeacherSidebar;
