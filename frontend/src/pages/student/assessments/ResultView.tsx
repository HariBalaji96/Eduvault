import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function ResultView() {
    const { id } = useParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            assessmentApi.getAssessmentResult(Number(id))
                .then(setResult)
                .catch(() => {
                    // Result might not exist or error occurred
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500 mt-20">Loading your result...</div>;

    if (!result) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center mt-20">
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Assessment Submitted!</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                        Your answers have been saved securely. If you cannot see your results yet, the teacher might still be evaluating them.
                    </p>
                    <Link to="/student/assessments" className="inline-block bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-dark hover:scale-105 transition shadow-lg">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6 mt-8 pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Result</h1>
                <Link to="/student/assessments" className="text-primary hover:underline font-medium">Back to Assessments</Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-lg">
                <div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Assessment</div>
                    <div className="font-bold text-2xl text-gray-900 dark:text-white mt-1">{result.assessmentTitle}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Score</div>
                    <div className="font-bold text-4xl text-primary dark:text-primary mt-1">{result.totalScore}</div>
                </div>
            </div>

            <div className="space-y-6 mt-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Your Answers</h2>
                {result.answers.map((ans: any, i: number) => (
                    <div key={ans.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between mb-6">
                            <span className="font-medium text-lg text-gray-900 dark:text-white">Q{i + 1}. {ans.questionText}</span>
                            <div className="text-right">
                                <span className="text-gray-500 text-sm whitespace-nowrap ml-4 block">{ans.questionMarks} Marks</span>
                                <span className={`font-bold mt-1 block ${ans.finalScore != null ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {ans.finalScore != null ? `Scored: ${ans.finalScore}` : 'Pending Evaluation'}
                                </span>
                            </div>
                        </div>

                        {ans.questionType === 'MCQ' && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border dark:border-gray-700">
                                <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your Answer</div>
                                <div className={`font-bold text-lg ${ans.isMcqCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {ans.mcqSelectedOptions && ans.mcqSelectedOptions.length > 0 
                                        ? ans.mcqSelectedOptions.map((o: any) => o.optionText).join(', ') 
                                        : 'Not Answered'} 
                                    {ans.mcqSelectedOptions && ans.mcqSelectedOptions.length > 0 && (
                                        <span className="ml-2 text-sm px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-sm">
                                            {ans.isMcqCorrect ? '✓ Correct' : '✗ Incorrect'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {ans.questionType === 'DESCRIPTIVE' && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border dark:border-gray-700">
                                    <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Your Answer</div>
                                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{ans.descriptiveText || 'Not Answered'}</div>
                                </div>
                                {ans.modelAnswerText && (
                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Model Answer</div>
                                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{ans.modelAnswerText}</div>
                                    </div>
                                )}
                                {ans.aiEvaluationNotes && (
                                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-800/30 flex gap-3">
                                        <div className="text-purple-600 dark:text-purple-400">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-purple-800 dark:text-purple-400 mb-1">AI Evaluation Feedback</div>
                                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ans.aiEvaluationNotes}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {ans.questionType === 'CODING' && (
                            <div className="space-y-4">
                                <div className="bg-gray-900 p-5 rounded-xl border border-gray-700">
                                    <div className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Submitted Code</div>
                                    <pre className="text-sm font-mono text-gray-200 overflow-x-auto p-3 bg-black/40 rounded-lg">
                                        <code>{ans.codeSubmitted || '// No code submitted'}</code>
                                    </pre>
                                </div>
                            </div>
                        )}

                        {ans.teacherFeedback && (
                            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50 flex gap-3">
                                <div className="text-yellow-600 dark:text-yellow-500">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-1">Teacher Feedback</div>
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ans.teacherFeedback}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
