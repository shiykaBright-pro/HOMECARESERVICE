import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';

import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import Reviews from './pages/Reviews';
import VideoCall from './components/VideoCall';
import Payment from './pages/Payment';
import BookAppointment from './pages/BookAppointment';
import Emergency from './pages/Emergency';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />

<Route path="/login" element={<Login />} />

                    <Route path="/patientsdashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patientsdashboard/payment" element={<ProtectedRoute allowedRoles={['patient']}><Payment /></ProtectedRoute>} />
          <Route path="/doctorsdashboard" element={<ProtectedRoute allowedRoles={['doctor']}><ErrorBoundary><DoctorDashboard /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/nursedashboard" element={<ProtectedRoute allowedRoles={['nurse']}><NurseDashboard /></ProtectedRoute>} />
          <Route path="/adminsdashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/video-call/:id" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
          <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        </Routes> 

      </Router>
    </AppProvider>
  );
}

export default App;
