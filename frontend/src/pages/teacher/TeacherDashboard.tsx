import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Modal from '../../components/Modal';
import { Plus, Users, FolderOpen } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [studentIds, setStudentIds] = useState<number[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    
    // New states for the multi-step form and filtering
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(true);

    const fetchClassrooms = async () => {
        try {
            const res = await client.get('/teacher/classrooms');
            setClassrooms(res.data);
        } catch (err) {
            console.error("Failed to fetch classrooms", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await client.get('/teacher/classrooms/all-students');
            setAvailableStudents(res.data);
        } catch (err) {
            console.error("Failed to fetch students", err);
        }
    };

    useEffect(() => {
        fetchClassrooms();
        fetchStudents();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/teacher/classrooms', { name, subject, description, studentIds });
            setModalOpen(false);
            setName(''); setSubject(''); setDescription(''); setStudentIds([]);
            setStep(1);
            setSearchQuery('');
            fetchClassrooms();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">My Classrooms</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your virtual teaching spaces and assignments.</p>
                </div>
                <button onClick={() => setModalOpen(true)} className="modern-button shadow-primary/20">
                    <Plus size={18} className="mr-2" /> New Classroom
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="modern-card p-6 min-h-[220px] animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mb-6"></div>
                            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : classrooms.length === 0 ? (
                <div className="modern-card p-16 text-center border-dashed">
                    <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <FolderOpen size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No classrooms found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">Get started by creating your first virtual classroom to manage students and assignments.</p>
                    <button onClick={() => setModalOpen(true)} className="modern-button-outline">
                        Create your first classroom
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map(c => (
                        <Link to={`/teacher/classrooms/${c.id}`} key={c.id} className="block group">
                            <div className="modern-card p-6 h-full flex flex-col hover:-translate-y-1 hover:shadow-floating transition-all duration-300 hover:border-primary/30 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                <div className="flex justify-between items-start mb-6 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary-dark">
                                        {c.subject}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">{c.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 flex-1 mb-6">
                                    {c.description || 'No description provided.'}
                                </p>
                                <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-medium text-gray-500">

                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                        <Users size={14} className="text-gray-400" /> Owner
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => {
                setModalOpen(false);
                setStep(1);
            }} title={step === 1 ? "Create Classroom (1/2)" : "Select Students (2/2)"}>
                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleCreate} className="space-y-5 py-2">
                    {step === 1 && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Classroom Name</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="modern-input" placeholder="e.g. Advanced Physics 101" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Subject</label>
                                <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="modern-input" placeholder="e.g. Physics" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="modern-input min-h-[100px] resize-none" placeholder="Brief description of this classroom..." />
                            </div>
                            
                            <div className="pt-2 flex justify-end">
                                <button type="submit" className="modern-button shadow-primary/20">Next: Add Students</button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Select Students ({studentIds.length} selected)</label>
                                    <button 
                                        type="button" 
                                        className="text-xs text-primary hover:underline"
                                        onClick={() => setStudentIds(availableStudents.map(s => s.id))}
                                    >
                                        Select All
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    className="modern-input" 
                                    placeholder="Search by name, email, or roll no..." 
                                />
                                <div className="modern-input max-h-[300px] overflow-y-auto space-y-2 p-3 bg-gray-50 dark:bg-zinc-800/50">
                                    {availableStudents
                                        .filter(s => {
                                            const searchLower = searchQuery.toLowerCase();
                                            return (s.firstName?.toLowerCase().includes(searchLower) || 
                                                    s.lastName?.toLowerCase().includes(searchLower) || 
                                                    s.email?.toLowerCase().includes(searchLower) || 
                                                    s.registrationId?.toLowerCase().includes(searchLower));
                                        })
                                        .map(student => (
                                        <label key={student.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={studentIds.includes(student.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setStudentIds([...studentIds, student.id]);
                                                    } else {
                                                        setStudentIds(studentIds.filter(id => id !== student.id));
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {student.firstName} {student.lastName}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {student.registrationId || 'No Roll No'} • {student.email}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                    {availableStudents.length === 0 && (
                                        <div className="p-4 text-center text-sm text-gray-500">No students available in the system.</div>
                                    )}
                                    {availableStudents.length > 0 && availableStudents.filter(s => {
                                            const searchLower = searchQuery.toLowerCase();
                                            return (s.firstName?.toLowerCase().includes(searchLower) || 
                                                    s.lastName?.toLowerCase().includes(searchLower) || 
                                                    s.email?.toLowerCase().includes(searchLower) || 
                                                    s.registrationId?.toLowerCase().includes(searchLower));
                                        }).length === 0 && (
                                        <div className="p-4 text-center text-sm text-gray-500">No students found matching "{searchQuery}".</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setStep(1)} className="modern-button-outline flex-1">Back</button>
                                <button type="submit" className="modern-button flex-1 shadow-primary/20">Create Classroom</button>
                            </div>
                        </>
                    )}
                </form>
            </Modal>
        </div>
    );
};
export default TeacherDashboard;
