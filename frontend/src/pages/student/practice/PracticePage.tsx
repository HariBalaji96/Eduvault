
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
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] w-full">
            {/* Full Screen Code Editor for Practice */}
            <CodeEditor 
                mode="practice" 
                onRun={handleRun} 
            />
        </div>
    );
}
