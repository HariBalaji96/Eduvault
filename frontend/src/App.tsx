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
import AssessmentBuilder from './pages/teacher/assessments/AssessmentBuilder';
import AssessmentResults from './pages/teacher/assessments/AssessmentResults';
import SubmissionReview from './pages/teacher/assessments/SubmissionReview';
import StudentLayout from './layouts/StudentLayout';
import AssessmentList from './pages/student/assessments/AssessmentList';
import TakeAssessment from './pages/student/assessments/TakeAssessment';
import ResultView from './pages/student/assessments/ResultView';

const StudentDashboard = () => <div className="p-8"><h1 className="text-2xl font-bold">Student Dashboard</h1></div>;
const Unauthorized = () => <div className="p-8"><h1 className="text-2xl font-bold text-red-500">Unauthorized</h1></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
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
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
                <Route index element={<TeacherDashboard />} />
                <Route path="classrooms/:id" element={<ClassroomDetail />} />
                <Route path="assessments/build" element={<AssessmentBuilder />} />
                <Route path="assessments/:id/results" element={<AssessmentResults />} />
                <Route path="submissions/:id" element={<SubmissionReview />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentLayout />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="assessments" element={<AssessmentList />} />
                <Route path="assessments/:id/take" element={<TakeAssessment />} />
                <Route path="assessments/:id/result" element={<ResultView />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
