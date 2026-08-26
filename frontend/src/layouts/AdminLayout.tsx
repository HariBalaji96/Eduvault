import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="theme-admin flex min-h-screen bg-background-app text-gray-900 dark:text-gray-100 font-sans">
            <AdminSidebar />
            <div className="flex-1 p-8 md:p-12 overflow-auto animate-fade-in relative">
                {/* Optional subtle gradient background element */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
export default AdminLayout;
