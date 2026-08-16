import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Papa from 'papaparse';
import { Plus, Upload, CheckCircle2, XCircle } from 'lucide-react';

interface Teacher {
    id: number;
    name: string;
    email: string;
    active: boolean;
    createdAt: string;
}

const TeacherManagement: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isBulkModalOpen, setBulkModalOpen] = useState(false);
    
    const [name, setName] = useState('');
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
            await client.post('/admin/teachers', { name, email, password });
            setCreateModalOpen(false);
            setName(''); setEmail(''); setPassword('');
            fetchTeachers();
        } catch (err) {
            console.error("Create failed", err);
            alert("Creation failed. Email might exist.");
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
        { header: 'Name', accessor: 'name' as keyof Teacher },
        { header: 'Email', accessor: 'email' as keyof Teacher },
        { header: 'Status', accessor: (row: Teacher) => (
            <span className={`px-2 py-1 text-xs rounded-full ${row.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.active ? 'Active' : 'Inactive'}
            </span>
        ) },
        { header: 'Joined', accessor: (row: Teacher) => new Date(row.createdAt).toLocaleDateString() },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
                <div className="flex gap-2">
                    <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
                </form>
            </Modal>

            <Modal isOpen={isBulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Bulk Upload Teachers">
                {!bulkReport ? (
                    <div className="space-y-4">
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <p className="text-xs text-gray-500">CSV must have headers: name, email, password</p>
                        
                        {bulkData.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-sm font-medium">Preview ({bulkData.length} rows found):</p>
                                <div className="max-h-40 overflow-auto border rounded p-2 text-sm">
                                    {bulkData.slice(0, 3).map((r, i) => <div key={i}>{r.name} ({r.email})</div>)}
                                    {bulkData.length > 3 && <div>...and {bulkData.length - 3} more</div>}
                                </div>
                                <button onClick={handleBulkSubmit} disabled={isUploading} className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50">
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
