
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ClassroomDetail from './pages/teacher/ClassroomDetail';
import ClassManagement from './pages/admin/ClassManagement';
import AdminClassroomList from './pages/admin/AdminClassroomList';
import AssessmentBuilder from './pages/teacher/assessments/AssessmentBuilder';
import AssessmentResults from './pages/teacher/assessments/AssessmentResults';
import SubmissionReview from './pages/teacher/assessments/SubmissionReview';
import StudentLayout from './layouts/StudentLayout';
import AssessmentList from './pages/student/assessments/AssessmentList';
import TakeAssessment from './pages/student/assessments/TakeAssessment';
import ResultView from './pages/student/assessments/ResultView';
import PracticePage from './pages/student/practice/PracticePage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentClassroomDetail from './pages/student/StudentClassroomDetail';

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const RouteTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Eduvault';

    if (path === '/login') title = 'Login';
    else if (path === '/unauthorized') title = 'Unauthorized';
    else if (path === '/admin') title = 'Dashboard | Admin';
    else if (path.startsWith('/admin/students')) title = 'Students | Admin';
    else if (path.startsWith('/admin/teachers')) title = 'Teachers | Admin';
    else if (path.startsWith('/admin/classes')) title = 'Classes | Admin';
    else if (path.startsWith('/admin/classrooms')) title = 'Classrooms | Admin';
    else if (path === '/teacher') title = 'Dashboard | Teacher';
    else if (path.match(/\/teacher\/classrooms\/\d+/)) title = 'Classroom | Teacher';
    else if (path === '/teacher/assessments/build') title = 'Build Assessment | Teacher';
    else if (path.match(/\/teacher\/assessments\/\d+\/edit/)) title = 'Edit Assessment | Teacher';
    else if (path.match(/\/teacher\/assessments\/\d+\/results/)) title = 'Assessment Results | Teacher';
    else if (path.match(/\/teacher\/submissions\/\d+/)) title = 'Review Submission | Teacher';
    else if (path === '/student/dashboard') title = 'Dashboard | Student';
    else if (path.match(/\/student\/classrooms\/\d+/)) title = 'Classroom | Student';
    else if (path === '/student/assessments') title = 'Assessments | Student';
    else if (path.match(/\/student\/assessments\/\d+\/take/)) title = 'Take Assessment | Student';
    else if (path.match(/\/student\/assessments\/\d+\/result/)) title = 'Assessment Result | Student';
    else if (path === '/student/practice') title = 'Practice | Student';

    document.title = title === 'Eduvault' ? title : `${title} | Eduvault`;
  }, [location]);

  return null;
};

const Unauthorized = () => <div className="p-8"><h1 className="text-2xl font-bold text-red-500">Unauthorized</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteTitleUpdater />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="teachers" element={<TeacherManagement />} />
                <Route path="classes" element={<ClassManagement />} />
                <Route path="classrooms" element={<AdminClassroomList />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherDashboard />} />
                <Route path="classrooms/:id" element={<ClassroomDetail />} />
                <Route path="assessments/build" element={<AssessmentBuilder />} />
                <Route path="assessments/:id/edit" element={<AssessmentBuilder />} />
                <Route path="assessments/:id/results" element={<AssessmentResults />} />
                <Route path="submissions/:id" element={<SubmissionReview />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="classrooms/:id" element={<StudentClassroomDetail />} />
                <Route path="assessments" element={<AssessmentList />} />
                <Route path="assessments/:id/take" element={<TakeAssessment />} />
                <Route path="assessments/:id/result" element={<ResultView />} />
                <Route path="practice" element={<PracticePage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
