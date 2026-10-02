import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ClassManagement: React.FC = () => {
    const [years, setYears] = useState<any[]>([]);
    const [schoolClasses, setSchoolClasses] = useState<any[]>([]);

    const [isYearModalOpen, setYearModalOpen] = useState(false);

    const [isEditYearModalOpen, setEditYearModalOpen] = useState(false);

    const [editingYearId, setEditingYearId] = useState<number | null>(null);

    
    const [yearLabel, setYearLabel] = useState('');
    const [batchName, setBatchName] = useState('');

    const [isClassModalOpen, setClassModalOpen] = useState(false);
    const [isEditClassModalOpen, setEditClassModalOpen] = useState(false);
    const [editingClassId, setEditingClassId] = useState<number | null>(null);
    const [className, setClassName] = useState('');
    const [academicYearId, setAcademicYearId] = useState<number | ''>('');


    const fetchData = async () => {
        const yRes = await client.get('/admin/academic-years');
        setYears(yRes.data);
        const cRes = await client.get('/admin/school-classes');
        setSchoolClasses(cRes.data);
    };

    useEffect(() => { fetchData(); }, []);

    const createYear = async (e: React.FormEvent) => {
        e.preventDefault();
        await client.post('/admin/academic-years', { yearLabel, batchName });
        setYearLabel(''); setBatchName(''); setYearModalOpen(false); fetchData();
    };



    const handleEditYearClick = (year: any) => {
        setEditingYearId(year.id);
        setYearLabel(year.yearLabel);
        setBatchName(year.batchName || '');
        setEditYearModalOpen(true);
    };

    const handleEditYearSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await client.put(`/admin/academic-years/${editingYearId}`, { yearLabel, batchName });
        setYearLabel(''); setBatchName(''); setEditingYearId(null); setEditYearModalOpen(false); fetchData();
    };

    const handleDeleteYear = async (id: number) => {
        if (!window.confirm("Delete this academic year?")) return;
        try {
            await client.delete(`/admin/academic-years/${id}`);
            fetchData();
        } catch (err) {
            alert("Delete failed. It may be in use.");
        }
    };

    const createClass = async (e: React.FormEvent) => {
        e.preventDefault();
        await client.post('/admin/school-classes', { name: className, academicYearId: Number(academicYearId) });
        setClassName(''); setAcademicYearId(''); setClassModalOpen(false); fetchData();
    };

    const handleEditClassClick = (cls: any) => {
        setEditingClassId(cls.id);
        setClassName(cls.name);
        setAcademicYearId(cls.academicYearId);
        setEditClassModalOpen(true);
    };

    const handleEditClassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await client.put(`/admin/school-classes/${editingClassId}`, { name: className, academicYearId: Number(academicYearId) });
        setClassName(''); setAcademicYearId(''); setEditingClassId(null); setEditClassModalOpen(false); fetchData();
    };

    const handleDeleteClass = async (id: number) => {
        if (!window.confirm("Delete this class?")) return;
        try {
            await client.delete(`/admin/school-classes/${id}`);
            fetchData();
        } catch (err) {
            alert("Delete failed. It may be in use.");
        }
    };



    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Academic Years</h2>
                    <button onClick={() => setYearModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary-dark">
                        <Plus size={16} /> Add Year
                    </button>
                </div>
                <DataTable data={years} columns={[
                    { header: 'ID', accessor: 'id'}, 
                    { header: 'Year Label', accessor: 'yearLabel'},
                    { header: 'Batch Name', accessor: 'batchName'},
                    { header: 'Actions', accessor: (r: any) => (
                        <div className="flex gap-2">
                            <button onClick={() => handleEditYearClick(r)} className="text-primary hover:text-primary-dark"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteYear(r.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                        </div>
                    )}
                ]} keyExtractor={(r) => r.id} />
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Classes / Groups</h2>
                    <button onClick={() => setClassModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary-dark">
                        <Plus size={16} /> Add Class
                    </button>
                </div>
                <DataTable data={schoolClasses} columns={[
                    { header: 'ID', accessor: 'id'}, 
                    { header: 'Class Name', accessor: 'name'},
                    { header: 'Batch / Year', accessor: (r: any) => `${r.batchName} (${r.yearLabel})`},
                    { header: 'Actions', accessor: (r: any) => (
                        <div className="flex gap-2">
                            <button onClick={() => handleEditClassClick(r)} className="text-primary hover:text-primary-dark"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteClass(r.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                        </div>
                    )}
                ]} keyExtractor={(r) => r.id} />
            </div>



            <Modal isOpen={isYearModalOpen} onClose={() => setYearModalOpen(false)} title="Create Academic Year">
                <form onSubmit={createYear} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Year Label (e.g. 2025-2026)</label>
                        <input type="text" required value={yearLabel} onChange={e => setYearLabel(e.target.value)} className="modern-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Batch Name (e.g. Batch 2025)</label>
                        <input type="text" required value={batchName} onChange={e => setBatchName(e.target.value)} className="modern-input" />
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Create</button>
                </form>
            </Modal>



            <Modal isOpen={isEditYearModalOpen} onClose={() => {setEditYearModalOpen(false); setYearLabel(''); setBatchName(''); setEditingYearId(null);}} title="Edit Academic Year">
                <form onSubmit={handleEditYearSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Year Label (e.g. 2025-2026)</label>
                        <input type="text" required value={yearLabel} onChange={e => setYearLabel(e.target.value)} className="modern-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Batch Name (e.g. Batch 2025)</label>
                        <input type="text" required value={batchName} onChange={e => setBatchName(e.target.value)} className="modern-input" />
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Save Changes</button>
                </form>
            </Modal>

            <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Create Class / Group">
                <form onSubmit={createClass} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Class Name (e.g. Group 1, Section A)</label>
                        <input type="text" required value={className} onChange={e => setClassName(e.target.value)} className="modern-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Academic Year (Batch)</label>
                        <select required value={academicYearId} onChange={e => setAcademicYearId(Number(e.target.value))} className="modern-input">
                            <option value="">Select a batch...</option>
                            {years.map(y => (
                                <option key={y.id} value={y.id}>{y.batchName} ({y.yearLabel})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Create</button>
                </form>
            </Modal>

            <Modal isOpen={isEditClassModalOpen} onClose={() => {setEditClassModalOpen(false); setClassName(''); setAcademicYearId(''); setEditingClassId(null);}} title="Edit Class / Group">
                <form onSubmit={handleEditClassSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Class Name (e.g. Group 1, Section A)</label>
                        <input type="text" required value={className} onChange={e => setClassName(e.target.value)} className="modern-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Academic Year (Batch)</label>
                        <select required value={academicYearId} onChange={e => setAcademicYearId(Number(e.target.value))} className="modern-input">
                            <option value="">Select a batch...</option>
                            {years.map(y => (
                                <option key={y.id} value={y.id}>{y.batchName} ({y.yearLabel})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Save Changes</button>
                </form>
            </Modal>


        </div>
    );
};
export default ClassManagement;
