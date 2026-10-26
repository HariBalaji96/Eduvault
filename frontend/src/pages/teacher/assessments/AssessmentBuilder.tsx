import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';
import api from '../../../api/client';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AssessmentBuilder() {
    const { id } = useParams();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [assessmentId, setAssessmentId] = useState<number | null>(null);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    
    // Step 1 Form
    const [title, setTitle] = useState('');
    const [classroomId, setClassroomId] = useState('');
    const [deadline, setDeadline] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [hasTimer, setHasTimer] = useState(false);
    const [durationMinutes, setDurationMinutes] = useState('');

    // Step 2 State
    const [assessmentData, setAssessmentData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'MCQ' | 'DESCRIPTIVE' | 'CODING'>('MCQ');

    // Add Question Form States
    const [qText, setQText] = useState('');
    const [qMarks, setQMarks] = useState('');
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    
    // MCQ specific
    const [mcqOptions, setMcqOptions] = useState([{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }]);
    
    // Descriptive specific
    const [modelAnswer, setModelAnswer] = useState('');

    // Coding specific
    const [problemStatement, setProblemStatement] = useState('');
    const [inputDescription, setInputDescription] = useState('');
    const [outputDescription, setOutputDescription] = useState('');
    const [constraints, setConstraints] = useState('');
    const [sampleInput, setSampleInput] = useState('');
    const [sampleOutput, setSampleOutput] = useState('');
    const [allowedLanguage, setAllowedLanguage] = useState('java,javascript');
    const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string; hidden: boolean }>>([
        { input: '', expectedOutput: '', hidden: false },
        { input: '', expectedOutput: '', hidden: true }
    ]);

    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const initialClassroomId = searchParams.get('classroomId');
        if (initialClassroomId) {
            setClassroomId(initialClassroomId);
        }

        api.get('/teacher/classrooms').then(res => setClassrooms(res.data));
        if (id) {
            setAssessmentId(Number(id));
            fetchAssessment(Number(id));
            setStep(2);
        }
    }, [id, location]);

    const fetchAssessment = async (id: number) => {
        const data = await assessmentApi.getTeacherAssessment(id);
        setAssessmentData(data);
    };

    const handleCreateDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        const marksNum = Number(totalMarks);
        if (isNaN(marksNum) || marksNum <= 0) {
            alert("Expected Total Marks must be a positive number.");
            return;
        }
        try {
            const data = await assessmentApi.createAssessment({
                title,
                classroomId: Number(classroomId),
                totalMarks: marksNum,
                deadline: deadline.length === 16 ? deadline + ':00' : deadline,
                durationMinutes: hasTimer ? Number(durationMinutes) : null
            });
            setAssessmentId(data.id);
            setAssessmentData(data);
            setStep(2);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to create draft");
        }
    };

    const handleAddMcqOption = () => {
        setMcqOptions([...mcqOptions, { optionText: '', isCorrect: false }]);
    };

    const handleRemoveMcqOption = (index: number) => {
        if (mcqOptions.length <= 2) {
            alert("An MCQ must have at least 2 options.");
            return;
        }
        setMcqOptions(mcqOptions.filter((_, i) => i !== index));
    };

    const currentMarks = assessmentData?.questions?.reduce((sum: number, q: any) => sum + q.marks, 0) || 0;
    const remainingMarks = assessmentData ? assessmentData.totalMarks - currentMarks : 0;

    const handleAddMcq = async () => {
        if (!assessmentId || isAddingQuestion) return;

        const textTrimmed = qText.trim();
        if (!textTrimmed) {
            alert("Please enter the question text.");
            return;
        }

        const marksNum = Number(qMarks);
        if (isNaN(marksNum) || marksNum <= 0) {
            alert("Please enter a valid positive number for marks.");
            return;
        }

        if (marksNum > remainingMarks + 0.001) {
            alert(`Question marks (${marksNum}) exceeds remaining allowed marks (${remainingMarks}). Total marks must not exceed ${assessmentData?.totalMarks}.`);
            return;
        }

        // Check for duplicate question text
        const isDuplicate = assessmentData?.questions?.some((q: any) => q.text.trim().toLowerCase() === textTrimmed.toLowerCase());
        if (isDuplicate) {
            alert("A question with this exact text has already been added to this assessment.");
            return;
        }

        if (mcqOptions.length < 2) {
            alert("Please provide at least 2 options.");
            return;
        }

        if (mcqOptions.some(opt => !opt.optionText.trim())) {
            alert("All options must have text filled in.");
            return;
        }

        if (!mcqOptions.some(opt => opt.isCorrect)) {
            alert("At least one option must be marked as correct.");
            return;
        }

        setIsAddingQuestion(true);
        try {
            await assessmentApi.addMcqQuestion(assessmentId, {
                text: textTrimmed,
                marks: marksNum,
                options: mcqOptions.map(o => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect }))
            });
            await fetchAssessment(assessmentId);
            setQText('');
            setQMarks('');
            setMcqOptions([{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }]);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to add MCQ question.");
        } finally {
            setIsAddingQuestion(false);
        }
    };

    const handleAddDescriptive = async () => {
        if (!assessmentId || isAddingQuestion) return;

        const textTrimmed = qText.trim();
        if (!textTrimmed) {
            alert("Please enter the question text.");
            return;
        }

        const marksNum = Number(qMarks);
        if (isNaN(marksNum) || marksNum <= 0) {
            alert("Please enter a valid positive number for marks.");
            return;
        }

        if (marksNum > remainingMarks + 0.001) {
            alert(`Question marks (${marksNum}) exceeds remaining allowed marks (${remainingMarks}). Total marks must not exceed ${assessmentData?.totalMarks}.`);
            return;
        }

        const isDuplicate = assessmentData?.questions?.some((q: any) => q.text.trim().toLowerCase() === textTrimmed.toLowerCase());
        if (isDuplicate) {
            alert("A question with this exact text has already been added to this assessment.");
            return;
        }

        if (!modelAnswer.trim()) {
            alert("Please provide a model answer for descriptive questions.");
            return;
        }

        setIsAddingQuestion(true);
        try {
            await assessmentApi.addDescriptiveQuestion(assessmentId, {
                text: textTrimmed,
                marks: marksNum,
                modelAnswer: modelAnswer.trim()
            });
            await fetchAssessment(assessmentId);
            setQText('');
            setQMarks('');
            setModelAnswer('');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to add descriptive question.");
        } finally {
            setIsAddingQuestion(false);
        }
    };

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: '', expectedOutput: '', hidden: false }]);
    };

    const handleRemoveTestCase = (index: number) => {
        if (testCases.length <= 1) {
            alert("At least one test case is required.");
            return;
        }
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleAddCoding = async () => {
        if (!assessmentId || isAddingQuestion) return;

        const textTrimmed = qText.trim();
        if (!textTrimmed) {
            alert("Please enter the question title/summary.");
            return;
        }

        const marksNum = Number(qMarks);
        if (isNaN(marksNum) || marksNum <= 0) {
            alert("Please enter a valid positive number for marks.");
            return;
        }

        if (marksNum > remainingMarks + 0.001) {
            alert(`Question marks (${marksNum}) exceeds remaining allowed marks (${remainingMarks}). Total marks must not exceed ${assessmentData?.totalMarks}.`);
            return;
        }

        const isDuplicate = assessmentData?.questions?.some((q: any) => q.text.trim().toLowerCase() === textTrimmed.toLowerCase());
        if (isDuplicate) {
            alert("A question with this exact title has already been added to this assessment.");
            return;
        }

        if (!problemStatement.trim()) {
            alert("Please provide the problem statement.");
            return;
        }

        if (testCases.length === 0) {
            alert("Please provide at least one test case.");
            return;
        }

        for (let i = 0; i < testCases.length; i++) {
            if (!testCases[i].expectedOutput.trim()) {
                alert(`Test case ${i + 1} must have an expected output.`);
                return;
            }
        }

        setIsAddingQuestion(true);
        try {
            await assessmentApi.addCodingQuestion(assessmentId, {
                text: textTrimmed,
                marks: marksNum,
                problemStatement: problemStatement.trim(),
                inputDescription: inputDescription.trim(),
                outputDescription: outputDescription.trim(),
                constraints: constraints.trim(),
                sampleInput: sampleInput.trim(),
                sampleOutput: sampleOutput.trim(),
                allowedLanguage,
                testCases: testCases.map(tc => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput.trim(),
                    hidden: tc.hidden
                }))
            });
            await fetchAssessment(assessmentId);
            setQText('');
            setQMarks('');
            setProblemStatement('');
            setInputDescription('');
            setOutputDescription('');
            setConstraints('');
            setSampleInput('');
            setSampleOutput('');
            setTestCases([
                { input: '', expectedOutput: '', hidden: false },
                { input: '', expectedOutput: '', hidden: true }
            ]);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to add coding question.");
        } finally {
            setIsAddingQuestion(false);
        }
    };

    const handlePublish = async () => {
        if (!assessmentId) return;

        if (Math.abs(currentMarks - assessmentData.totalMarks) > 0.001) {
            alert(`Cannot publish: Total marks of created questions (${currentMarks}) must equal expected total marks (${assessmentData.totalMarks}). Please adjust your questions.`);
            return;
        }

        if (!window.confirm("Are you sure you want to publish? Students will be able to see it.")) return;
        try {
            await assessmentApi.publishAssessment(assessmentId);
            alert("Assessment published successfully!");
            navigate('/teacher');
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to publish");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessment Builder</h1>

            {step === 1 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Step 1: Assessment Details</h2>
                    <form onSubmit={handleCreateDraft} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Classroom</label>
                            <select required className="w-full p-2 border rounded focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={classroomId} onChange={e => setClassroomId(e.target.value)}>
                                <option value="">Select a classroom...</option>
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Deadline</label>
                                <input required type="datetime-local" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={deadline} onChange={e => setDeadline(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Marks</label>
                                <input required type="number" min="1" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
                            </div>
                        </div>
                        
                        <div className="pt-2 border-t dark:border-gray-700">
                            <label className="flex items-center gap-3 cursor-pointer mb-3">
                                <input type="checkbox" className="w-5 h-5 text-primary rounded" checked={hasTimer} onChange={e => setHasTimer(e.target.checked)} />
                                <span className="font-medium text-gray-800 dark:text-gray-200">Enable Time Limit</span>
                            </label>
                            
                            {hasTimer && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Duration (Minutes)</label>
                                    <input required type="number" min="1" className="w-full md:w-1/2 p-2 border rounded focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="e.g. 60" />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition">Create Draft</button>
                    </form>
                </div>
            )}

            {step === 2 && assessmentData && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-primary/10 dark:bg-primary/30 p-5 rounded-xl border border-blue-100 dark:border-blue-800 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">{assessmentData.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Target Marks: <strong className="text-blue-700 dark:text-blue-300">{assessmentData.totalMarks}</strong></span>
                                <span className="text-gray-400">|</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Added: <strong className="text-primary-dark dark:text-primary">{currentMarks}</strong></span>
                                <span className="text-gray-400">|</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Remaining: <strong className={remainingMarks === 0 ? 'text-green-600 dark:text-green-400' : remainingMarks > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>{remainingMarks}</strong></span>
                                
                                {remainingMarks === 0 ? (
                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">✓ Target Marks Matched</span>
                                ) : remainingMarks > 0 ? (
                                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">⚠ Needs {remainingMarks} more marks</span>
                                ) : (
                                    <span className="px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-800">⚠ Exceeds by {Math.abs(remainingMarks)} marks</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium shadow-sm">
                                Back
                            </button>
                            {!assessmentData.publishedAt && (
                                <button 
                                    onClick={handlePublish} 
                                    disabled={remainingMarks !== 0}
                                    title={remainingMarks !== 0 ? `Total marks of created questions (${currentMarks}) must equal expected target marks (${assessmentData.totalMarks})` : 'Publish Assessment'}
                                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 size={18} /> Publish Assessment
                                </button>
                            )}
                        </div>
                    </div>

                    {assessmentData.publishedAt && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800 font-medium">
                            <AlertCircle size={20} className="inline mr-2" />
                            This assessment is published. You can view its details but cannot edit questions or settings.
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex border-b dark:border-gray-700">
                            {['MCQ', 'DESCRIPTIVE', 'CODING'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 py-4 text-center font-medium transition ${activeTab === tab ? 'bg-primary/10 dark:bg-blue-900/20 text-primary dark:text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {activeTab === 'CODING' ? 'Question Title / Summary' : 'Question Text'}
                                    </label>
                                    <textarea disabled={!!assessmentData.publishedAt} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[100px] disabled:opacity-50" value={qText} onChange={e => setQText(e.target.value)} />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium mb-1">Marks</label>
                                    <input disabled={!!assessmentData.publishedAt} type="number" min="1" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" value={qMarks} onChange={e => setQMarks(e.target.value)} />
                                </div>
                            </div>

                            {activeTab === 'MCQ' && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium mb-1">Options (Mark correct ones)</label>
                                    {mcqOptions.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input disabled={!!assessmentData.publishedAt} type="checkbox" className="w-5 h-5 text-primary disabled:opacity-50" checked={opt.isCorrect} onChange={e => {
                                                const newOpts = [...mcqOptions];
                                                newOpts[idx].isCorrect = e.target.checked;
                                                setMcqOptions(newOpts);
                                            }} />
                                            <input disabled={!!assessmentData.publishedAt} type="text" className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50" value={opt.optionText} onChange={e => {
                                                const newOpts = [...mcqOptions];
                                                newOpts[idx].optionText = e.target.value;
                                                setMcqOptions(newOpts);
                                            }} placeholder={`Option ${idx + 1}`} />
                                            <button disabled={!!assessmentData.publishedAt} onClick={() => handleRemoveMcqOption(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                    <button disabled={!!assessmentData.publishedAt} onClick={handleAddMcqOption} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"><Plus size={16} /> Add Option</button>
                                    
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <button disabled={!!assessmentData.publishedAt || isAddingQuestion} onClick={handleAddMcq} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isAddingQuestion ? 'Adding Question...' : 'Add MCQ Question'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'DESCRIPTIVE' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">Model Answer <span title="Used for AI evaluation later"><AlertCircle size={14} className="text-gray-400" /></span></label>
                                        <textarea disabled={!!assessmentData.publishedAt} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[100px] disabled:opacity-50" value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} />
                                    </div>
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <button disabled={!!assessmentData.publishedAt || isAddingQuestion} onClick={handleAddDescriptive} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isAddingQuestion ? 'Adding Question...' : 'Add Descriptive Question'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'CODING' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Problem Statement <span className="text-red-500">*</span></label>
                                        <textarea 
                                            disabled={!!assessmentData.publishedAt} 
                                            placeholder="Detailed description of the coding task..."
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[120px] disabled:opacity-50" 
                                            value={problemStatement} 
                                            onChange={e => setProblemStatement(e.target.value)} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Input Format Description</label>
                                            <textarea 
                                                disabled={!!assessmentData.publishedAt} 
                                                placeholder="e.g. First line contains integer N..."
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[80px] disabled:opacity-50" 
                                                value={inputDescription} 
                                                onChange={e => setInputDescription(e.target.value)} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Output Format Description</label>
                                            <textarea 
                                                disabled={!!assessmentData.publishedAt} 
                                                placeholder="e.g. Print the maximum sum..."
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[80px] disabled:opacity-50" 
                                                value={outputDescription} 
                                                onChange={e => setOutputDescription(e.target.value)} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Constraints</label>
                                        <textarea 
                                            disabled={!!assessmentData.publishedAt} 
                                            placeholder="e.g. 1 <= N <= 10^5, -1000 <= arr[i] <= 1000"
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[60px] disabled:opacity-50" 
                                            value={constraints} 
                                            onChange={e => setConstraints(e.target.value)} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Sample Input</label>
                                            <textarea 
                                                disabled={!!assessmentData.publishedAt} 
                                                placeholder="5\n1 2 3 4 5"
                                                className="w-full p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[80px] disabled:opacity-50" 
                                                value={sampleInput} 
                                                onChange={e => setSampleInput(e.target.value)} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Sample Output</label>
                                            <textarea 
                                                disabled={!!assessmentData.publishedAt} 
                                                placeholder="15"
                                                className="w-full p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600 min-h-[80px] disabled:opacity-50" 
                                                value={sampleOutput} 
                                                onChange={e => setSampleOutput(e.target.value)} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Allowed Programming Languages</label>
                                        <select 
                                            disabled={!!assessmentData.publishedAt}
                                            value={allowedLanguage}
                                            onChange={e => setAllowedLanguage(e.target.value)}
                                            className="w-full md:w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="java,javascript">Java & JavaScript (Recommended)</option>
                                            <option value="java">Java 17 Only</option>
                                            <option value="javascript">JavaScript Only</option>
                                            <option value="java,javascript,python,cpp">All Languages</option>
                                        </select>
                                    </div>

                                    {/* Test cases */}
                                    <div className="pt-4 border-t dark:border-gray-700 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Test Cases (LeetCode Evaluation Style)</h4>
                                                <p className="text-xs text-gray-500">Students run code against visible test cases; hidden test cases are used for final scoring.</p>
                                            </div>
                                            <button 
                                                disabled={!!assessmentData.publishedAt} 
                                                onClick={handleAddTestCase} 
                                                className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary dark:text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition disabled:opacity-50"
                                            >
                                                <Plus size={14} /> Add Test Case
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {testCases.map((tc, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Test Case #{idx + 1}</span>
                                                        <div className="flex items-center gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                                                <input 
                                                                    disabled={!!assessmentData.publishedAt}
                                                                    type="checkbox" 
                                                                    checked={tc.hidden} 
                                                                    onChange={e => {
                                                                        const updated = [...testCases];
                                                                        updated[idx].hidden = e.target.checked;
                                                                        setTestCases(updated);
                                                                    }}
                                                                    className="w-4 h-4 text-primary rounded" 
                                                                />
                                                                <span className={tc.hidden ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-500'}>
                                                                    {tc.hidden ? '🔒 Hidden Case' : '👁 Visible Sample'}
                                                                </span>
                                                            </label>
                                                            <button 
                                                                disabled={!!assessmentData.publishedAt} 
                                                                onClick={() => handleRemoveTestCase(idx)} 
                                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded disabled:opacity-50"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Standard Input</label>
                                                            <textarea 
                                                                disabled={!!assessmentData.publishedAt}
                                                                rows={2}
                                                                placeholder="Input passed to stdin..."
                                                                className="w-full p-2 font-mono text-xs border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                                                                value={tc.input} 
                                                                onChange={e => {
                                                                    const updated = [...testCases];
                                                                    updated[idx].input = e.target.value;
                                                                    setTestCases(updated);
                                                                }} 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Expected Output <span className="text-red-500">*</span></label>
                                                            <textarea 
                                                                disabled={!!assessmentData.publishedAt}
                                                                rows={2}
                                                                placeholder="Expected stdout output..."
                                                                className="w-full p-2 font-mono text-xs border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                                                                value={tc.expectedOutput} 
                                                                onChange={e => {
                                                                    const updated = [...testCases];
                                                                    updated[idx].expectedOutput = e.target.value;
                                                                    setTestCases(updated);
                                                                }} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <button 
                                            disabled={!!assessmentData.publishedAt || isAddingQuestion} 
                                            onClick={handleAddCoding} 
                                            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                        >
                                            {isAddingQuestion ? 'Adding Question...' : 'Add Coding Question'}
                                        </button>
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
                                            <span className="bg-primary/20 text-primary-dark dark:bg-primary/30 dark:text-primary px-2 py-0.5 rounded text-xs font-bold">{q.type}</span>
                                            <span className="text-sm font-medium text-gray-500">{q.marks} Marks</span>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium">{q.text}</p>
                                        {q.type === 'CODING' && q.codingDetails && (
                                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                                <p className="line-clamp-2 italic">{q.codingDetails.problemStatement}</p>
                                                <p><span className="font-semibold text-gray-400">Test Cases:</span> {q.testCases?.length || 0} ({q.testCases?.filter((t: any) => t.hidden)?.length || 0} hidden)</p>
                                            </div>
                                        )}
                                    </div>
                                    {!assessmentData.publishedAt && (
                                        <button onClick={async () => {
                                            await assessmentApi.deleteQuestion(q.id);
                                            if (assessmentId) fetchAssessment(assessmentId);
                                        }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18} /></button>
                                    )}
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
