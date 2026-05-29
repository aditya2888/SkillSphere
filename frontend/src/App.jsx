import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseSkills from './pages/BrowseSkills';
import SkillDetails from './pages/SkillDetails';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetails from './pages/CourseDetails';
import AzureAdmin from './pages/AzureAdmin';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-200">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 lg:px-8 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skills" element={<BrowseSkills />} />
            <Route path="/skills/:id" element={<SkillDetails />} />
            <Route path="/courses" element={<BrowseCourses />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/azure" element={<AzureAdmin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
