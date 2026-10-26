import CodeEditor from '../../../components/CodeEditor';
import { assessmentApi } from '../../../services/assessmentApi';

export default function PracticePage() {
    const handleRun = async (code: string, language: string, input?: string) => {
        return await assessmentApi.executePractice({
            language,
            code,
            input
        });
    };

    return (
        <div className="h-full min-h-[580px] w-full flex flex-col flex-1">
            {/* Full Screen Flexible Code Editor for Practice */}
            <CodeEditor 
                mode="practice" 
                onRun={handleRun} 
            />
        </div>
    );
}
