import api from './api';

export const assessmentApi = {
  // Teacher Endpoints
  createAssessment: async (data: { title: string; classroomId: number; totalMarks: number; deadline: string }) => {
    const response = await api.post('/api/teacher/assessments', data);
    return response.data;
  },
  
  addMcqQuestion: async (assessmentId: number, data: { text: string; marks: number; options: { optionText: string; isCorrect: boolean }[] }) => {
    const response = await api.post(`/api/teacher/assessments/${assessmentId}/questions/mcq`, data);
    return response.data;
  },

  addDescriptiveQuestion: async (assessmentId: number, data: { text: string; marks: number; modelAnswer: string }) => {
    const response = await api.post(`/api/teacher/assessments/${assessmentId}/questions/descriptive`, data);
    return response.data;
  },

  updateQuestion: async (questionId: number, data: { text: string; marks: number }) => {
    const response = await api.put(`/api/teacher/assessments/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (questionId: number) => {
    const response = await api.delete(`/api/teacher/assessments/questions/${questionId}`);
    return response.data;
  },

  publishAssessment: async (assessmentId: number) => {
    const response = await api.post(`/api/teacher/assessments/${assessmentId}/publish`);
    return response.data;
  },

  getTeacherAssessment: async (assessmentId: number) => {
    const response = await api.get(`/api/teacher/assessments/${assessmentId}`);
    return response.data;
  },

  getAssessmentSubmissions: async (assessmentId: number) => {
    const response = await api.get(`/api/teacher/assessments/${assessmentId}/submissions`);
    return response.data;
  },

  getSubmissionDetail: async (submissionId: number) => {
    const response = await api.get(`/api/teacher/assessments/submissions/${submissionId}`);
    return response.data;
  },

  // Student Endpoints
  getStudentAssessments: async () => {
    const response = await api.get('/api/student/assessments');
    return response.data;
  },

  getStudentAssessmentDetail: async (assessmentId: number) => {
    const response = await api.get(`/api/student/assessments/${assessmentId}`);
    return response.data;
  },

  startAssessment: async (assessmentId: number) => {
    const response = await api.post(`/api/student/assessments/${assessmentId}/start`);
    return response.data; // returns submissionId
  },

  saveAnswer: async (submissionId: number, questionId: number, data: { mcqSelectedOptionId?: number | null; descriptiveText?: string | null }) => {
    const response = await api.put(`/api/student/submissions/${submissionId}/answers/${questionId}`, data);
    return response.data;
  },

  submitAssessment: async (submissionId: number) => {
    const response = await api.post(`/api/student/submissions/${submissionId}/submit`);
    return response.data;
  }
};
