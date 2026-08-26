import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Papa from 'papaparse';
import { Plus, Upload, CheckCircle2, XCircle, Edit2, Trash2, Power } from 'lucide-react';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    createdAt: string;
    schoolClassId?: number;
    schoolClassName?: string;
}

const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [schoolClassId, setSchoolClassId] = useState<number | ''>('');
    const [schoolClasses, setSchoolClasses] = useState<any[]>([]);
    
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [bulkReport, setBulkReport] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchStudents = async () => {
        try {
            const res = await client.get('/admin/students');
            setStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await client.get('/admin/classes');
            setSchoolClasses(res.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    useEffect(() => { 
        fetchStudents(); 
        fetchClasses();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/admin/students', { name: `${firstName} ${lastName}`.trim(), email, password, schoolClassId: schoolClassId === '' ? null : schoolClassId });
            setCreateModalOpen(false);
            setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setSchoolClassId('');
            fetchStudents();
        } catch (err) {
            console.error("Create failed", err);
            alert("Creation failed. Email might exist.");
        }
    };

    const handleEditClick = (student: Student) => {
        setEditingStudentId(student.id);
        setFirstName(student.firstName || '');
        setLastName(student.lastName || '');
        setEmail(student.email);
        setPassword('');
        setSchoolClassId(student.schoolClassId || '');
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.put(`/admin/students/${editingStudentId}`, { name: `${firstName} ${lastName}`.trim(), email, password, schoolClassId: schoolClassId === '' ? null : schoolClassId });
            setEditModalOpen(false);
            setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setSchoolClassId(''); setEditingStudentId(null);
            fetchStudents();
        } catch (err) {
            console.error("Edit failed", err);
            alert("Edit failed.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await client.delete(`/admin/students/${id}`);
            fetchStudents();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Delete failed. They might be linked to existing records.");
        }
    };

    const handleToggleStatus = async (student: Student) => {
        try {
            await client.patch(`/admin/students/${student.id}/status`, { active: !student.active });
            fetchStudents();
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
            const res = await client.post('/admin/students/bulk', bulkData);
            setBulkReport(res.data);
            fetchStudents();
        } catch (err) {
            console.error("Bulk upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' as keyof Student },
        { header: 'Name', accessor: (row: Student) => `${row.firstName} ${row.lastName}`.trim() },
        { header: 'Email', accessor: 'email' as keyof Student },
        { header: 'Class', accessor: (row: Student) => row.schoolClassName || '-' },
        { header: 'Status', accessor: (row: Student) => (
            <span className={`px-2 py-1 text-xs rounded-full ${row.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.active ? 'Active' : 'Inactive'}
            </span>
        ) },
        { header: 'Joined', accessor: (row: Student) => new Date(row.createdAt).toLocaleDateString() },
        { header: 'Actions', accessor: (row: Student) => (
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
                <div className="flex gap-2">
                    <button onClick={() => setCreateModalOpen(true)} className="modern-button shadow-primary/20">
                        <Plus size={18} /> Add Student
                    </button>
                    <button onClick={() => {setBulkModalOpen(true); setBulkData([]); setBulkReport(null);}} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        <Upload size={18} /> Bulk Upload
                    </button>
                </div>
            </div>

            <DataTable data={students} columns={columns} keyExtractor={(s) => s.id} />

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Student">
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Class</label>
                        <select value={schoolClassId} onChange={e => setSchoolClassId(e.target.value === '' ? '' : Number(e.target.value))} className="modern-input">
                            <option value="">Select a class (optional)</option>
                            {schoolClasses.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Create</button>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student">
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Class</label>
                        <select value={schoolClassId} onChange={e => setSchoolClassId(e.target.value === '' ? '' : Number(e.target.value))} className="modern-input">
                            <option value="">Select a class (optional)</option>
                            {schoolClasses.map((cls) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="modern-button w-full mt-2 shadow-primary/20">Save Changes</button>
                </form>
            </Modal>

            <Modal isOpen={isBulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Upload Students">
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
export default StudentManagement;
