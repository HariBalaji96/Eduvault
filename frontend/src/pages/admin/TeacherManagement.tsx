import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Papa from 'papaparse';
import { Plus, Upload, CheckCircle2, XCircle, Edit2, Trash2, Power } from 'lucide-react';

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    createdAt: string;
}

const TeacherManagement: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [bulkReport, setBulkReport] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchTeachers = async () => {
        try {
            const res = await client.get('/admin/teachers');
            setTeachers(res.data);
        } catch (err) {
            console.error("Failed to fetch teachers", err);
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/admin/teachers', { name: `${firstName} ${lastName}`.trim(), email, password });
            setCreateModalOpen(false);
            setFirstName(''); setLastName(''); setEmail(''); setPassword('');
            fetchTeachers();
        } catch (err) {
            console.error("Create failed", err);
            alert("Creation failed. Email might exist.");
        }
    };

    const handleEditClick = (teacher: Teacher) => {
        setEditingTeacherId(teacher.id);
        setFirstName(teacher.firstName || '');
        setLastName(teacher.lastName || '');
        setEmail(teacher.email);
        setPassword('');
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.put(`/admin/teachers/${editingTeacherId}`, { name: `${firstName} ${lastName}`.trim(), email, password });
            setEditModalOpen(false);
            setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setEditingTeacherId(null);
            fetchTeachers();
        } catch (err) {
            console.error("Edit failed", err);
            alert("Edit failed.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) return;
        try {
            await client.delete(`/admin/teachers/${id}`);
            fetchTeachers();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed. They might be linked to existing records.");
        }
    };

    const handleToggleStatus = async (teacher: Teacher) => {
        try {
            await client.patch(`/admin/teachers/${teacher.id}/status`, { active: !teacher.active });
            fetchTeachers();
        } catch (err) {
            console.error("Status update failed", err);
            alert("Failed to update status.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setBulkData(results.data);
                    setBulkReport(null);
                }
            });
        }
    };

    const handleBulkSubmit = async () => {
        setIsUploading(true);
        try {
            const res = await client.post('/admin/teachers/bulk', bulkData);
            setBulkReport(res.data);
            fetchTeachers();
        } catch (err) {
            console.error("Bulk upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Teacher },
        { header: 'Name', accessor: (row: Teacher) => `${row.firstName} ${row.lastName}`.trim() },
        { header: 'Email', accessor: 'email' as keyof Teacher },
        { header: 'Status', accessor: (row: Teacher) => (
            <span className={`px-2 py-1 text-xs rounded-full ${row.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.active ? 'Active' : 'Inactive'}
            </span>
        ) },
        { header: 'Joined', accessor: (row: Teacher) => new Date(row.createdAt).toLocaleDateString() },
        { header: 'Actions', accessor: (row: Teacher) => (
            <div className="flex gap-2">
                <button onClick={() => handleToggleStatus(row)} title={row.active ? "Deactivate" : "Activate"} className={`${row.active ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Power size={16} />
                </button>
                <button onClick={() => handleEditClick(row)} title="Edit" className="text-primary hover:text-primary-dark"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(row.id)} title="Delete" className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
            </div>
        ) },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
                <div className="flex gap-2">
                    <button onClick={() => setCreateModalOpen(true)} className="modern-button shadow-primary/20">
                        <Plus size={18} /> Add Teacher
                    </button>
                    <button onClick={() => {setBulkModalOpen(true); setBulkData([]); setBulkReport(null);}} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        <Upload size={18} /> Bulk Upload
                    </button>
                </div>
            </div>

            <DataTable data={teachers} columns={columns} keyExtractor={(s) => s.id} />

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Teacher">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="modern-input" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="modern-input" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="modern-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="modern-input" />
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Create</button>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Teacher">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="modern-input" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="modern-input" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="modern-input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password (Leave blank to keep current)</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="modern-input" />
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Save Changes</button>
                </form>
            </Modal>

            <Modal isOpen={isBulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Upload Teachers">
                {!bulkReport ? (
                    <div className="space-y-4">
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary-dark hover:file:bg-primary/20" />
                        <p className="text-xs text-gray-500">CSV must have headers: name, email, password</p>
                        
                        {bulkData.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm font-medium">Preview ({bulkData.length} rows found):</p>
                                <div className="max-h-40 overflow-auto border rounded p-2 text-sm">
                                    {bulkData.slice(0, 3).map((r, i) => <div key={i}>{r.name} ({r.email})</div>)}
                                    {bulkData.length > 3 && <div>...and {bulkData.length - 3} more</div>}
                                </div>
                                <button onClick={handleBulkSubmit} disabled={isUploading} className="mt-4 w-full bg-primary text-white p-2 rounded hover:bg-primary-dark disabled:opacity-50">
                                    {isUploading ? 'Uploading...' : 'Confirm Upload'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 /> <span>Successfully created: {bulkReport.created?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                            <XCircle /> <span>Skipped rows: {bulkReport.skipped?.length || 0}</span>
                        </div>
                        {bulkReport.skipped?.length > 0 && (
                            <div className="mt-2 max-h-60 overflow-auto border rounded p-2 text-sm bg-red-50 dark:bg-red-900/20">
                                {bulkReport.skipped.map((s: any, idx: number) => (
                                    <div key={idx} className="mb-2 pb-2 border-b border-red-200 last:border-0">
                                        <p className="font-semibold">{s.reason}</p>
                                        <p className="text-xs opacity-80">{JSON.stringify(s.row)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
export default TeacherManagement;
