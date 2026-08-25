import React from 'react';
import CodeEditor from '../../../components/CodeEditor';
import { assessmentApi } from '../../../services/assessmentApi';

export default function PracticePage() {
    
    const handleRun = async (code: string, language: string, input?: string) => {
        // executePractice endpoint expects only language and code for practice
        return await assessmentApi.executePractice({
            language,
            code,
            input
        });
    };

    return (
        <div className="h-full flex overflow-hidden bg-[#1e1e1e] font-sans">
            {/* Full Screen Code Editor for Practice */}
            <div className="w-full p-4 flex flex-col">
                <CodeEditor 
                    mode="practice" 
                    onRun={handleRun} 
                />
            </div>
        </div>
    );
}
