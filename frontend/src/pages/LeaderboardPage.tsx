import React, { useState, useEffect } from 'react';
import { streakApi, type StudentStreak } from '../services/streakApi';
import { useAuth } from '../context/AuthContext';
import { 
    Trophy, 
    Flame, 
    Award, 
    Search, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    Code2, 
    RefreshCw, 
    Crown,
    Medal,
    Users
} from 'lucide-react';

const LeaderboardPage: React.FC = () => {
    const { user } = useAuth();
    const [streaks, setStreaks] = useState<StudentStreak[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE_TODAY' | 'AT_RISK' | 'TOP'>('ALL');

    const fetchLeaderboard = async () => {
        try {
            const data = await streakApi.getLeaderboard();
            setStreaks(data);
        } catch (err) {
            console.error("Failed to load streak leaderboard", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchLeaderboard();
    };

    // Filter & Search logic
    const filteredStreaks = streaks.filter(s => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
            (s.studentName || '').toLowerCase().includes(query) ||
            (s.registrationId || '').toLowerCase().includes(query) ||
            (s.studentEmail || '').toLowerCase().includes(query) ||
            (s.schoolClassName || '').toLowerCase().includes(query);

        if (!matchesQuery) return false;

        if (activeFilter === 'ACTIVE_TODAY') {
            return s.activeToday;
        }
        if (activeFilter === 'AT_RISK') {
            return s.streakStatus === 'AT_RISK';
        }
        if (activeFilter === 'TOP') {
            return s.currentStreak >= 3;
        }
        return true;
    });

    // Top 3 students for the podium (from overall unfiltered list)
    const top1 = streaks[0];
    const top2 = streaks[1];
    const top3 = streaks[2];

    // Summary statistics
    const activeCodersToday = streaks.filter(s => s.activeToday).length;
    const atRiskCoders = streaks.filter(s => s.streakStatus === 'AT_RISK').length;
    const topStreakRecord = streaks.length > 0 ? Math.max(...streaks.map(s => s.currentStreak)) : 0;
    const currentUserStreak = streaks.find(s => s.studentEmail === user?.email);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-8 md:p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-amber-200 text-xs font-semibold uppercase tracking-wider border border-amber-300/30">
                            <Crown size={14} className="text-yellow-300" />
                            <span>Coding Streak Hall of Fame</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-sm">
                            Daily Streak Leaderboard
                        </h1>
                        <p className="text-amber-100 text-sm md:text-base leading-relaxed">
                            Celebrating students who write and execute code daily. Run code at least once every 24 hours to preserve and climb the streak leaderboard!
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-sm transition-all border border-white/20 active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                            <Trophy size={14} className="text-yellow-300" />
                            <span>Top Streak</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-extrabold mt-1 text-white">
                            {topStreakRecord} <span className="text-sm font-semibold text-amber-200">Days</span>
                        </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                            <CheckCircle2 size={14} className="text-emerald-300" />
                            <span>Coded Today</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-extrabold mt-1 text-white">
                            {activeCodersToday} <span className="text-sm font-semibold text-amber-200">Coders</span>
                        </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                            <AlertTriangle size={14} className="text-orange-300" />
                            <span>Streak At Risk</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-extrabold mt-1 text-white">
                            {atRiskCoders} <span className="text-sm font-semibold text-amber-200">Coders</span>
                        </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                            <Users size={14} className="text-indigo-200" />
                            <span>Students</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-extrabold mt-1 text-white">
                            {streaks.length} <span className="text-sm font-semibold text-amber-200">Enrolled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logged in Student Rank Spotlight (if student is logged in) */}
            {currentUserStreak && (
                <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/5 border border-primary/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-md shadow-primary/20">
                            #{currentUserStreak.rank}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white text-base">Your Standing:</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary-dark">
                                    {currentUserStreak.studentName}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {currentUserStreak.activeToday 
                                    ? "🔥 Your streak is preserved for today! Keep the flame alive tomorrow."
                                    : currentUserStreak.streakStatus === 'AT_RISK'
                                        ? "⚡ You haven't run code today yet! Execute code in the editor now to preserve your streak."
                                        : "Run code daily in the editor to climb the ranks!"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Current Streak</div>
                            <div className="text-xl font-black text-amber-500 flex items-center gap-1 justify-end">
                                <Flame size={18} className="fill-amber-500" />
                                {currentUserStreak.currentStreak} Days
                            </div>
                        </div>
                        <div className="text-right border-l border-border-subtle pl-4">
                            <div className="text-xs text-gray-400">Personal Best</div>
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {currentUserStreak.highestStreak} Days
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top 3 Podium Cards */}
            {!isLoading && streaks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                    {/* 2nd Place */}
                    {top2 && (
                        <div className="order-2 md:order-1 relative modern-card p-6 rounded-3xl border-2 border-slate-300 dark:border-slate-700/80 bg-gradient-to-b from-slate-100/60 to-white dark:from-zinc-800/80 dark:to-zinc-900/90 shadow-lg text-center transform hover:-translate-y-1 transition-all">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1 shadow-sm">
                                <Medal size={14} /> 2nd Place
                            </div>
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xl mb-3 shadow-inner">
                                {top2.studentName?.substring(0, 2).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{top2.studentName}</h3>
                            <p className="text-xs text-gray-500 truncate">{top2.registrationId || top2.studentEmail}</p>
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-lg">
                                    <Flame size={20} className="fill-orange-500" />
                                    <span>{top2.currentStreak} Days</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Best: {top2.highestStreak}d • {top2.totalExecutions} runs</div>
                            </div>
                        </div>
                    )}

                    {/* 1st Place - Champion Podium */}
                    {top1 && (
                        <div className="order-1 md:order-2 relative modern-card p-7 rounded-3xl border-2 border-amber-400 dark:border-amber-500/80 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/20 dark:from-amber-950/40 dark:via-zinc-900/90 dark:to-zinc-900 shadow-2xl text-center transform md:-translate-y-4 hover:-translate-y-5 transition-all">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                                <Crown size={15} /> Streak Champion
                            </div>
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-2xl mb-4 shadow-lg shadow-amber-500/30">
                                {top1.studentName?.substring(0, 2).toUpperCase()}
                            </div>
                            <h3 className="font-extrabold text-gray-900 dark:text-white text-xl truncate">{top1.studentName}</h3>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium truncate">{top1.registrationId || top1.studentEmail}</p>
                            <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-amber-500/20">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-2xl shadow-md shadow-orange-500/30">
                                    <Flame size={24} className="fill-white animate-pulse" />
                                    <span>{top1.currentStreak} Days</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    All-Time Best: <strong className="text-amber-600 dark:text-amber-400 font-bold">{top1.highestStreak}d</strong> • {top1.totalExecutions} total runs
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {top3 && (
                        <div className="order-3 relative modern-card p-6 rounded-3xl border-2 border-amber-700/40 dark:border-amber-800/60 bg-gradient-to-b from-orange-50/40 to-white dark:from-zinc-800/80 dark:to-zinc-900/90 shadow-lg text-center transform hover:-translate-y-1 transition-all">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-700/80 text-white text-xs font-extrabold flex items-center gap-1 shadow-sm">
                                <Medal size={14} /> 3rd Place
                            </div>
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-800/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xl mb-3 shadow-inner">
                                {top3.studentName?.substring(0, 2).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{top3.studentName}</h3>
                            <p className="text-xs text-gray-500 truncate">{top3.registrationId || top3.studentEmail}</p>
                            <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-zinc-800">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600/10 text-amber-700 dark:text-amber-400 font-black text-lg">
                                    <Flame size={20} className="fill-amber-600" />
                                    <span>{top3.currentStreak} Days</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">Best: {top3.highestStreak}d • {top3.totalExecutions} runs</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filter Tabs and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveFilter('ALL')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            activeFilter === 'ALL'
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        All Coders ({streaks.length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('ACTIVE_TODAY')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeFilter === 'ACTIVE_TODAY'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        <CheckCircle2 size={13} /> Active Today ({activeCodersToday})
                    </button>
                    <button
                        onClick={() => setActiveFilter('AT_RISK')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeFilter === 'AT_RISK'
                                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        <AlertTriangle size={13} /> At Risk ({atRiskCoders})
                    </button>
                    <button
                        onClick={() => setActiveFilter('TOP')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            activeFilter === 'TOP'
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        <Sparkles size={13} /> Top Streaks (3d+)
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[280px]">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search student, roll no, or class..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="modern-input pl-10 text-sm w-full"
                    />
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="modern-card overflow-hidden shadow-xl border border-border-subtle rounded-3xl">
                {isLoading ? (
                    <div className="p-12 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-14 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredStreaks.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Trophy size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Students Found</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                            {searchQuery ? `No student streaks match "${searchQuery}".` : "No streak records available under this filter."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-subtle bg-gray-50/70 dark:bg-zinc-900/50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                    <th className="py-4 px-6 text-center w-20">Rank</th>
                                    <th className="py-4 px-6">Student</th>
                                    <th className="py-4 px-6">Class / Group</th>
                                    <th className="py-4 px-6 text-center">Daily Streak</th>
                                    <th className="py-4 px-6 text-center">Best Streak</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-right">Executions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle text-sm">
                                {filteredStreaks.map((s) => {
                                    const isCurrentUser = s.studentEmail === user?.email;
                                    const isTop1 = s.rank === 1;
                                    const isTop2 = s.rank === 2;
                                    const isTop3 = s.rank === 3;

                                    return (
                                        <tr
                                            key={s.studentId}
                                            className={`transition-colors hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 ${
                                                isCurrentUser 
                                                    ? 'bg-primary/5 dark:bg-primary/10 font-medium' 
                                                    : ''
                                            }`}
                                        >
                                            {/* Rank */}
                                            <td className="py-4 px-6 text-center">
                                                {isTop1 ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400/20 text-amber-500 font-black text-sm">
                                                        🥇
                                                    </span>
                                                ) : isTop2 ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/30 text-slate-400 font-black text-sm">
                                                        🥈
                                                    </span>
                                                ) : isTop3 ? (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-300 font-black text-sm">
                                                        🥉
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                                                        #{s.rank}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Student Details */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                        isTop1 
                                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                                                            : isTop2 
                                                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200' 
                                                                : isTop3 
                                                                    ? 'bg-amber-800/30 text-amber-700 dark:text-amber-300' 
                                                                    : 'bg-primary/10 text-primary-dark dark:text-primary-light'
                                                    }`}>
                                                        {s.studentName?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {s.studentName}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {s.registrationId ? `${s.registrationId} • ` : ''}{s.studentEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Class */}
                                            <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                                                {s.schoolClassName || '-'}
                                            </td>

                                            {/* Current Streak */}
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                                                    s.currentStreak > 0
                                                        ? s.activeToday
                                                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                                                            : 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
                                                }`}>
                                                    <Flame size={14} className={s.currentStreak > 0 ? "fill-current animate-pulse text-amber-500" : "text-gray-400"} />
                                                    <span>{s.currentStreak} {s.currentStreak === 1 ? 'day' : 'days'}</span>
                                                </span>
                                            </td>

                                            {/* Best Streak */}
                                            <td className="py-4 px-6 text-center font-bold text-gray-700 dark:text-gray-300">
                                                <div className="inline-flex items-center gap-1 text-xs">
                                                    <Award size={13} className="text-amber-500" />
                                                    <span>{s.highestStreak}d</span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-6 text-center">
                                                {s.activeToday ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/30">
                                                        <CheckCircle2 size={12} /> Active Today
                                                    </span>
                                                ) : s.streakStatus === 'AT_RISK' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                                                        <AlertTriangle size={12} /> At Risk
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                                                        {s.currentStreak === 0 && s.lastActiveDate ? 'Broken' : 'Inactive'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Executions */}
                                            <td className="py-4 px-6 text-right font-mono text-xs text-gray-500 dark:text-gray-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Code2 size={13} className="text-gray-400" />
                                                    {s.totalExecutions}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;
