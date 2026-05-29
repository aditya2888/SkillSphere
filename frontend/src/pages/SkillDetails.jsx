import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, User, Clock, CheckCircle, BookOpen, DollarSign, Play, Video } from 'lucide-react';
import { API, getFileUrl } from '../utils/api';

const SkillDetails = () => {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await axios.get(`${API}/skills/${id}`);
        setSkill(res.data);
        fetchCourses(res.data._id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [id]);

  const fetchCourses = async (skillId) => {
    try {
      setCoursesLoading(true);
      const res = await axios.get(`${API}/courses/skill/${skillId}`);
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API}/bookings`, {
        skillId: skill._id,
        mentorId: skill.user._id,
        date: bookingDate,
        notes
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookingSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Failed to book session');
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium text-zinc-500">Loading details...</div>;
  if (!skill) return <div className="text-center py-20 text-xl font-medium text-red-500">Skill not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {skill.mediaUrl && (
          <div className="h-64 md:h-96 w-full bg-zinc-800 relative">
            <img
              src={getFileUrl(skill.mediaUrl)}
              alt={skill.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-300 shadow-sm">
              {skill.category}
            </div>
          </div>
        )}

        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
          <div className="flex-1 space-y-6">
            {!skill.mediaUrl && (
              <div className="inline-block bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-md text-sm font-medium mb-2">
                {skill.category}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 leading-tight tracking-tight">{skill.title}</h1>

            <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 w-fit">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-lg font-bold border border-zinc-700">
                {skill.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium mb-0.5">Taught by</p>
                <p className="font-semibold text-zinc-200 text-lg">{skill.user?.name}</p>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">About this skill</h3>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{skill.description}</p>
            </div>
          </div>

          <div className="w-full md:w-96 shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
              <div className="text-center border-b border-zinc-800 pb-6 mb-6">
                <p className="text-zinc-400 text-sm font-medium mb-1 uppercase tracking-wider">Session Price</p>
                <p className="text-4xl font-bold text-zinc-100">${skill.price}</p>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/20 text-emerald-400 mb-4 border border-emerald-900/30">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">Session Requested!</h3>
                  <p className="text-zinc-400 text-sm mb-6">The mentor will review your request. Check your dashboard for updates.</p>
                  <button onClick={() => navigate('/dashboard')} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-medium py-2.5 rounded-xl transition-colors">
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookSession} className="space-y-5">
                  <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2"><Calendar size={20} className="text-primary-500" /> Book a Session</h3>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Select Date</label>
                    <input
                      type="date"
                      required
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Message to Mentor (Optional)</label>
                    <textarea
                      className="w-full p-3 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl h-24 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                      placeholder="What do you want to focus on?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                  >
                    Request to Book
                  </button>
                  <p className="text-center text-xs text-zinc-500 mt-3 flex items-center justify-center gap-1">
                    <Clock size={12} /> You won't be charged yet
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Courses Section */}
      {!coursesLoading && courses.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Video size={24} className="text-primary-500" />
            <h2 className="text-2xl font-bold text-white">Related Video Courses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-primary-500 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-40 bg-zinc-700 overflow-hidden flex items-center justify-center">
                  {course.thumbnailUrl ? (
                    <img
                      src={getFileUrl(course.thumbnailUrl)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <BookOpen size={32} className="text-zinc-600" />
                  )}
                  {course.videos && course.videos.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <Play size={12} fill="white" /> {course.videos.length}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition">
                    {course.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between border-t border-zinc-700 pt-3">
                    <div className="flex items-center gap-1 text-zinc-400 text-sm">
                      <DollarSign size={14} />
                      <span>${course.price.toFixed(2)}</span>
                    </div>
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">
                      {course.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillDetails;
