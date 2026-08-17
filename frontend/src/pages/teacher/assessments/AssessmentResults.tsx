import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function AssessmentResults() {
    const { id } = useParams();
    const [submissions, setSubmissions] = useState<any[]>([]);
    
    useEffect(() => {
        if (id) {
            assessmentApi.getAssessmentSubmissions(Number(id)).then(setSubmissions);
        }
    }, [id]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Assessment Results</h1>
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
                                    <Link to={`/teacher/submissions/${sub.id}`} className="text-blue-600 hover:underline text-sm font-medium">Review</Link>
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
