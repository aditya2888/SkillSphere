import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CourseVideosDisplay from '../components/CourseVideosDisplay';
import { BookOpen, ArrowLeft, User, DollarSign, Tag } from 'lucide-react';
import { API, getFileUrl } from '../utils/api';

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isInstructor, setIsInstructor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/courses/${courseId}`, {
                headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {}
            });
            setCourse(res.data.course);
            setIsEnrolled(res.data.isEnrolled);
            setIsInstructor(res.data.isInstructor);
        } catch (err) {
            setError('Failed to load course');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            await axios.post(
                `${API}/courses/${courseId}/enroll`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setIsEnrolled(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
                Loading course...
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-zinc-400 mb-4">{error || 'Course not found'}</p>
                <button
                    onClick={() => navigate('/courses')}
                    className="text-primary-500 hover:text-primary-400"
                >
                    ← Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition"
                >
                    <ArrowLeft size={20} className="text-zinc-400" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                    {course.skill && (
                        <p className="text-zinc-400 text-sm mt-1">
                            Skill: <span className="text-primary-400 font-medium">{course.skill.title}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Course Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-6">
                        {course.thumbnailUrl ? (
                            <img
                                src={getFileUrl(course.thumbnailUrl)}
                                alt={course.title}
                                className="w-full h-64 object-cover"
                            />
                        ) : (
                            <div className="w-full h-64 bg-zinc-800 flex items-center justify-center">
                                <BookOpen size={48} className="text-zinc-600" />
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">About this course</h2>
                        <p className="text-zinc-300 leading-relaxed">{course.description}</p>
                    </div>

                    {/* Instructor Info */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <User size={20} /> Instructor
                        </h2>
                        <div className="flex items-center gap-4">
                            {course.instructor.avatar ? (
                                <img
                                    src={getFileUrl(course.instructor.avatar)}
                                    alt={course.instructor.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <User size={32} className="text-zinc-600" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-white">{course.instructor.name}</h3>
                                <p className="text-zinc-400 text-sm">{course.instructor.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Videos Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Course Content</h2>
                        <CourseVideosDisplay
                            course={course}
                            isEnrolled={isEnrolled}
                            isInstructor={isInstructor}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-24">
                        {/* Price */}
                        <div className="mb-6 pb-6 border-b border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <DollarSign size={16} />
                                <span className="text-sm">Price</span>
                            </div>
                            <p className="text-4xl font-bold text-white">${course.price.toFixed(2)}</p>
                        </div>

                        {/* Category */}
                        <div className="mb-6 pb-6 border-b border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                <Tag size={16} />
                                <span className="text-sm">Category</span>
                            </div>
                            <p className="text-white font-medium">{course.category}</p>
                        </div>

                        {/* Enroll Button */}
                        {!isInstructor && !isEnrolled && (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition mb-4"
                            >
                                {enrolling ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                        )}

                        {isEnrolled && (
                            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg text-center font-medium mb-4">
                                ✓ You are enrolled
                            </div>
                        )}

                        {isInstructor && (
                            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-400 p-3 rounded-lg text-center font-medium mb-4">
                                You are the instructor
                            </div>
                        )}

                        {/* Stats */}
                        <div className="space-y-3 mt-6 pt-6 border-t border-zinc-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Total Videos</span>
                                <span className="text-white font-semibold">{course.videos?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Level</span>
                                <span className="text-white font-semibold">All Levels</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
