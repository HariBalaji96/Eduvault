import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, CheckCircle2, XCircle, AlertCircle, RefreshCw, TerminalSquare } from 'lucide-react';

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

    const passedCount = result?.results?.filter(r => r.passed).length || 0;
    const totalCount = result?.results?.length || 0;

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-800 shadow-xl font-sans">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <TerminalSquare size={18} className="text-gray-400" />
                        <span className="font-semibold text-gray-200 tracking-wide text-sm">CODE EDITOR</span>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#1e1e1e] text-gray-300 border border-gray-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                        <option value="python">Python 3</option>
                        <option value="java">Java 17</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        className="flex items-center gap-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-gray-200 px-4 py-1.5 rounded transition text-sm font-medium disabled:opacity-50"
                    >
                        {isRunning ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} className="text-green-400" />}
                        Run
                    </button>
                    {onSubmit && (
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded transition shadow-sm text-sm font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
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
                        className="w-full bg-[#2d2d2d] text-gray-300 font-mono text-sm p-2 rounded border border-gray-700 focus:outline-none focus:border-indigo-500 resize-y min-h-[60px]"
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
        </div>
    );
}
