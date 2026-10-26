import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Play, 
    Send, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    RefreshCw, 
    TerminalSquare, 
    Lightbulb, 
    Flame, 
    Sparkles,
    ChevronDown,
    ChevronUp,
    Maximize2,
    Minimize2,
    X,
    Columns,
    Sliders
} from 'lucide-react';
import { assessmentApi } from '../services/assessmentApi';
import { streakApi } from '../services/streakApi';

export interface CodeExecutionResult {
    compiled: boolean;
    compileError?: string;
    results: {
        testCaseId: number;
        passed: boolean;
        input?: string;
        expectedOutput?: string;
        actualOutput: string;
        stderr: string;
        isHidden: boolean;
    }[];
    currentStreak?: number;
    highestStreak?: number;
    streakUpdated?: boolean;
    streakMessage?: string;
    marksAwarded?: number;
    totalMarks?: number;
    markPerTestCase?: number;
    correctTestCaseCount?: number;
    totalTestCaseCount?: number;
}

interface CodeEditorProps {
    mode: 'practice' | 'assessment';
    questionId?: number;
    submissionId?: number;
    initialCode?: string;
    onRun: (code: string, language: string, input?: string) => Promise<CodeExecutionResult>;
    onSubmit?: (code: string, language: string) => Promise<CodeExecutionResult>;
    onChange?: (code: string) => void;
}

const boilerplates: Record<string, string> = {
    java: `// Welcome to Code Editor!\n// IMPORTANT: Do not change the class name from Main.\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your solution here\n        System.out.println("Hello, World!");\n    }\n}\n`,
    javascript: `// Welcome to Code Editor!\n// Read standard input using fs if needed\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input || "Hello, World!");\n`,
    python: `# Welcome to Code Editor!\nimport sys\n# input_data = sys.stdin.read()\nprint("Hello, World!")\n`,
    cpp: `// Welcome to Code Editor!\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`
};

