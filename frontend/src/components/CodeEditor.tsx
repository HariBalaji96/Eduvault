import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, CheckCircle2, XCircle, AlertCircle, RefreshCw, TerminalSquare, Lightbulb } from 'lucide-react';
import { assessmentApi } from '../services/assessmentApi';

export interface CodeExecutionResult {
    compiled: boolean;
    compileError?: string;
    results: {
        testCaseId: number;
        passed: boolean;
        actualOutput: string;
        stderr: string;
        isHidden: boolean;
    }[];
}

interface CodeEditorProps {
    mode: 'practice' | 'assessment';
    questionId?: number;
    submissionId?: number;
    initialCode?: string;
    onRun: (code: string, language: string, input?: string) => Promise<CodeExecutionResult>;
    onSubmit?: (code: string, language: string) => Promise<CodeExecutionResult>;
}

const boilerplates: Record<string, string> = {
    python: `# Welcome to Code Editor!\n# You can run any code here to test it out.\nprint("Hello, World!")\n`,
    java: `// Welcome to Code Editor!\n// IMPORTANT: Do not change the class name from Main.\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
    cpp: `// Welcome to Code Editor!\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`
};

export default function CodeEditor({ mode, initialCode = '', onRun, onSubmit }: CodeEditorProps) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(initialCode || boilerplates['python']);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<CodeExecutionResult | null>(null);
    const [customInput, setCustomInput] = useState('');
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{timeComplexity: string, spaceComplexity: string, tips: string} | null>(null);

    useEffect(() => {
        // Update code to new boilerplate if it's empty, or if it matches any boilerplate, or matches initialCode
        if (!code || Object.values(boilerplates).includes(code) || code === initialCode) {
            setCode(boilerplates[language]);
        }
    }, [language]);

    const handleRun = async () => {
        setIsRunning(true);
        setResult(null);
        try {
            const res = await onRun(code, language, mode === 'practice' ? customInput : undefined);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult({ compiled: false, compileError: error.response?.data?.error || error.response?.data?.message || error.message || 'Execution failed', results: [] });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!onSubmit) return;
        setIsSubmitting(true);
        setResult(null);
        try {
            const res = await onSubmit(code, language);
            setResult(res);
        } catch (error: any) {
            console.error(error);
            setResult({ compiled: false, compileError: error.response?.data?.error || error.response?.data?.message || error.message || 'Submission failed', results: [] });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await assessmentApi.analyzeCode({ code, language });
            setAnalysisResult(res);
        } catch (error: any) {
            console.error("AI Analysis failed", error);
            alert("Failed to analyze code: " + (error.response?.data?.message || error.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const passedCount = result?.results?.filter(r => r.passed).length || 0;
    const totalCount = result?.results?.length || 0;

    return (
        <div className="flex flex-col h-full modern-card !bg-zinc-950 !border-zinc-800 font-sans shadow-2xl">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between bg-zinc-900 px-5 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TerminalSquare size={18} className="text-gray-400" />
                        <span className="font-semibold text-gray-200 tracking-wide text-sm">CODE EDITOR</span>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#1e1e1e] text-gray-300 border border-gray-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                        <option value="python">Python 3</option>
                        <option value="java">Java 17</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={isRunning || isSubmitting || isAnalyzing}
                        className="inline-flex items-center justify-center rounded-lg bg-indigo-600/20 px-4 py-1.5 text-sm font-semibold text-indigo-400 border border-indigo-500/30 transition-all hover:bg-indigo-600/30 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isAnalyzing ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Lightbulb size={16} className="mr-2" />}
                        Analyze
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting || isAnalyzing}
                        className="inline-flex items-center justify-center rounded-lg bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-gray-200 transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isRunning ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Play size={16} className="text-emerald-400 mr-2" />}
                        Run
                    </button>
                    {onSubmit && (
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark active:scale-[0.98] shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                            Submit
                        </button>
                    )}
                </div>
            </div>

            {/* Assessment Mode Banner */}
            {mode === 'assessment' && (
                <div className="bg-amber-900/50 border-b border-amber-800 px-4 py-2 flex items-center justify-center gap-2 text-amber-200 text-sm font-medium">
                    <AlertCircle size={16} />
                    <span>Assessment Mode — AI assistance disabled</span>
                </div>
            )}

            {/* Monaco Editor */}
            <div className="flex-1 relative min-h-0">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        scrollBeyondLastLine: false,
                        padding: { top: 16 }
                    }}
                />
            </div>

            {/* Custom Input for Practice Mode */}
            {mode === 'practice' && (
                <div className="bg-[#1e1e1e] border-t border-gray-800 p-2">
                    <span className="text-xs font-semibold text-gray-400 mb-1 block px-2 tracking-wide">CUSTOM INPUT</span>
                    <textarea 
                        className="w-full bg-[#2d2d2d] text-gray-300 font-mono text-sm p-2 rounded border border-gray-700 focus:outline-none focus:border-primary resize-y min-h-[60px]"
                        placeholder="Enter standard input here..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                    />
                </div>
            )}

            {/* Results Panel */}
            {result && (
                <div className="h-64 bg-[#1e1e1e] border-t border-gray-800 flex flex-col">
                    <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                        <span className="font-semibold text-gray-300 text-sm tracking-wide">
                            {mode === 'practice' ? 'OUTPUT' : 'EXECUTION RESULT'}
                        </span>
                        {result.compiled && mode === 'assessment' && (
                            <span className={`text-sm font-bold ${passedCount === totalCount ? 'text-green-400' : 'text-red-400'}`}>
                                {passedCount} / {totalCount} Test Cases Passed
                            </span>
                        )}
                    </div>
                    
                    <div className="p-4 overflow-y-auto flex-1 font-mono text-sm">
                        {!result.compiled ? (
                            <div className="text-red-400 whitespace-pre-wrap">
                                <span className="font-bold">Compilation Error:</span>
                                {'\n'}{result.compileError}
                            </div>
                        ) : mode === 'practice' ? (
                            <div className="space-y-2 text-gray-300 whitespace-pre-wrap break-all">
                                {result.results[0]?.stderr && (
                                    <div className="text-red-400 mb-2">{result.results[0].stderr}</div>
                                )}
                                {result.results[0]?.actualOutput || (result.results[0]?.stderr ? '' : '<No Output>')}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {result.results.map((tc, idx) => (
                                    <div key={tc.testCaseId || idx} className="border border-gray-800 rounded bg-[#252526] p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            {tc.passed ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                            <span className={`font-bold ${tc.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                Test Case {idx + 1}
                                            </span>
                                            {tc.isHidden && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded ml-2">Hidden</span>}
                                        </div>
                                        
                                        {/* In assessment mode, hide details of hidden test cases */}
                                        {mode === 'assessment' && tc.isHidden ? (
                                            <div className="text-gray-500 text-xs italic mt-1">Details hidden for assessment mode.</div>
                                        ) : (
                                            <div className="space-y-2 mt-2 text-xs">
                                                {tc.stderr && (
                                                    <div>
                                                        <span className="text-gray-500">Standard Error:</span>
                                                        <div className="text-red-400 bg-black/20 p-2 rounded mt-1 whitespace-pre-wrap">{tc.stderr}</div>
                                                    </div>
                                                )}
                                                {!tc.passed && (
                                                    <div>
                                                        <span className="text-gray-500">Actual Output:</span>
                                                        <div className="text-gray-300 bg-black/20 p-2 rounded mt-1 whitespace-pre-wrap break-all">{tc.actualOutput || '<Empty>'}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* AI Analysis Result Panel */}
            {analysisResult && (
                <div className="bg-zinc-900 border-t border-zinc-800 p-4">
                    <div className="flex items-center text-indigo-400 font-medium mb-3">
                        <Lightbulb size={18} className="mr-2" />
                        AI Analysis
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                            <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Time Complexity</div>
                            <div className="text-zinc-200 font-mono text-sm">{analysisResult.timeComplexity}</div>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg border border-zinc-800/50">
                            <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Space Complexity</div>
                            <div className="text-zinc-200 font-mono text-sm">{analysisResult.spaceComplexity}</div>
                        </div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
                        <div className="text-xs text-indigo-400 mb-2 uppercase tracking-wider font-semibold">Tips for Optimal Solution</div>
                        <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{analysisResult.tips}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
