import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function AssessmentResults() {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [assessment, setAssessment] = useState<any>(null);
    const [publishing, setPublishing] = useState(false);
    
    useEffect(() => {
        if (id) {
            assessmentApi.getAssessmentSubmissions(Number(id)).then(setSubmissions);
            assessmentApi.getTeacherAssessment(Number(id)).then(setAssessment);
        }
    }, [id]);

    const handlePublishResults = async () => {
        if (!confirm("This will auto-evaluate all descriptive answers using AI and publish the final results to all students. Continue?")) return;
        setPublishing(true);
        try {
            await assessmentApi.publishResults(Number(id));
            alert("Results published successfully!");
            // Refresh
            assessmentApi.getAssessmentSubmissions(Number(id)).then(setSubmissions);
            assessmentApi.getTeacherAssessment(Number(id)).then(setAssessment);
        } catch (e: any) {
            alert(e.response?.data?.message || "Failed to publish results");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {assessment ? `Assessment Results: ${assessment.title}` : 'Assessment Results'}
                </h1>
                {assessment && (
                    <button 
                        onClick={handlePublishResults} 
                        disabled={publishing}
                        className="bg-primary text-white px-4 py-2 rounded font-bold hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {publishing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Publishing...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Publish Results & AI Evaluate
                            </>
                        )}
                    </button>
                )}
                {assessment && assessment.resultsPublishedAt && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded text-sm font-bold border border-green-200 dark:border-green-800">
                        Results Published
                    </span>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 text-sm font-medium text-gray-500">
                        <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Score</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {submissions.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{sub.studentName}</div>
                                    <div className="text-sm text-gray-500">{sub.studentEmail}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'SUBMITTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{sub.totalScore || 0}</td>
                                <td className="p-4">
                                    <Link to={`/teacher/submissions/${sub.id}`} className="text-primary hover:underline text-sm font-medium">Review</Link>
                                </td>
                            </tr>
                        ))}
                        {submissions.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No submissions yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
