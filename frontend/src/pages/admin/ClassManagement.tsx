import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus } from 'lucide-react';

const ClassManagement: React.FC = () => {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [isYearModalOpen, setYearModalOpen] = useState(false);
    const [isClassModalOpen, setClassModalOpen] = useState(false);
    
    const [yearLabel, setYearLabel] = useState('');
    const [className, setClassName] = useState('');
    const [selectedYearId, setSelectedYearId] = useState('');

    const fetchData = async () => {
        const [yRes, cRes] = await Promise.all([
            client.get('/admin/academic-years'),
            client.get('/admin/classes')
        ]);
        setYears(yRes.data);
        setClasses(cRes.data);
    };

    useEffect(() => { fetchData(); }, []);

    const createYear = async (e: React.FormEvent) => {
        e.preventDefault();
        await client.post('/admin/academic-years', { yearLabel });
        setYearLabel(''); setYearModalOpen(false); fetchData();
    };

    const createClass = async (e: React.FormEvent) => {
        e.preventDefault();
        await client.post('/admin/classes', { name: className, academicYearId: Number(selectedYearId) });
        setClassName(''); setSelectedYearId(''); setClassModalOpen(false); fetchData();
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Academic Years</h2>
                    <button onClick={() => setYearModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        <Plus size={16} /> Add Year
                    </button>
                </div>
                <DataTable data={years} columns={[{ header: 'ID', accessor: 'id'}, { header: 'Year Label', accessor: 'yearLabel'}]} keyExtractor={(r) => r.id} />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">School Classes</h2>
                    <button onClick={() => setClassModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        <Plus size={16} /> Add Class
                    </button>
                </div>
                <DataTable data={classes} columns={[{ header: 'ID', accessor: 'id'}, { header: 'Class Name', accessor: 'name'}, { header: 'Academic Year', accessor: (r: any) => r.academicYear.yearLabel}]} keyExtractor={(r) => r.id} />
            </div>

            <Modal isOpen={isYearModalOpen} onClose={() => setYearModalOpen(false)} title="Create Academic Year">
                <form onSubmit={createYear} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Year Label (e.g. 2025-2026)</label>
                        <input type="text" required value={yearLabel} onChange={e => setYearLabel(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
                </form>
            </Modal>

            <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Create Class">
                <form onSubmit={createClass} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Class Name</label>
                        <input type="text" required value={className} onChange={e => setClassName(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Academic Year</label>
                        <select required value={selectedYearId} onChange={e => setSelectedYearId(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select a year</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.yearLabel}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
                </form>
            </Modal>
        </div>
    );
};
export default ClassManagement;
