import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';

const StudentLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans">
            <StudentSidebar />
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};
export default StudentLayout;
