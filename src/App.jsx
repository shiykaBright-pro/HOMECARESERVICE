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
import AuthCallback from './pages/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary'; 

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

          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/patient/payment" element={<Payment />} />
          <Route path="/dashboard/doctor" element={<ErrorBoundary><DoctorDashboard /></ErrorBoundary>} />
          <Route path="/dashboard/nurse" element={<NurseDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/doctorsdashboard" element={<ErrorBoundary><DoctorDashboard /></ErrorBoundary>} />
          <Route path="/nursedashboard" element={<NurseDashboard />} />
          <Route path="/adminsdashboard" element={<AdminDashboard />} />
          <Route path="/patientsdashboard" element={<PatientDashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/video-call/:id" element={<VideoCall />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes> 

      </Router>
    </AppProvider>
  );
}

export default App;
