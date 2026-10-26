import client from '../api/client';

export interface StudentStreak {
    studentId: number;
    studentName: string;
    studentEmail: string;
    registrationId?: string;
    currentStreak: number;
    highestStreak: number;
    lastActiveDate?: string;
    activeToday: boolean;
    streakStatus: 'ACTIVE' | 'AT_RISK' | 'BROKEN' | 'INACTIVE';
    totalExecutions: number;
    schoolClassName?: string;
    rank?: number;
    message: string;
    recentActiveDates?: string[];
}

export const streakApi = {
    getMyStreak: async (): Promise<StudentStreak> => {
        const res = await client.get('/student/streak');
        return res.data;
    },

    getLeaderboard: async (classroomId?: number): Promise<StudentStreak[]> => {
        const url = classroomId ? `/streaks/leaderboard?classroomId=${classroomId}` : '/streaks/leaderboard';
        const res = await client.get(url);
        return res.data;
    },

    getStudentStreakById: async (studentId: number): Promise<StudentStreak> => {
        const res = await client.get(`/streaks/student/${studentId}`);
        return res.data;
    },

    getClassroomStreaks: async (classroomId: number): Promise<StudentStreak[]> => {
        const res = await client.get(`/teacher/classrooms/${classroomId}/streaks`);
        return res.data;
    },

    recalculateAll: async (): Promise<{ message: string }> => {
        const res = await client.post('/admin/streaks/recalculate');
        return res.data;
    },

    recalculateStudent: async (studentId: number): Promise<StudentStreak> => {
        const res = await client.post(`/admin/streaks/recalculate/${studentId}`);
        return res.data;
    }
};
