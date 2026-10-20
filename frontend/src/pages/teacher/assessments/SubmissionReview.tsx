import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function SubmissionReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<any>(null);
    const [evalForms, setEvalForms] = useState<Record<number, { score: string, feedback: string }>>({});

    const fetchDetail = () => {
        if (id) {
            assessmentApi.getSubmissionDetail(Number(id)).then(data => {
                setDetail(data);
                const initialForms: Record<number, { score: string, feedback: string }> = {};
                data.answers.forEach((ans: any) => {
                    if (ans.questionType === 'DESCRIPTIVE' || ans.questionType === 'CODING') {
                        initialForms[ans.id] = {
                            score: ans.finalScore?.toString() || ans.teacherOverrideScore?.toString() || '',
                            feedback: ans.teacherFeedback || ''
                        };
                    }
                });
                setEvalForms(initialForms);
            });
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleEvaluate = async (answerId: number) => {
        const form = evalForms[answerId];
        if (!form) return;
        try {
            await assessmentApi.evaluateAnswer(answerId, {
                score: Number(form.score),
                feedback: form.feedback
            });
            alert("Evaluation saved successfully!");
            navigate(`/teacher/assessments/${detail.assessmentId}/results`);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save evaluation");
        }
    };

    if (!detail) return <div className="p-8 text-gray-500">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review: {detail.studentName}</h1>
                <Link to={`/teacher/assessments/${detail.assessmentId}/results`} className="text-primary hover:underline font-medium">Back to Results</Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between shadow-sm">
                <div>
                    <div className="text-sm text-gray-500">Assessment</div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{detail.assessmentTitle}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Total Score</div>
                    <div className="font-bold text-2xl text-primary dark:text-primary">{detail.totalScore}</div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Answers</h2>
                {detail.answers.map((ans: any, i: number) => (
                    <div key={ans.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="font-medium text-gray-900 dark:text-white">Q{i + 1}. {ans.questionText}</span>
                            <span className="text-gray-500 text-sm whitespace-nowrap ml-4">{ans.questionMarks} Marks</span>
                        </div>
                        {ans.questionType === 'MCQ' && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm text-gray-500">Selected Option:</div>
                                    <span className={`font-bold text-sm ${ans.isMcqCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        Score: {ans.finalScore != null ? ans.finalScore : (ans.isMcqCorrect ? ans.questionMarks : 0)} / {ans.questionMarks}
                                    </span>
                                </div>
                                <div className={`font-medium ${ans.isMcqCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {ans.mcqSelectedOptions && ans.mcqSelectedOptions.length > 0 
                                        ? ans.mcqSelectedOptions.map((o: any) => o.optionText).join(', ') 
                                        : 'Not Answered'} 
                                    {ans.mcqSelectedOptions && ans.mcqSelectedOptions.length > 0 && (
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-white dark:bg-gray-800 border">
                                            {ans.isMcqCorrect ? '✓ Correct' : '✗ Incorrect'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {ans.questionType === 'DESCRIPTIVE' && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border dark:border-gray-700">
                                    <div className="text-sm text-gray-500 mb-1">Student Answer:</div>
                                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{ans.descriptiveText || 'Not Answered'}</div>
                                </div>
                                <div className="bg-primary/10 dark:bg-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                                    <div className="text-sm text-primary dark:text-primary mb-1 font-medium">Model Answer:</div>
                                    <div className="whitespace-pre-wrap text-blue-900 dark:text-blue-100">{ans.modelAnswerText}</div>
                                </div>
                                {ans.aiEvaluationNotes && (
                                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded border border-purple-100 dark:border-purple-800/30 flex gap-3 mt-4">
                                        <div className="text-purple-600 dark:text-purple-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-purple-800 dark:text-purple-400 mb-1">
                                                AI Evaluation (Score: {ans.aiScore}/{ans.questionMarks})
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{ans.aiEvaluationNotes}</div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manual Evaluation</h4>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-1/4">
                                            <label className="block text-xs text-gray-500 mb-1">Score (Out of {ans.questionMarks})</label>
                                            <input 
                                                type="number" 
                                                step="0.5"
                                                max={ans.questionMarks}
                                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                value={evalForms[ans.id]?.score || ''}
                                                onChange={e => setEvalForms(prev => ({ ...prev, [ans.id]: { ...prev[ans.id], score: e.target.value } }))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Feedback</label>
                                            <textarea 
                                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                rows={2}
                                                value={evalForms[ans.id]?.feedback || ''}
                                                onChange={e => setEvalForms(prev => ({ ...prev, [ans.id]: { ...prev[ans.id], feedback: e.target.value } }))}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleEvaluate(ans.id)}
                                        className="mt-3 bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary-dark transition"
                                    >
                                        Save Evaluation
                                    </button>
                                </div>
                            </div>
                        )}
                        {ans.questionType === 'CODING' && (
                            <div className="space-y-4">
                                <div className="bg-gray-900 p-4 rounded border border-gray-700">
                                    <div className="text-sm text-gray-400 mb-2">Submitted Code:</div>
                                    <pre className="text-sm font-mono text-gray-100 overflow-x-auto p-2 bg-black/30 rounded">
                                        <code>{ans.codeSubmitted || '// No code submitted'}</code>
                                    </pre>
                                </div>
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manual Evaluation</h4>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-1/4">
                                            <label className="block text-xs text-gray-500 mb-1">Score (Out of {ans.questionMarks})</label>
                                            <input 
                                                type="number" 
                                                step="0.5"
                                                max={ans.questionMarks}
                                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                value={evalForms[ans.id]?.score || ''}
                                                onChange={e => setEvalForms(prev => ({ ...prev, [ans.id]: { ...prev[ans.id], score: e.target.value } }))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Feedback</label>
                                            <textarea 
                                                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                rows={2}
                                                value={evalForms[ans.id]?.feedback || ''}
                                                onChange={e => setEvalForms(prev => ({ ...prev, [ans.id]: { ...prev[ans.id], feedback: e.target.value } }))}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleEvaluate(ans.id)}
                                        className="mt-3 bg-primary text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-primary-dark transition"
                                    >
                                        Save Evaluation
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
