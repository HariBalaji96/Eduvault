import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Modal from '../../components/Modal';
import { Plus, Book } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [schoolClassId, setSchoolClassId] = useState('');
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);

    const fetchClassrooms = async () => {
        try {
            const res = await client.get('/teacher/classrooms');
            setClassrooms(res.data);
        } catch (err) {
            console.error("Failed to fetch classrooms", err);
        }
    };

    const fetchSchoolClasses = async () => {
        try {
            const res = await client.get('/admin/classes');
            setAvailableClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClassrooms();
        fetchSchoolClasses();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/teacher/classrooms', { name, subject, description, schoolClassId: Number(schoolClassId) });
            setModalOpen(false);
            setName(''); setSubject(''); setDescription(''); setSchoolClassId('');
            fetchClassrooms();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classrooms</h1>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <Plus size={20} /> Create Classroom
                </button>
            </div>

            {classrooms.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Book size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">You don't have any classrooms yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map(c => (
                        <Link to={`/teacher/classrooms/${c.id}`} key={c.id} className="block group">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex flex-col justify-end relative">
                                    <h2 className="text-xl font-bold text-white truncate">{c.name}</h2>
                                    <p className="text-blue-100 text-sm truncate">{c.subject}</p>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">{c.description || 'No description provided.'}</p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span>Class: {c.schoolClassName}</span>
                                        <span className="mx-2">•</span>
                                        <span>Owner: {c.createdByName}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Create Classroom">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Classroom Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Subject</label>
                        <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target School Class</label>
                        <select required value={schoolClassId} onChange={e => setSchoolClassId(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600">
                            <option value="">Select a class</option>
                            {availableClasses.map(ac => <option key={ac.id} value={ac.id}>{ac.name} ({ac.academicYear.yearLabel})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 min-h-[80px]" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
                </form>
            </Modal>
        </div>
    );
};
export default TeacherDashboard;
