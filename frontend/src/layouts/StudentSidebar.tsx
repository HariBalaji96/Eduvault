import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, LogOut } from 'lucide-react';

const StudentSidebar: React.FC = () => {
    const { logout } = useAuth();
    return (
        <div className="flex h-screen flex-col justify-between border-e bg-white dark:bg-gray-900 dark:border-gray-800 w-64">
            <div className="px-4 py-6">
                <span className="grid h-10 w-32 place-content-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                    Student Portal
                </span>
                <ul className="mt-6 space-y-1">
                    <li>
                        <NavLink to="/student/dashboard" end className={({ isActive }) => `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/student/assessments" className={({ isActive }) => `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
                            <FileText size={20} /> Assessments
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
export default StudentSidebar;
