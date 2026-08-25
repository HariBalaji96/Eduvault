import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const AdminClassroomList: React.FC = () => {
    const [classrooms, setClassrooms] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const res = await client.get('/admin/classrooms');
            setClassrooms(res.data);
        } catch (err) {
            console.error("Failed to fetch classrooms", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Classroom Name', accessor: 'name' },
        { header: 'Subject', accessor: 'subject' },
        { header: 'School Class', accessor: (r: any) => r.schoolClassName || 'N/A' },
        { header: 'Owner (Teacher)', accessor: 'createdByName' },
        { 
            header: 'Created Date', 
            accessor: (r: any) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A' 
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Classrooms</h2>
                </div>
                <DataTable 
                    data={classrooms} 
                    columns={columns} 
                    keyExtractor={(r) => r.id} 
                />
            </div>
        </div>
    );
};

export default AdminClassroomList;
