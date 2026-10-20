import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';
import CodeEditor from '../../../components/CodeEditor';

export default function TakeAssessment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<any>(null);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const enterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
            setIsFullscreen(true);
        } catch (err) {
            console.error("Error attempting to enable fullscreen:", err);
            alert("Please allow fullscreen to take this assessment.");
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                alert("Warning: You have exited fullscreen! You must remain in fullscreen mode during the assessment. Click OK to return to the assessment.");
            } else {
                setIsFullscreen(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (id) {
            assessmentApi.getStudentAssessmentDetail(Number(id)).then(data => {
                setAssessment(data);
                if (data.durationMinutes) {
                    setTimeLeft(data.durationMinutes * 60);
                }
                assessmentApi.startAssessment(Number(id)).then(subId => {
                    setSubmissionId(subId);
                });
            });
        }
    }, [id]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            handleSubmit(true);
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleMcqChange = (questionId: number, optionId: number, isMultiple: boolean) => {
        const prevAnswers = answers[questionId]?.mcqSelectedOptionIds || [];
        let newAnswers: number[] = [];
        if (isMultiple) {
            if (prevAnswers.includes(optionId)) {
                newAnswers = prevAnswers.filter((id: number) => id !== optionId);
            } else {
                newAnswers = [...prevAnswers, optionId];
            }
        } else {
            newAnswers = [optionId];
        }
        
        setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], mcqSelectedOptionIds: newAnswers } }));

        if (submissionId) {
            assessmentApi.saveAnswer(submissionId, questionId, { mcqSelectedOptionIds: newAnswers }).catch(console.error);
        }
    };

    const handleDescriptiveBlur = (questionId: number, text: string) => {
        if (submissionId) {
            assessmentApi.saveAnswer(submissionId, questionId, { descriptiveText: text }).catch(console.error);
        }
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSubmit = async (isAutoSubmit = false) => {
        if (!submissionId) return;
        if (!isAutoSubmit) {
            setShowConfirmModal(true);
            return;
        }
        await performSubmit();
    };

    const performSubmit = async () => {
        if (!submissionId) return;
        try {
            await assessmentApi.submitAssessment(submissionId);
            navigate(`/student/assessments/${id}/result`);
        } catch (err) {
            console.error(err);
            alert("Failed to submit assessment");
        }
    };

    if (!assessment) return <div className="p-8 text-center text-gray-500 font-medium mt-20">Loading assessment...</div>;

    if (!isFullscreen) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center font-sans p-4">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100 dark:border-gray-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fullscreen Required</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        This assessment requires you to be in fullscreen mode. Exiting fullscreen during the exam may result in penalties or auto-submission.
                    </p>
                    <button onClick={enterFullscreen} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-primary-dark transition hover:-translate-y-0.5">
                        Enter Fullscreen & Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 sticky top-0 z-10 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
                        <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase mt-1">Assessment Mode</p>
                    </div>
                    <div className="flex items-center gap-6">
                        {timeLeft !== null && (
                            <div className="bg-white/20 px-4 py-2 rounded-full font-mono font-bold text-lg flex items-center gap-2">
                                <span className={timeLeft < 60 ? 'text-red-300 animate-pulse' : ''}>
                                    ⏱ {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                        <button onClick={() => handleSubmit(false)} className="bg-white text-primary-dark px-8 py-2.5 rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition shadow-sm">
                            Submit
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    {assessment.questions?.map((q: any, i: number) => (
                        <div key={q.id} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                                    <span className="font-bold mr-2 text-primary dark:text-primary">Q{i + 1}.</span> {q.text}
                                </h3>
                                <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full font-bold whitespace-nowrap ml-6">{q.marks} Marks</span>
                            </div>

                            {q.type === 'MCQ' && (
                                <div className="space-y-3 mt-4">
                                    {q.options?.map((opt: any) => (
                                        <label key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-primary hover:bg-primary/10 dark:hover:bg-indigo-900/10 cursor-pointer transition-all">
                                            <input 
                                                type={q.isMultipleAnswer ? "checkbox" : "radio"} 
                                                name={q.isMultipleAnswer ? `q-${q.id}-${opt.id}` : `q-${q.id}`} 
                                                value={opt.id} 
                                                className={`w-5 h-5 text-primary focus:ring-primary border-gray-300 ${q.isMultipleAnswer ? 'rounded' : ''}`}
                                                checked={answers[q.id]?.mcqSelectedOptionIds?.includes(opt.id) || false}
                                                onChange={() => handleMcqChange(q.id, opt.id, q.isMultipleAnswer)}
                                            />
                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">{opt.optionText}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.type === 'DESCRIPTIVE' && (
                                <div className="mt-4">
                                    <textarea 
                                        className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[180px] resize-y text-lg leading-relaxed shadow-inner"
                                        placeholder="Type your answer here..."
                                        value={answers[q.id]?.descriptiveText || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: { descriptiveText: e.target.value } }))}
                                        onBlur={(e) => handleDescriptiveBlur(q.id, e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-right font-medium">Answer autosaves when you click outside the text box.</p>
                                </div>
                            )}

                            {q.type === 'CODING' && (
                                <div className="mt-6 h-[600px]">
                                    <CodeEditor
                                        mode="assessment"
                                        questionId={q.id}
                                        submissionId={submissionId!}
                                        initialCode={answers[q.id]?.codeSubmitted || ''}
                                        onRun={(code, language) => assessmentApi.runCode(submissionId!, q.id, { language, code })}
                                        onSubmit={(code, language) => assessmentApi.submitCode(submissionId!, q.id, { language, code })}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {(!assessment.questions || assessment.questions.length === 0) && (
                        <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            This assessment has no questions.
                        </div>
                    )}
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Submit Assessment?</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Are you sure you want to submit? You will not be able to change your answers after this action.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    performSubmit();
                                }}
                                className="px-6 py-2 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark shadow-md transition"
                            >
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
