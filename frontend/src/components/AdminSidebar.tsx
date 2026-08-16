import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, GraduationCap, LogOut } from 'lucide-react';

const AdminSidebar: React.FC = () => {
    const { logout } = useAuth();
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/students', label: 'Students', icon: <Users size={20} /> },
        { path: '/admin/teachers', label: 'Teachers', icon: <GraduationCap size={20} /> },
        { path: '/admin/classes', label: 'Classes', icon: <BookOpen size={20} /> },
    ];

    return (
        <div className="flex h-screen flex-col justify-between border-e bg-white dark:bg-gray-900 dark:border-gray-800 w-64">
            <div className="px-4 py-6">
                <span className="grid h-10 w-32 place-content-center rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 font-bold text-lg">
                    Eduvault Admin
                </span>
                <ul className="mt-6 space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                                    }`
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-white dark:bg-gray-900 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left text-red-600"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};
export default AdminSidebar;
