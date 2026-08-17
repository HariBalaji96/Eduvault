import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';

const TeacherSidebar: React.FC = () => {
    const { logout } = useAuth();
    return (
        <div className="flex h-screen flex-col justify-between border-e bg-white dark:bg-gray-900 dark:border-gray-800 w-64">
            <div className="px-4 py-6">
                <span className="grid h-10 w-32 place-content-center rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 font-bold text-lg">
                    Teacher Portal
                </span>
                <ul className="mt-6 space-y-1">
                    <li>
                        <NavLink to="/teacher" end className={({ isActive }) => `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                            <LayoutDashboard size={20} /> My Classrooms
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/teacher/assessments/build" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> Build Assessment
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 dark:border-gray-800">
                <button onClick={logout} className="flex items-center gap-2 bg-white dark:bg-gray-900 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left text-red-600">
                    <LogOut size={20} /> <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};
export default TeacherSidebar;
