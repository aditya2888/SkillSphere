import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, DollarSign, Play } from 'lucide-react';
import { API, getFileUrl } from '../utils/api';

const BrowseCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchCourses();

        // Re-fetch when the tab/window regains focus so deleted courses disappear
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchCourses();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/courses`);
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            !categoryFilter || course.category.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(courses.map(c => c.category))];

    return (
        <div>
            {/* Header */}
            <div className="mb-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100">Explore Courses</h1>
                    <p className="text-zinc-400 mt-1">Learn from expert instructors with video-based courses</p>
                </div>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            {categories.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setCategoryFilter('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!categoryFilter
                            ? 'bg-primary-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${categoryFilter === category
                                ? 'bg-primary-600 text-white'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-zinc-400">Loading courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <BookOpen size={48} className="mx-auto text-zinc-600 mb-4" />
                        <p className="text-zinc-400">No courses found matching your criteria</p>
                    </div>
                ) : (
                    filteredCourses.map(course => (
                        <div
                            key={course._id}
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-primary-500 transition-all cursor-pointer group"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-full h-40 bg-zinc-800 overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img
                                        src={getFileUrl(course.thumbnailUrl)}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.querySelector('.fallback-icon')?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`fallback-icon w-full h-full flex items-center justify-center ${course.thumbnailUrl ? 'hidden' : ''}`}>
                                    <BookOpen size={32} className="text-zinc-600" />
                                </div>
                                {course.videos && course.videos.length > 0 && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                                        <Play size={12} fill="white" /> {course.videos.length}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {course.skill && (
                                    <p className="text-xs text-primary-400 font-medium mb-2">
                                        {course.skill.title}
                                    </p>
                                )}
                                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <DollarSign size={14} />
                                        <span>${course.price.toFixed(2)}</span>
                                    </div>
                                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                                        {course.category}
                                    </span>
                                </div>

                                {/* Instructor */}
                                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
                                    {course.instructor.avatar ? (
                                        <img
                                            src={getFileUrl(course.instructor.avatar)}
                                            alt={course.instructor.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                                            {course.instructor.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-sm text-zinc-400 truncate">
                                        {course.instructor.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BrowseCourses;