export default function CodeEditor({ mode, initialCode = '', onRun, onSubmit, onChange }: CodeEditorProps) {
    const [language, setLanguage] = useState('java');
    const [code, setCode] = useState(initialCode || boilerplates['java']);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<CodeExecutionResult | null>(null);
    const [customInput, setCustomInput] = useState('');
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{timeComplexity: string, spaceComplexity: string, tips: string} | null>(null);

    const [streakInfo, setStreakInfo] = useState<{ currentStreak: number; highestStreak: number; activeToday: boolean; message?: string } | null>(null);
    const [streakNotification, setStreakNotification] = useState<string | null>(null);

    // Resizable & Flexible UI states
    const [bottomHeight, setBottomHeight] = useState<number>(240);
    const [isBottomOpen, setIsBottomOpen] = useState<boolean>(mode === 'practice');
    const [isBottomMinimized, setIsBottomMinimized] = useState<boolean>(false);
    const [isMaximized, setIsMaximized] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'output' | 'analysis' | 'input'>(mode === 'practice' ? 'input' : 'output');
    const [splitView, setSplitView] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const startDragYRef = useRef<number>(0);
    const startHeightRef = useRef<number>(240);

    useEffect(() => {
        streakApi.getMyStreak()
            .then(s => {
                if (s) {
                    setStreakInfo({
                        currentStreak: s.currentStreak,
                        highestStreak: s.highestStreak,
                        activeToday: s.activeToday,
                        message: s.message
                    });
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!code || Object.values(boilerplates).includes(code) || code === initialCode) {
            const newCode = boilerplates[language] || '';
            setCode(newCode);
            onChange?.(newCode);
        }
    }, [language]);

    // Resizing drag event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        startDragYRef.current = e.clientY;
        startHeightRef.current = bottomHeight;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            startDragYRef.current = e.touches[0].clientY;
            startHeightRef.current = bottomHeight;
        }
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const deltaY = e.clientY - startDragYRef.current;
            // Dragging up increases bottom drawer height, dragging down decreases
            const newHeight = startHeightRef.current - deltaY;
            const minHeight = 90;
            const maxHeight = containerRect.height - 160; // Keep at least 160px for Monaco Editor
            const clamped = Math.max(minHeight, Math.min(newHeight, maxHeight));
            setBottomHeight(clamped);
            setIsBottomMinimized(false);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!containerRef.current || e.touches.length !== 1) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const deltaY = e.touches[0].clientY - startDragYRef.current;
            const newHeight = startHeightRef.current - deltaY;
            const minHeight = 90;
            const maxHeight = containerRect.height - 160;
            const clamped = Math.max(minHeight, Math.min(newHeight, maxHeight));
            setBottomHeight(clamped);
            setIsBottomMinimized(false);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    const handleRun = async () => {
        setIsRunning(true);
        setResult(null);
        setIsBottomOpen(true);
        setIsBottomMinimized(false);
        setActiveTab('output');
        try {
            const res = await onRun(code, language, mode === 'practice' ? customInput : undefined);
            setResult(res);
            setSelectedTestCaseIndex(0);

            if (res.currentStreak != null) {
                setStreakInfo({
                    currentStreak: res.currentStreak,
                    highestStreak: res.highestStreak ?? res.currentStreak,
                    activeToday: true,
                    message: res.streakMessage
                });
                setStreakNotification(`🔥 Daily streak maintained: ${res.currentStreak} day${res.currentStreak === 1 ? '' : 's'} in a row!`);
                setTimeout(() => setStreakNotification(null), 5000);
            }
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
        setIsBottomOpen(true);
        setIsBottomMinimized(false);
        setActiveTab('output');
        try {
            const res = await onSubmit(code, language);
            setResult(res);
            setSelectedTestCaseIndex(0);

            if (res.currentStreak != null) {
                setStreakInfo({
                    currentStreak: res.currentStreak,
                    highestStreak: res.highestStreak ?? res.currentStreak,
                    activeToday: true,
                    message: res.streakMessage
                });
                setStreakNotification(`🔥 Daily streak maintained: ${res.currentStreak} day${res.currentStreak === 1 ? '' : 's'} in a row!`);
                setTimeout(() => setStreakNotification(null), 5000);
            }
        } catch (error: any) {
            console.error(error);
            setResult({ compiled: false, compileError: error.response?.data?.error || error.response?.data?.message || error.message || 'Submission failed', results: [] });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnalyze = async () => {
        if (mode === 'assessment') {
            alert("AI Analysis is disabled during assessments.");
            return;
        }
        setIsAnalyzing(true);
        setIsBottomOpen(true);
        setIsBottomMinimized(false);
        setActiveTab('analysis');
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

    const normalizeText = (s?: string) => (s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const isCasePassed = (tc: { passed: boolean; expectedOutput?: string; actualOutput?: string; stderr?: string }) => {
        if (tc.passed) return true;
        if (tc.expectedOutput !== undefined && tc.actualOutput !== undefined && (!tc.stderr || tc.stderr.trim() === '')) {
            return normalizeText(tc.actualOutput) === normalizeText(tc.expectedOutput);
        }
        return false;
    };

    const passedCount = result?.results?.filter(isCasePassed).length || 0;
    const totalCount = result?.results?.length || 0;

    // Determine bottom height to apply
    const effectiveBottomHeight = isBottomMinimized ? 38 : (isMaximized ? '75%' : `${bottomHeight}px`);

    return (
        <div 
            ref={containerRef}
            className="flex flex-col h-full w-full modern-card !bg-zinc-950 !border-zinc-800 font-sans shadow-2xl relative overflow-hidden"
        >
            {/* Header / Toolbar */}
            <div className="flex flex-wrap items-center justify-between bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 gap-2 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <TerminalSquare size={17} className="text-primary" />
                        <span className="font-semibold text-gray-200 tracking-wide text-xs sm:text-sm">CODE EDITOR</span>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#1e1e1e] text-gray-300 border border-gray-700 rounded px-2.5 py-1 text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                        <option value="java">Java 17</option>
                        <option value="javascript">JavaScript (Node.js)</option>
                        <option value="python">Python 3</option>
                        <option value="cpp">C++</option>
                    </select>

                    {/* Live Streak Badge */}
                    {streakInfo && (
                        <div 
                            title={streakInfo.activeToday ? "Streak preserved for today!" : "Run code to preserve your daily streak!"}
                            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                                streakInfo.activeToday 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse'
                            }`}
                        >
                            <Flame size={13} className={streakInfo.currentStreak > 0 ? "fill-amber-400 text-amber-400" : "text-gray-400"} />
                            <span>{streakInfo.currentStreak}d Streak</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Panel Toggle Icon Button */}
                    <button
                        onClick={() => {
                            if (!isBottomOpen) {
                                setIsBottomOpen(true);
                                setIsBottomMinimized(false);
                            } else {
                                setIsBottomMinimized(prev => !prev);
                            }
                        }}
                        className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isBottomOpen && !isBottomMinimized
                                ? 'bg-zinc-800 text-gray-200 border-zinc-700'
                                : 'bg-transparent text-gray-400 hover:text-gray-200 border-transparent hover:bg-zinc-800'
                        }`}
                        title={isBottomOpen && !isBottomMinimized ? "Minimize Panel" : "Open Panel"}
                    >
                        <TerminalSquare size={16} />
                    </button>

                    {mode !== 'assessment' ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={isRunning || isSubmitting || isAnalyzing}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-400 border border-indigo-500/30 transition-all hover:bg-indigo-600/30 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                            {isAnalyzing ? <RefreshCw size={15} className="animate-spin mr-1.5" /> : <Lightbulb size={15} className="mr-1.5" />}
                            Analyze
                        </button>
                    ) : (
                        <span 
                            title="AI Analysis is disabled during assessments"
                            className="inline-flex items-center justify-center rounded-lg bg-zinc-800/60 px-2.5 py-1.5 text-xs font-medium text-zinc-500 border border-zinc-700/40 cursor-not-allowed select-none"
                        >
                            <Lightbulb size={13} className="mr-1 text-zinc-500" />
                            Analyze (Disabled)
                        </span>
                    )}

                    <button
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting || isAnalyzing}
                        title={mode === 'assessment' ? "Run code against sample test cases" : "Run code"}
                        className="inline-flex items-center justify-center rounded-lg bg-zinc-800 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-200 transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50 border border-zinc-700 cursor-pointer"
                    >
                        {isRunning ? <RefreshCw size={15} className="animate-spin mr-1.5" /> : <Play size={15} className="text-emerald-400 mr-1.5" />}
                        {mode === 'assessment' ? 'Run Cases' : 'Run'}
                    </button>

                    {onSubmit && (
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            title="Submit code for full evaluation"
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? <RefreshCw size={15} className="animate-spin mr-1.5" /> : <Send size={15} className="mr-1.5" />}
                            Submit
                        </button>
                    )}
                </div>
            </div>

            {/* Streak Toast Banner */}
            {streakNotification && (
                <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-amber-300 text-xs font-semibold shrink-0 animate-fade-in z-20">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400 animate-spin" />
                        <span>{streakNotification}</span>
                    </div>
                    <button 
                        onClick={() => setStreakNotification(null)}
                        className="text-amber-400/80 hover:text-amber-300 text-xs ml-4 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Assessment Mode Banner */}
            {mode === 'assessment' && (
                <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-1.5 flex items-center justify-between gap-2 text-amber-200 text-xs font-medium shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-400" />
                        <span>Assessment Mode — AI Analyze is disabled. Run code against sample cases or Submit code for evaluation.</span>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold">LeetCode Style</span>
                </div>
            )}

            {/* Monaco Editor Container - Guarantees minimum height and fills flexible space */}
            <div className="flex-1 relative min-h-[160px] overflow-hidden">
                <Editor
                    height="100%"
                    language={language === 'js' ? 'javascript' : language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => {
                        const updated = val || '';
                        setCode(updated);
                        onChange?.(updated);
                    }}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                        automaticLayout: true,
                        lineNumbersMinChars: 3,
                    }}
                />
            </div>

            {/* Resizable Divider Handle */}
            {isBottomOpen && !isBottomMinimized && (
                <div
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className={`h-2.5 bg-zinc-900 hover:bg-indigo-600/70 cursor-row-resize flex items-center justify-center transition-colors border-y border-zinc-800 select-none group relative z-20 shrink-0 ${
                        isDragging ? 'bg-indigo-600 border-indigo-500' : ''
                    }`}
                    title="Drag up or down to resize Code Editor / Bottom Panel"
                >
                    <div className="w-12 h-1 rounded-full bg-zinc-600 group-hover:bg-white group-hover:w-16 transition-all" />
                </div>
            )}

            {/* Bottom Panel (Tabbed, Collapsible & Flexible) */}
            {isBottomOpen && (
                <div 
                    style={{ height: effectiveBottomHeight }}
                    className="bg-[#18181b] border-t border-zinc-800 flex flex-col shrink-0 transition-[height] duration-75 relative z-10"
                >
                    {/* Bottom Panel Header / Tab Strip */}
                    <div className="h-9.5 bg-[#202023] px-3 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none">
                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                            {/* Execution Result Tab */}
                            <button
                                onClick={() => { setActiveTab('output'); setIsBottomMinimized(false); }}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'output' && !splitView
                                        ? 'bg-zinc-800 text-white shadow-xs'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                }`}
                            >
                                <TerminalSquare size={13} />
                                <span>Output</span>
                                {result && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                        !result.compiled 
                                            ? 'bg-red-500/20 text-red-400' 
                                            : mode === 'assessment' 
                                                ? (passedCount === totalCount ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')
                                                : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {mode === 'assessment' && result.compiled ? `${passedCount}/${totalCount}` : (result.compiled ? 'Success' : 'Error')}
                                    </span>
                                )}
                            </button>

                            {/* AI Analysis Tab */}
                            {mode !== 'assessment' && (
                                <button
                                    onClick={() => { setActiveTab('analysis'); setIsBottomMinimized(false); }}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === 'analysis' && !splitView
                                            ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-xs'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <Lightbulb size={13} className={analysisResult ? "text-indigo-400" : ""} />
                                    <span>AI Analysis</span>
                                    {isAnalyzing && <RefreshCw size={11} className="animate-spin text-indigo-400" />}
                                    {analysisResult && !isAnalyzing && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                                            {analysisResult.timeComplexity}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Custom Input Tab (Practice mode) */}
                            {mode === 'practice' && (
                                <button
                                    onClick={() => { setActiveTab('input'); setIsBottomMinimized(false); }}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === 'input' && !splitView
                                            ? 'bg-zinc-800 text-white shadow-xs'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <Sliders size={13} />
                                    <span>Custom Input</span>
                                    {customInput && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </button>
                            )}

                            {/* Split View button (if both result and analysis exist) */}
                            {mode !== 'assessment' && result && analysisResult && (
                                <button
                                    onClick={() => { setSplitView(prev => !prev); setIsBottomMinimized(false); }}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ml-1 cursor-pointer ${
                                        splitView 
                                            ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60' 
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }`}
                                    title="View Output and AI Analysis Side by Side"
                                >
                                    <Columns size={13} />
                                    <span>Side by Side</span>
                                </button>
                            )}
                        </div>

                        {/* Drawer Window Controls */}
                        <div className="flex items-center gap-1">
                            {/* Minimize / Expand Toggle */}
                            <button
                                onClick={() => setIsBottomMinimized(prev => !prev)}
                                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded transition-colors cursor-pointer"
                                title={isBottomMinimized ? "Expand Drawer" : "Minimize Drawer (100% Code Height)"}
                            >
                                {isBottomMinimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>

                            {/* Maximize Toggle */}
                            {!isBottomMinimized && (
                                <button
                                    onClick={() => setIsMaximized(prev => !prev)}
                                    className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded transition-colors cursor-pointer"
                                    title={isMaximized ? "Restore Height" : "Maximize Drawer Height"}
                                >
                                    {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                                </button>
                            )}

                            {/* Close Drawer Button */}
                            <button
                                onClick={() => setIsBottomOpen(false)}
                                className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 rounded transition-colors cursor-pointer"
                                title="Close Drawer"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Panel Content Area */}
                    {!isBottomMinimized && (
                        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs sm:text-sm">
                            {/* Side-by-Side Split View if enabled */}
                            {splitView && mode !== 'assessment' && result && analysisResult ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                    {/* Left: Output */}
                                    <div className="border border-zinc-800 rounded-lg p-3 bg-black/40 overflow-y-auto flex flex-col">
                                        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                            <span>Terminal Output</span>
                                            {result.compiled && <span className="text-emerald-400 font-bold">Passed</span>}
                                        </div>
                                        {!result.compiled ? (
                                            <div className="text-red-400 whitespace-pre-wrap">{result.compileError}</div>
                                        ) : (
                                            <div className="text-zinc-300 whitespace-pre-wrap break-all">
                                                {result.results[0]?.stderr && <div className="text-red-400 mb-1">{result.results[0].stderr}</div>}
                                                {result.results[0]?.actualOutput || (result.results[0]?.stderr ? '' : '<No Output>')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: AI Analysis */}
                                    <div className="border border-indigo-900/40 rounded-lg p-3 bg-indigo-950/20 overflow-y-auto">
                                        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Lightbulb size={14} />
                                            <span>AI Complexity Analysis</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="bg-black/30 p-2 rounded border border-indigo-900/30">
                                                <div className="text-[10px] text-zinc-400 uppercase">Time</div>
                                                <div className="text-zinc-200 font-bold text-xs">{analysisResult.timeComplexity}</div>
                                            </div>
                                            <div className="bg-black/30 p-2 rounded border border-indigo-900/30">
                                                <div className="text-[10px] text-zinc-400 uppercase">Space</div>
                                                <div className="text-zinc-200 font-bold text-xs">{analysisResult.spaceComplexity}</div>
                                            </div>
                                        </div>
                                        <div className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-black/20 p-2.5 rounded border border-zinc-800">
                                            {analysisResult.tips}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Tab 1: Execution Result / Output */}
                                    {activeTab === 'output' && (
                                        <div>
                                            {!result ? (
                                                <div className="text-zinc-500 py-4 text-center font-sans">
                                                    Click <span className="text-zinc-300 font-semibold">"Run"</span> to execute code against sample test cases.
                                                </div>
                                            ) : !result.compiled ? (
                                                <div className="text-red-400 whitespace-pre-wrap bg-red-950/20 border border-red-900/40 p-3 rounded-lg">
                                                    <span className="font-bold flex items-center gap-1.5 text-red-300 mb-1">
                                                        <AlertCircle size={15} /> Compilation Error:
                                                    </span>
                                                    {result.compileError}
                                                </div>
                                            ) : mode === 'practice' ? (
                                                <div className="space-y-2 text-zinc-300 whitespace-pre-wrap break-all bg-black/30 p-3 rounded-lg border border-zinc-800/80">
                                                    {result.results[0]?.stderr && (
                                                        <div className="text-red-400 mb-2 pb-2 border-b border-red-900/30">{result.results[0].stderr}</div>
                                                    )}
                                                    {result.results[0]?.actualOutput || (result.results[0]?.stderr ? '' : '<No Output>')}
                                                </div>
                                            ) : (
                                                /* Assessment mode: LeetCode-style test case viewer */
                                                <div className="space-y-3 font-sans">
                                                    {/* Mark Allocation Breakdown Banner */}
                                                    {result.marksAwarded != null && result.totalMarks != null && (
                                                        <div className="flex flex-wrap items-center justify-between bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-lg text-xs gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-zinc-400 font-medium">Score Awarded:</span>
                                                                <span className="text-emerald-400 font-bold text-sm">
                                                                    {result.marksAwarded % 1 === 0 ? result.marksAwarded.toFixed(0) : result.marksAwarded.toFixed(2)} / {result.totalMarks} pts
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                                                                <span>
                                                                    Formula: ({result.totalMarks} / {result.totalTestCaseCount}) × {result.correctTestCaseCount} passed
                                                                </span>
                                                                {result.markPerTestCase != null && (
                                                                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                                                                        {(result.markPerTestCase % 1 === 0 ? result.markPerTestCase.toFixed(0) : result.markPerTestCase.toFixed(2))} pt / testcase
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Test Case Selection Pills */}
                                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                        {result.results.map((tc, idx) => {
                                                            const passed = isCasePassed(tc);
                                                            return (
                                                                <button
                                                                    key={tc.testCaseId || idx}
                                                                    onClick={() => setSelectedTestCaseIndex(idx)}
                                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                                                        selectedTestCaseIndex === idx
                                                                            ? (passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40')
                                                                            : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
                                                                    }`}
                                                                >
                                                                    {passed ? <CheckCircle2 size={13} className="text-emerald-400" /> : <XCircle size={13} className="text-red-400" />}
                                                                    <span>Case {idx + 1}</span>
                                                                    {tc.isHidden && <span className="text-[10px] text-zinc-500">(Hidden)</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Selected Test Case Details */}
                                                    {result.results[selectedTestCaseIndex] && (() => {
                                                        const currentCase = result.results[selectedTestCaseIndex];
                                                        const passed = isCasePassed(currentCase);
                                                        return (
                                                            <div className="border border-zinc-800 rounded-lg bg-[#202023] p-3 text-xs space-y-3 font-mono">
                                                                {/* Status Header */}
                                                                <div className="flex items-center justify-between font-sans">
                                                                    <div className="flex items-center gap-2">
                                                                        {passed ? (
                                                                            <span className="text-emerald-400 font-bold flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                                                                <CheckCircle2 size={14} /> Passed
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-red-400 font-bold flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-xs">
                                                                                <XCircle size={14} /> Failed
                                                                            </span>
                                                                        )}
                                                                        <span className="text-zinc-200 font-semibold text-xs">Test Case {selectedTestCaseIndex + 1}</span>
                                                                    </div>
                                                                    {currentCase.isHidden && (
                                                                        <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded font-medium">
                                                                            Assessment Case
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Test Case Inputs and Outputs */}
                                                                <div className="space-y-2.5">
                                                                    {/* Input */}
                                                                    {currentCase.input !== undefined && (
                                                                        <div>
                                                                            <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider block mb-1 font-sans">
                                                                                Input:
                                                                            </span>
                                                                            <div className="text-zinc-300 bg-black/40 p-2.5 rounded border border-zinc-800 whitespace-pre-wrap break-all text-xs">
                                                                                {currentCase.input || '<No Input>'}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Expected Output vs Actual Output Comparison Grid */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        {/* Expected Output */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1 font-sans">
                                                                                <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                                                                                    Expected Output:
                                                                                </span>
                                                                                <span className="text-[10px] text-zinc-500 font-normal">Target</span>
                                                                            </div>
                                                                            <div className="text-emerald-400 bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40 whitespace-pre-wrap break-all text-xs font-semibold min-h-[42px]">
                                                                                {currentCase.expectedOutput !== undefined ? (currentCase.expectedOutput || '<Empty Output>') : '<Hidden>'}
                                                                            </div>
                                                                        </div>

                                                                        {/* Actual Output */}
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-1 font-sans">
                                                                                <span className={`${passed ? 'text-emerald-400' : 'text-red-400'} text-[10px] font-semibold uppercase tracking-wider`}>
                                                                                    Actual Output:
                                                                                </span>
                                                                                <span className={`text-[10px] font-semibold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                                    {passed ? 'Match ✓' : 'Mismatch ✗'}
                                                                                </span>
                                                                            </div>
                                                                            <div className={`p-2.5 rounded border whitespace-pre-wrap break-all text-xs min-h-[42px] ${
                                                                                passed
                                                                                    ? 'text-emerald-300 bg-emerald-950/20 border-emerald-900/40'
                                                                                    : 'text-red-300 bg-red-950/30 border-red-900/50'
                                                                            }`}>
                                                                                {currentCase.actualOutput || '<Empty Output>'}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Standard Error (if any) */}
                                                                    {currentCase.stderr && (
                                                                        <div>
                                                                            <span className="text-red-400 text-[10px] font-semibold uppercase tracking-wider block mb-1 font-sans">
                                                                                Standard Error (stderr):
                                                                            </span>
                                                                            <div className="text-red-400 bg-red-950/20 p-2.5 rounded border border-red-900/40 whitespace-pre-wrap break-all text-xs">
                                                                                {currentCase.stderr}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 2: AI Analysis */}
                                    {activeTab === 'analysis' && mode !== 'assessment' && (
                                        <div className="font-sans">
                                            {isAnalyzing ? (
                                                <div className="flex flex-col items-center justify-center py-6 text-indigo-400 gap-2">
                                                    <RefreshCw size={24} className="animate-spin" />
                                                    <span className="text-xs font-semibold">AI is analyzing your code complexity and optimal approach...</span>
                                                </div>
                                            ) : !analysisResult ? (
                                                <div className="text-zinc-500 py-4 text-center font-sans">
                                                    Click <span className="text-indigo-400 font-semibold">"Analyze"</span> above to inspect time complexity, space complexity, and tips.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                                                            <div className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Time Complexity</div>
                                                            <div className="text-zinc-200 font-mono text-sm font-bold">{analysisResult.timeComplexity}</div>
                                                        </div>
                                                        <div className="bg-black/40 p-3 rounded-lg border border-zinc-800">
                                                            <div className="text-[10px] text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">Space Complexity</div>
                                                            <div className="text-zinc-200 font-mono text-sm font-bold">{analysisResult.spaceComplexity}</div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-lg">
                                                        <div className="text-[11px] text-indigo-400 mb-1.5 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                                            <Lightbulb size={14} /> Tips for Optimal Solution
                                                        </div>
                                                        <div className="text-zinc-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{analysisResult.tips}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 3: Custom Input (Practice Mode) */}
                                    {activeTab === 'input' && mode === 'practice' && (
                                        <div className="font-sans space-y-1.5">
                                            <div className="flex items-center justify-between text-xs text-zinc-400">
                                                <span className="font-semibold uppercase tracking-wider">Standard Input (stdin)</span>
                                                <span className="text-[11px] text-zinc-500">Passed to your program at execution</span>
                                            </div>
                                            <textarea 
                                                className="w-full bg-[#202023] text-gray-200 font-mono text-xs sm:text-sm p-2.5 rounded border border-zinc-700/80 focus:outline-none focus:border-primary resize-y min-h-[75px]"
                                                placeholder="Enter custom standard input here..."
                                                value={customInput}
                                                onChange={(e) => setCustomInput(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
