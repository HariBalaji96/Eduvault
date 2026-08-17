import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function AssessmentList() {
    const [assessments, setAssessments] = useState<any[]>([]);

    useEffect(() => {
        assessmentApi.getStudentAssessments().then(setAssessments);
    }, []);

    const getStatusBadge = (status: string) => {
        if (status === 'SUBMITTED') return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold shadow-sm">Completed</span>;
        if (status === 'IN_PROGRESS') return <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold shadow-sm">In Progress</span>;
        return <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold shadow-sm">Not Started</span>;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Assessments</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map(a => (
                    <div key={a.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{a.title}</h2>
                                {getStatusBadge(a.status)}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">Classroom: <span className="font-medium text-gray-700 dark:text-gray-300">{a.classroomName}</span></p>
                            <p className="text-sm text-gray-500 mb-6">Deadline: <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(a.deadline).toLocaleString()}</span></p>
                        </div>
                        <div>
                            {a.status === 'SUBMITTED' ? (
                                <Link to={`/student/assessments/${a.id}/result`} className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2.5 rounded-xl font-medium transition shadow-sm">View Result</Link>
                            ) : (
                                <Link to={`/student/assessments/${a.id}/take`} className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm">
                                    {a.status === 'IN_PROGRESS' ? 'Resume Assessment' : 'Start Assessment'}
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
                {assessments.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        You don't have any published assessments yet.
                    </div>
                )}
            </div>
        </div>
    );
}
