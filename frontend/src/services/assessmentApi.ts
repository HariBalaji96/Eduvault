import api from '../api/client';

export const assessmentApi = {
  // Teacher Endpoints
  createAssessment: async (data: { title: string; classroomId: number; totalMarks: number; deadline: string; durationMinutes?: number | null }) => {
    const response = await api.post('/teacher/assessments', data);
    return response.data;
  },
  
  addMcqQuestion: async (assessmentId: number, data: { text: string; marks: number; options: { optionText: string; isCorrect: boolean }[] }) => {
    const response = await api.post(`/teacher/assessments/${assessmentId}/questions/mcq`, data);
    return response.data;
  },

  addDescriptiveQuestion: async (assessmentId: number, data: { text: string; marks: number; modelAnswer: string }) => {
    const response = await api.post(`/teacher/assessments/${assessmentId}/questions/descriptive`, data);
    return response.data;
  },

  updateQuestion: async (questionId: number, data: { text: string; marks: number }) => {
    const response = await api.put(`/teacher/assessments/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (questionId: number) => {
    const response = await api.delete(`/teacher/assessments/questions/${questionId}`);
    return response.data;
  },

  publishAssessment: async (assessmentId: number) => {
    const response = await api.post(`/teacher/assessments/${assessmentId}/publish`);
    return response.data;
  },

  getTeacherAssessment: async (assessmentId: number) => {
    const response = await api.get(`/teacher/assessments/${assessmentId}`);
    return response.data;
  },

  getAssessmentSubmissions: async (assessmentId: number) => {
    const response = await api.get(`/teacher/assessments/${assessmentId}/submissions`);
    return response.data;
  },

  getSubmissionDetail: async (submissionId: number) => {
    const response = await api.get(`/teacher/assessments/submissions/${submissionId}`);
    return response.data;
  },

  // Student Endpoints
  getStudentAssessments: async () => {
    const response = await api.get('/student/assessments');
    return response.data;
  },

  getStudentAssessmentDetail: async (assessmentId: number) => {
    const response = await api.get(`/student/assessments/${assessmentId}`);
    return response.data;
  },

  startAssessment: async (assessmentId: number) => {
    const response = await api.post(`/student/assessments/${assessmentId}/start`);
    return response.data; // returns submissionId
  },

  saveAnswer: async (submissionId: number, questionId: number, data: { mcqSelectedOptionIds?: number[] | null; descriptiveText?: string | null }) => {
    const response = await api.put(`/student/submissions/${submissionId}/answers/${questionId}`, data);
    return response.data;
  },

  submitAssessment: async (submissionId: number) => {
    const response = await api.post(`/student/submissions/${submissionId}/submit`);
    return response.data;
  },

  runCode: async (submissionId: number, questionId: number, data: { language: string; code: string }) => {
    const response = await api.post(`/student/submissions/${submissionId}/questions/${questionId}/run`, data);
    return response.data;
  },

  submitCode: async (submissionId: number, questionId: number, data: { language: string; code: string }) => {
    const response = await api.post(`/student/submissions/${submissionId}/questions/${questionId}/submit-code`, data);
    return response.data;
  },

  executePractice: async (data: { language: string; code: string; input?: string }) => {
    const response = await api.post('/student/practice/execute', data);
    return response.data;
  },

  getTeacherClassroomAssessments: async (classroomId: number) => {
    const response = await api.get(`/teacher/assessments/classroom/${classroomId}`);
    return response.data;
  },

  getStudentClassroomAssessments: async (classroomId: number) => {
    const response = await api.get(`/student/assessments/classroom/${classroomId}`);
    return response.data;
  }
};
