import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';
import api from '../../../services/api';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssessmentBuilder() {
    const [step, setStep] = useState(1);
    const [assessmentId, setAssessmentId] = useState<number | null>(null);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    
    // Step 1 Form
    const [title, setTitle] = useState('');
    const [classroomId, setClassroomId] = useState('');
    const [deadline, setDeadline] = useState('');
    const [totalMarks, setTotalMarks] = useState('');

    // Step 2 State
    const [assessmentData, setAssessmentData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'MCQ' | 'DESCRIPTIVE' | 'CODING'>('MCQ');

    // Add Question Form States
    const [qText, setQText] = useState('');
    const [qMarks, setQMarks] = useState('');
    
    // MCQ specific
    const [mcqOptions, setMcqOptions] = useState([{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }]);
    
    // Descriptive specific
    const [modelAnswer, setModelAnswer] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/teacher/classrooms').then(res => setClassrooms(res.data));
    }, []);

    const fetchAssessment = async (id: number) => {
        const data = await assessmentApi.getTeacherAssessment(id);
        setAssessmentData(data);
    };

    const handleCreateDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await assessmentApi.createAssessment({
                title,
                classroomId: Number(classroomId),
                totalMarks: Number(totalMarks),
                deadline: new Date(deadline).toISOString()
            });
            setAssessmentId(data.id);
            setAssessmentData(data);
            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Failed to create draft");
        }
    };

    const handleAddMcqOption = () => {
        setMcqOptions([...mcqOptions, { optionText: '', isCorrect: false }]);
    };

    const handleRemoveMcqOption = (index: number) => {
        setMcqOptions(mcqOptions.filter((_, i) => i !== index));
    };

    const handleAddMcq = async () => {
        if (!assessmentId) return;
        try {
            await assessmentApi.addMcqQuestion(assessmentId, {
                text: qText,
                marks: Number(qMarks),
                options: mcqOptions
            });
            await fetchAssessment(assessmentId);
            setQText(''); setQMarks(''); setMcqOptions([{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddDescriptive = async () => {
        if (!assessmentId) return;
        try {
            await assessmentApi.addDescriptiveQuestion(assessmentId, {
                text: qText,
                marks: Number(qMarks),
                modelAnswer
            });
            await fetchAssessment(assessmentId);
            setQText(''); setQMarks(''); setModelAnswer('');
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublish = async () => {
        if (!assessmentId) return;
        if (!window.confirm("Are you sure you want to publish? Students will be able to see it.")) return;
        try {
            await assessmentApi.publishAssessment(assessmentId);
            alert("Assessment published successfully!");
            navigate('/teacher');
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to publish");
        }
    };

    const currentMarks = assessmentData?.questions?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessment Builder</h1>

            {step === 1 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Step 1: Assessment Details</h2>
                    <form onSubmit={handleCreateDraft} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Classroom</label>
                            <select required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={classroomId} onChange={e => setClassroomId(e.target.value)}>
                                <option value="">Select a classroom...</option>
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Deadline</label>
                                <input required type="datetime-local" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={deadline} onChange={e => setDeadline(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Marks</label>
                                <input required type="number" min="1" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
                            </div>
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Create Draft</button>
                    </form>
                </div>
            )}

            {step === 2 && assessmentData && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">{assessmentData.title}</h2>
                            <p className="text-blue-700 dark:text-blue-300 text-sm">Target Marks: {assessmentData.totalMarks} | Current: {currentMarks}</p>
                        </div>
                        <button onClick={handlePublish} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-sm">
                            <CheckCircle2 size={18} /> Publish Assessment
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex border-b dark:border-gray-700">
                            {['MCQ', 'DESCRIPTIVE', 'CODING'].map(tab => (
                                <button
                                    key={tab}
                                    disabled={tab === 'CODING'}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 py-4 text-center font-medium transition ${activeTab === tab ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'} ${tab === 'CODING' && 'opacity-50 cursor-not-allowed'}`}
                                >
                                    {tab} {tab === 'CODING' && '(Coming Soon)'}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Question Text</label>
                                    <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[100px]" value={qText} onChange={e => setQText(e.target.value)} />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium mb-1">Marks</label>
                                    <input type="number" min="1" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={qMarks} onChange={e => setQMarks(e.target.value)} />
                                </div>
                            </div>

                            {activeTab === 'MCQ' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium mb-1">Options (Mark correct ones)</label>
                                    {mcqOptions.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input type="checkbox" className="w-5 h-5 text-blue-600" checked={opt.isCorrect} onChange={e => {
                                                const newOpts = [...mcqOptions];
                                                newOpts[idx].isCorrect = e.target.checked;
                                                setMcqOptions(newOpts);
                                            }} />
                                            <input type="text" className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={opt.optionText} onChange={e => {
                                                const newOpts = [...mcqOptions];
                                                newOpts[idx].optionText = e.target.value;
                                                setMcqOptions(newOpts);
                                            }} placeholder={`Option ${idx + 1}`} />
                                            <button onClick={() => handleRemoveMcqOption(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddMcqOption} className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"><Plus size={16} /> Add Option</button>
                                    
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <button onClick={handleAddMcq} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition">Add MCQ Question</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'DESCRIPTIVE' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">Model Answer <AlertCircle size={14} className="text-gray-400" title="Used for AI evaluation later" /></label>
                                        <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[100px]" value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} />
                                    </div>
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <button onClick={handleAddDescriptive} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition">Add Descriptive Question</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">Added Questions ({assessmentData.questions?.length || 0})</h3>
                        <div className="space-y-4">
                            {assessmentData.questions?.map((q: any, i: number) => (
                                <div key={q.id} className="p-4 border rounded-lg dark:border-gray-700 flex justify-between gap-4 items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-bold text-gray-600 dark:text-gray-300">Q{i + 1}</span>
                                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-bold">{q.type}</span>
                                            <span className="text-sm font-medium text-gray-500">{q.marks} Marks</span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200">{q.text}</p>
                                    </div>
                                    <button onClick={async () => {
                                        await assessmentApi.deleteQuestion(q.id);
                                        fetchAssessment(assessmentId);
                                    }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18} /></button>
                                </div>
                            ))}
                            {(!assessmentData.questions || assessmentData.questions.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No questions added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
