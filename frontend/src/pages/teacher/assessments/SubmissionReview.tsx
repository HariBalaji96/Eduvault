import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '../../../services/assessmentApi';

export default function SubmissionReview() {
    const { id } = useParams();
    const [detail, setDetail] = useState<any>(null);

    useEffect(() => {
        if (id) {
            assessmentApi.getSubmissionDetail(Number(id)).then(setDetail);
        }
    }, [id]);

    if (!detail) return <div className="p-8 text-gray-500">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review: {detail.studentName}</h1>
                <Link to={`/teacher/assessments/${detail.assessmentId}/results`} className="text-blue-600 hover:underline font-medium">Back to Results</Link>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between shadow-sm">
                <div>
                    <div className="text-sm text-gray-500">Assessment</div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{detail.assessmentTitle}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Total Score (MCQ)</div>
                    <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">{detail.totalScore}</div>
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
                                <div className="text-sm text-gray-500 mb-1">Selected Option:</div>
                                <div className={`font-medium ${ans.isMcqCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {ans.mcqSelectedOptionText || 'Not Answered'} 
                                    {ans.mcqSelectedOptionText && (ans.isMcqCorrect ? ' (Correct)' : ' (Incorrect)')}
                                </div>
                            </div>
                        )}
                        {ans.questionType === 'DESCRIPTIVE' && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border dark:border-gray-700">
                                    <div className="text-sm text-gray-500 mb-1">Student Answer:</div>
                                    <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{ans.descriptiveText || 'Not Answered'}</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800">
                                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">Model Answer:</div>
                                    <div className="whitespace-pre-wrap text-blue-900 dark:text-blue-100">{ans.modelAnswerText}</div>
                                </div>
                                <div className="text-yellow-600 dark:text-yellow-500 text-sm italic mt-2">Manual evaluation component is coming in the next phase!</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
