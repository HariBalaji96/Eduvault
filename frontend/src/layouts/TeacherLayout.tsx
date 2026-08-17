import React from 'react';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';

const TeacherLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <TeacherSidebar />
            <div className="flex-1 p-8 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};
export default TeacherLayout;
