import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';

const TeacherLayout: React.FC = () => {
    return (
        <div className="theme-teacher flex h-screen overflow-hidden bg-background-app text-gray-900 dark:text-gray-100 font-sans">
            <TeacherSidebar />
            <div className="flex-1 p-8 md:p-12 overflow-y-auto animate-fade-in relative">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
export default TeacherLayout;
