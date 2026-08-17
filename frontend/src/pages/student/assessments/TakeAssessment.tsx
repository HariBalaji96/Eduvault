import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function TakeAssessment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<any>(null);
    const [submissionId, setSubmissionId] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, any>>({});

    useEffect(() => {
        if (id) {
            assessmentApi.getStudentAssessmentDetail(Number(id)).then(data => {
                setAssessment(data);
                assessmentApi.startAssessment(Number(id)).then(subId => {
                    setSubmissionId(subId);
                });
            });
        }
    }, [id]);

    const handleMcqChange = (questionId: number, optionId: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: { mcqSelectedOptionId: optionId } }));
        if (submissionId) {
            assessmentApi.saveAnswer(submissionId, questionId, { mcqSelectedOptionId: optionId }).catch(console.error);
        }
    };

    const handleDescriptiveBlur = (questionId: number, text: string) => {
        if (submissionId) {
            assessmentApi.saveAnswer(submissionId, questionId, { descriptiveText: text }).catch(console.error);
        }
    };

    const handleSubmit = async () => {
        if (!submissionId) return;
        if (!window.confirm("Are you sure you want to submit? This action cannot be undone.")) return;
        try {
            await assessmentApi.submitAssessment(submissionId);
            navigate(`/student/assessments/${id}/result`);
        } catch (err) {
            console.error(err);
            alert("Failed to submit assessment");
        }
    };

    if (!assessment) return <div className="p-8 text-center text-gray-500 font-medium mt-20">Loading assessment...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 sticky top-0 z-10 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{assessment.title}</h1>
                        <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase mt-1">Assessment Mode</p>
                    </div>
                    <button onClick={handleSubmit} className="bg-white text-indigo-700 px-8 py-2.5 rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition shadow-sm">
                        Submit
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    {assessment.questions?.map((q: any, i: number) => (
                        <div key={q.id} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                                    <span className="font-bold mr-2 text-indigo-600 dark:text-indigo-400">Q{i + 1}.</span> {q.text}
                                </h3>
                                <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full font-bold whitespace-nowrap ml-6">{q.marks} Marks</span>
                            </div>

                            {q.type === 'MCQ' && (
                                <div className="space-y-3 mt-4">
                                    {q.options?.map((opt: any) => (
                                        <label key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 cursor-pointer transition-all">
                                            <input 
                                                type="radio" 
                                                name={`q-${q.id}`} 
                                                value={opt.id} 
                                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                checked={answers[q.id]?.mcqSelectedOptionId === opt.id}
                                                onChange={() => handleMcqChange(q.id, opt.id)}
                                            />
                                            <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">{opt.optionText}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.type === 'DESCRIPTIVE' && (
                                <div className="mt-4">
                                    <textarea 
                                        className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[180px] resize-y text-lg leading-relaxed shadow-inner"
                                        placeholder="Type your answer here..."
                                        value={answers[q.id]?.descriptiveText || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: { descriptiveText: e.target.value } }))}
                                        onBlur={(e) => handleDescriptiveBlur(q.id, e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400 mt-2 text-right font-medium">Answer autosaves when you click outside the text box.</p>
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
        </div>
    );
}
