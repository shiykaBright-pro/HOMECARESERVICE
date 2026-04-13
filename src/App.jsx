import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import Reviews from './pages/Reviews';
import VideoCall from './components/VideoCall';
import Emergency from './pages/Emergency';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
<Route path="/emergency" element={<Emergency />} />
          <Route path="/emergency/team" element={<Emergency />} />
          <Route path="/emergency/ambulance" element={<Emergency />} />
          <Route path="/emergency/hospital" element={<Emergency />} />

<Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

<Route path="/dashboard/patient" element={<PatientDashboard />} />
  <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
  <Route path="/dashboard/nurse" element={<NurseDashboard />} />
  <Route path="/dashboard/admin" element={<AdminDashboard />} />

          <Route path="/messages" element={<Messages />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/video-call/:id" element={<VideoCall />} />
        </Routes>

      </Router>
    </AppProvider>
  );
}

export default App;
