import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ResultView() {
    const { id } = useParams();

    return (
        <div className="p-8 max-w-4xl mx-auto text-center mt-20">
            <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="w-24 h-24 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Assessment Submitted!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                    Great job! Your answers have been saved securely. Your final score will be available in the results section once the teacher completes evaluation.
                </p>
                <Link to="/student/assessments" className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 hover:scale-105 transition shadow-lg">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
