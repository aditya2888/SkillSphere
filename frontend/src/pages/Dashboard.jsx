import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API, getFileUrl } from '../utils/api';
import { Plus, Calendar, BookOpen, Upload, Settings, LayoutDashboard, Clock, Activity, User as UserIcon, Video, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateSkillForm from '../components/CreateSkillForm';
import ManageCourseVideos from '../components/ManageCourseVideos';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // overview, skills, bookings
  const [mySkills, setMySkills] = useState([]);
  const [bookings, setBookings] = useState({ asMentee: [], asMentor: [] });
  const [selectedSkillForVideos, setSelectedSkillForVideos] = useState(null);
  const [myCourses, setMyCourses] = useState({ taught: [], enrolled: [] });
  const navigate = useNavigate();

  // New Skill Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', price: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // New Course Form State
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '', skillId: '' });
  const [courseFile, setCourseFile] = useState(null);
  const [courseUploading, setCourseUploading] = useState(false);
  const [courseSkillLabel, setCourseSkillLabel] = useState('');

  useEffect(() => {
    if (user?.token) {
      fetchMyData();
    }
  }, [user]);

  const fetchMyData = async () => {
    try {
      const skillsRes = await axios.get(`${API}/skills`);
      // Filter for own skills — guard against missing user field
      setMySkills(skillsRes.data.filter(s => s.user && s.user._id === user._id));
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }

    try {
      const bookingsRes = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setBookings(bookingsRes.data || { asMentee: [], asMentor: [] });
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }

    try {
      const coursesRes = await axios.get(`${API}/courses/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyCourses(coursesRes.data || { taught: [], enrolled: [] });
    } catch (err) {
      console.warn('Failed to fetch my courses', err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCourseFileChange = (e) => {
    setCourseFile(e.target.files[0]);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setUploading(true);
    let mediaUrl = '';

    try {
      // 1. Upload File if selected
      if (file) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await axios.post(`${API}/upload`, uploadData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        mediaUrl = uploadRes.data.url;
      }

      // 2. Create Skill
      await axios.post(`${API}/skills`, {
        ...formData,
        mediaUrl
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Reset form and refresh
      setFormData({ title: '', description: '', category: '', price: '' });
      setFile(null);
      setShowAddForm(false);
      fetchMyData();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill? All associated courses and videos will also be deleted.')) {
      return;
    }

    try {
      await axios.delete(`${API}/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchMyData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    e.preventDefault();
    // Ensure we have a skillId; if user typed a new label, create the skill first
    let skillIdToUse = courseForm.skillId;
    if (!skillIdToUse) {
      if (!courseSkillLabel || !courseSkillLabel.trim()) {
        alert('Please select a parent skill');
        return;
      }
      // Auto-create a new skill using minimal required fields
      try {
        const createRes = await axios.post(`${API}/skills`, {
          title: courseSkillLabel.trim(),
          description: `Auto-created for course ${courseForm.title || ''}`,
          category: 'General',
          price: 0
        }, { headers: { Authorization: `Bearer ${user.token}` } });
        skillIdToUse = createRes.data._id;
        // Update local form state so UI stays consistent
        setCourseForm(prev => ({ ...prev, skillId: skillIdToUse }));
        // Refresh skills list so new skill appears in suggestions
        fetchMyData();
      } catch (err) {
        console.error('Failed to auto-create parent skill', err);
        alert('Failed to create parent skill. Please try again.');
        return;
      }
    }
    setCourseUploading(true);
    try {
      let thumbnailUrl = '';
      if (courseFile) {
        const uploadData = new FormData();
        uploadData.append('image', courseFile);
        const uploadRes = await axios.post(`${API}/upload`, uploadData, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        thumbnailUrl = uploadRes.data.url;
      }

      await axios.post(`${API}/courses`, {
        title: courseForm.title,
        description: courseForm.description,
        price: courseForm.price,
        skillId: skillIdToUse,
        thumbnailUrl
      }, { headers: { Authorization: `Bearer ${user.token}` } });

      setCourseForm({ title: '', description: '', price: '', skillId: '' });
      setCourseSkillLabel('');
      setCourseFile(null);
      setShowCourseForm(false);
      fetchMyData();
    } catch (err) {
      console.error(err);
      alert('Failed to create course');
    } finally {
      setCourseUploading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All its videos will also be deleted.')) {
      return;
    }
    try {
      await axios.delete(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchMyData();
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchMyData();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="text-center py-20 text-zinc-400">Please log in to view dashboard</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xl font-bold border border-primary-500/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-zinc-100 line-clamp-1">{user.name}</h2>
              <p className="text-xs text-zinc-500 line-clamp-1">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary-500/10 text-primary-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'skills' ? 'bg-primary-500/10 text-primary-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <BookOpen size={18} /> My Skills
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'courses' ? 'bg-primary-500/10 text-primary-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <Video size={18} /> My Courses
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-primary-500/10 text-primary-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <Calendar size={18} /> Bookings
              {(bookings.asMentor || []).filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-auto bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {(bookings.asMentor || []).filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
            <div className="pt-4 mt-4 border-t border-zinc-800/50">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors">
                <Settings size={18} /> Settings
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-100 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div className="flex items-center gap-3 text-zinc-400 mb-2">
                  <BookOpen size={16} /> <span className="text-sm font-medium">Active Skills</span>
                </div>
                <span className="text-3xl font-bold text-zinc-100">{mySkills.length}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div className="flex items-center gap-3 text-zinc-400 mb-2">
                  <Calendar size={16} /> <span className="text-sm font-medium">Upcoming Sessions</span>
                </div>
                <span className="text-3xl font-bold text-zinc-100">
                  {(bookings.asMentee || []).filter(b => b.status === 'confirmed').length + (bookings.asMentor || []).filter(b => b.status === 'confirmed').length}
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div className="flex items-center gap-3 text-zinc-400 mb-2">
                  <Clock size={16} /> <span className="text-sm font-medium">Pending Requests</span>
                </div>
                <span className="text-3xl font-bold text-zinc-100">{(bookings.asMentor || []).filter(b => b.status === 'pending').length}</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                <h2 className="font-semibold text-zinc-100 flex items-center gap-2"><Activity size={18} /> Recent Activity</h2>
                <button className="text-xs text-primary-500 font-medium">View all</button>
              </div>
              <div className="space-y-4">
                {(bookings.asMentor || []).slice(0, 3).map((b) => (
                  <div key={b?._id || Math.random()} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300">New booking request from <span className="font-medium text-zinc-100">{b?.mentee?.name || 'Unknown'}</span> for <span className="font-medium text-zinc-100">{b?.skill?.title || 'Deleted skill'}</span></p>
                      <p className="text-xs text-zinc-500 mt-1">{b?.date ? new Date(b.date).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                ))}
                {(bookings.asMentor || []).length === 0 && <p className="text-sm text-zinc-500">No recent activity.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h1 className="text-2xl font-bold text-zinc-100">My Skills & Courses</h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Plus size={16} /> {showAddForm ? 'Cancel' : 'New Skill'}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">Create New Skill</h3>
                <form onSubmit={handleAddSkill} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title</label>
                      <input type="text" required className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:border-primary-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Advanced Node.js" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Category</label>
                      <input type="text" required className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:border-primary-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Web Development" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Price ($ per session)</label>
                      <input type="number" required className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:border-primary-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Cover Image</label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm font-medium">
                          <Upload size={16} /> Choose File
                          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                        <span className="text-sm text-zinc-500 truncate max-w-[200px]">{file ? file.name : 'No file chosen'}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
                      <textarea required className="w-full p-3 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg h-32 focus:outline-none focus:border-primary-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what you will teach..."></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={uploading} className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                      {uploading ? 'Publishing...' : 'Publish Skill'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySkills.length > 0 ? mySkills.map(skill => (
                <div key={skill._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
                  {skill.mediaUrl ? (
                    <img
                      src={getFileUrl(skill.mediaUrl)}
                      alt={skill.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className="w-full h-40 bg-zinc-800 flex items-center justify-center text-zinc-600 font-medium" style={{ display: skill.mediaUrl ? 'none' : 'flex' }}>No Image</div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-zinc-100 line-clamp-1 mb-1">{skill.title}</h3>
                    <p className="text-xs text-zinc-400 mb-3">{skill.category} • ${skill.price}/session</p>
                    <p className="text-sm text-zinc-400 line-clamp-2 flex-1">{skill.description}</p>

                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex gap-2">
                      <button
                        onClick={() => setSelectedSkillForVideos(skill)}
                        className="flex-1 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Video size={14} /> Manage
                      </button>
                      <button onClick={() => handleDeleteSkill(skill._id)} className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-1.5 rounded text-sm font-medium transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="text-zinc-500" size={24} />
                  </div>
                  <p className="text-zinc-300 font-medium mb-1">No skills listed</p>
                  <p className="text-zinc-500 text-sm">Create your first skill to start teaching.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h1 className="text-2xl font-bold text-zinc-100">My Courses</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCourseForm(!showCourseForm)}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> {showCourseForm ? 'Cancel' : 'New Course'}
                </button>
                <button onClick={() => fetchMyData()} className="text-sm text-zinc-500">Refresh</button>
              </div>
            </div>

            {showCourseForm && (
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">Create Course</h3>
                <form onSubmit={handleCreateCourse} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title</label>
                      <input type="text" required className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:outline-none focus:border-primary-500" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Parent Skill</label>
                      <input
                        list="skills-list"
                        required
                        value={courseSkillLabel}
                        onChange={e => {
                          const label = e.target.value;
                          setCourseSkillLabel(label);
                          const match = mySkills.find(s => s.title === label);
                          setCourseForm({ ...courseForm, skillId: match ? match._id : '' });
                        }}
                        placeholder="Type or select a skill"
                        className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg"
                      />
                      <datalist id="skills-list">
                        {mySkills.map(s => <option key={s._id} value={s.title} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Price ($)</label>
                      <input type="number" required className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Cover Image</label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 text-sm font-medium">
                          <Upload size={16} /> Choose File
                          <input type="file" className="hidden" onChange={handleCourseFileChange} accept="image/*" />
                        </label>
                        <span className="text-sm text-zinc-500 truncate max-w-[200px]">{courseFile ? courseFile.name : 'No file chosen'}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
                      <textarea required className="w-full p-3 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg h-32 focus:outline-none focus:border-primary-500" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={courseUploading} className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                      {courseUploading ? 'Creating...' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">Courses You're Enrolled In</h3>
                <div className="space-y-4">
                  {myCourses.enrolled && myCourses.enrolled.length > 0 ? myCourses.enrolled.map(c => (
                    <div key={c._id} className="flex items-center gap-4 border border-zinc-800 p-3 rounded-lg">
                      {c.thumbnailUrl ? (
                        <img
                          src={getFileUrl(c.thumbnailUrl)}
                          alt={c.title}
                          className="w-20 h-12 object-cover rounded"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-20 h-12 bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-600">No img</div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-zinc-100">{c.title}</h4>
                          <div className="text-sm text-zinc-400">
                            {(() => { const totalSec = c.videos?.reduce((s, v) => s + (v.duration || 0), 0) || 0; const m = Math.floor(totalSec / 60); const s = totalSec % 60; return totalSec > 0 ? `${m}m${s > 0 ? ` ${s}s` : ''}` : '—'; })()}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500">{c.skill?.title || ''} • {c.videos?.length || 0} videos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/courses/${c._id}`)} className="text-sm bg-primary-600 px-3 py-1.5 rounded text-white">Open</button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-zinc-500">You're not enrolled in any courses.</p>}
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">Courses You Teach</h3>
                <div className="space-y-4">
                  {myCourses.taught && myCourses.taught.length > 0 ? myCourses.taught.map(c => (
                    <div key={c._id} className="flex items-center gap-4 border border-zinc-800 p-3 rounded-lg">
                      {c.thumbnailUrl ? (
                        <img
                          src={getFileUrl(c.thumbnailUrl)}
                          alt={c.title}
                          className="w-20 h-12 object-cover rounded"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-20 h-12 bg-zinc-800 rounded flex items-center justify-center text-xs text-zinc-600">No img</div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-zinc-100">{c.title}</h4>
                          <div className="text-sm text-zinc-400">
                            {(() => { const totalSec = c.videos?.reduce((s, v) => s + (v.duration || 0), 0) || 0; const m = Math.floor(totalSec / 60); const s = totalSec % 60; return totalSec > 0 ? `${m}m${s > 0 ? ` ${s}s` : ''}` : '—'; })()}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500">{c.skill?.title || ''} • {c.videos?.length || 0} videos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedSkillForVideos(c.skill)} className="text-sm bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 py-1.5 rounded px-3">Manage</button>
                        <button onClick={() => navigate(`/courses/${c._id}`)} className="text-sm bg-primary-600 px-3 py-1.5 rounded text-white">Open</button>
                        <button onClick={() => handleDeleteCourse(c._id)} className="text-sm bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 py-1.5 rounded px-3 flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-zinc-500">You haven't created any courses yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2"><Upload size={20} className="text-primary-500" /> Sessions to Teach (Mentor)</h2>
              <div className="space-y-4">
                {bookings.asMentor && bookings.asMentor.length > 0 ? bookings.asMentor.map(b => (
                  <div key={b._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-100">{b.skill?.title || 'Deleted skill'}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
                        <span className="flex items-center gap-1.5"><UserIcon size={14} /> {b.mentee?.name || 'Unknown'}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {b.date ? new Date(b.date).toLocaleDateString() : 'No date'}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(b._id, 'confirmed')} className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600/30 transition-colors">Confirm</button>
                          <button onClick={() => updateBookingStatus(b._id, 'cancelled')} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">Decline</button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateBookingStatus(b._id, 'completed')} className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-500 transition-colors">Mark Done</button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
                    <p className="text-zinc-500">No mentoring requests yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-indigo-400" /> Sessions to Learn (Mentee)</h2>
              <div className="space-y-4">
                {bookings.asMentee && bookings.asMentee.length > 0 ? bookings.asMentee.map(b => (
                  <div key={b._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-100">{b.skill?.title || 'Deleted skill'}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
                        <span className="flex items-center gap-1.5"><UserIcon size={14} /> {b.mentor?.name || 'Unknown'}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {b.date ? new Date(b.date).toLocaleDateString() : 'No date'}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      {b.status === 'pending' && (
                        <button onClick={() => updateBookingStatus(b._id, 'cancelled')} className="bg-red-900/20 text-red-400 border border-red-900/30 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-900/40 transition-colors">Cancel Request</button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
                    <p className="text-zinc-500">You haven't booked any sessions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal for managing course videos */}
      {selectedSkillForVideos && (
        <ManageCourseVideos
          skillId={selectedSkillForVideos._id}
          skillTitle={selectedSkillForVideos.title}
          user={user}
          onClose={() => setSelectedSkillForVideos(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
