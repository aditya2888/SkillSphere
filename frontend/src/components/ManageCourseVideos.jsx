import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, X, Upload, Trash2, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { API as BASE_API, getFileUrl } from '../utils/api';

const ManageCourseVideos = ({ skillId, skillTitle, user, onClose }) => {
    const API = BASE_API;
    const [courses, setCourses] = useState([]);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(''); // '', 'uploading', 'success', 'error'
    const thumbnailInputRef = useRef(null);

    const [courseFormData, setCourseFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
    });
    const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
    const [courseThumbPreview, setCourseThumbPreview] = useState('');

    const [videoFormData, setVideoFormData] = useState({
        title: '',
        description: '',
        duration: '', // in MINUTES (user input)
    });

    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [skillId]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/courses/skill/${skillId}`);
            // For each course, populate video details
            const coursesWithVideos = await Promise.all(
                res.data.map(async (course) => {
                    try {
                        const vidRes = await axios.get(`${API}/courses/${course._id}/videos`);
                        return { ...course, videos: vidRes.data };
                    } catch {
                        return course;
                    }
                })
            );
            setCourses(coursesWithVideos);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleThumbnailChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setCourseThumbnailFile(f);
        setCourseThumbPreview(URL.createObjectURL(f));
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError('');
        try {
            let thumbnailUrl = '';
            // Upload thumbnail if provided
            if (courseThumbnailFile) {
                const fd = new FormData();
                fd.append('image', courseThumbnailFile);
                const upRes = await axios.post(`${API}/upload`, fd, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                thumbnailUrl = upRes.data.url;
            }

            await axios.post(`${API}/courses`, {
                ...courseFormData,
                skillId,
                price: parseFloat(courseFormData.price) || 0,
                thumbnailUrl,
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setCourseFormData({ title: '', description: '', category: '', price: '' });
            setCourseThumbnailFile(null);
            setCourseThumbPreview('');
            setShowCourseForm(false);
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating course');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Delete this course and all its videos?')) return;
        try {
            await axios.delete(`${API}/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting course');
        }
    };

    const handleUploadVideo = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select a video file');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadStatus('uploading');
        setError('');

        try {
            const uploadData = new FormData();
            uploadData.append('video', videoFile);
            uploadData.append('title', videoFormData.title);
            uploadData.append('description', videoFormData.description);
            // Convert minutes to seconds for storage
            const durationSeconds = videoFormData.duration
                ? Math.round(parseFloat(videoFormData.duration) * 60)
                : 0;
            uploadData.append('duration', durationSeconds);

            await axios.post(
                `${API}/courses/${selectedCourse._id}/videos`,
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 10 * 60 * 1000, // 10 minute timeout for large videos
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 1)
                        );
                        setUploadProgress(percent);
                    },
                }
            );

            setUploadStatus('success');
            setTimeout(() => {
                setVideoFormData({ title: '', description: '', duration: '' });
                setVideoFile(null);
                setShowVideoForm(false);
                setSelectedCourse(null);
                setUploadProgress(0);
                setUploadStatus('');
                fetchCourses();
            }, 1500);
        } catch (err) {
            setUploadStatus('error');
            setError(err.response?.data?.message || err.message || 'Error uploading video');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            await axios.delete(`${API}/courses/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchCourses();
        } catch (err) {
            // If video was already deleted from Azure (404), still refresh UI
            if (err.response?.status === 404) {
                fetchCourses();
            } else {
                setError('Error deleting video');
            }
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const base = API.replace(/\/api$/, '');
        return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Courses &amp; Videos</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <p className="text-zinc-300">Skill: <span className="font-bold text-white">{skillTitle}</span></p>
                </div>

                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-3 rounded mb-4 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-red-100"><X size={14} /></button>
                    </div>
                )}

                {/* Create Course Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Courses</h3>
                        <button
                            onClick={() => setShowCourseForm(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                        >
                            <Plus size={16} /> New Course
                        </button>
                    </div>

                    {showCourseForm && (
                        <form onSubmit={handleCreateCourse} className="bg-zinc-800 p-4 rounded-lg mb-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Course Title"
                                value={courseFormData.title}
                                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                            />
                            <textarea
                                placeholder="Course Description"
                                value={courseFormData.description}
                                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                                required
                                rows="2"
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Category (e.g. Programming)"
                                value={courseFormData.category}
                                onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                                required
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Price ($)"
                                value={courseFormData.price}
                                onChange={(e) => setCourseFormData({ ...courseFormData, price: e.target.value })}
                                step="0.01"
                                min="0"
                                required
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                            />

                            {/* Thumbnail upload */}
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5">Course Thumbnail (optional)</label>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-zinc-300 px-3 py-2 rounded text-sm transition-colors">
                                        <Image size={14} /> Choose Image
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                        />
                                    </label>
                                    {courseThumbPreview && (
                                        <img
                                            src={courseThumbPreview}
                                            alt="preview"
                                            className="w-16 h-10 object-cover rounded border border-zinc-600"
                                        />
                                    )}
                                    {courseThumbnailFile && !courseThumbPreview && (
                                        <span className="text-xs text-green-400">{courseThumbnailFile.name}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded text-sm font-semibold"
                                >
                                    {uploading ? 'Creating...' : 'Create Course'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowCourseForm(false); setCourseThumbnailFile(null); setCourseThumbPreview(''); }}
                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* List of courses */}
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-zinc-400 text-center py-4">Loading courses...</p>
                        ) : courses.length === 0 ? (
                            <p className="text-zinc-400 text-center py-4">No courses yet. Create one to get started!</p>
                        ) : (
                            courses.map(course => (
                                <div key={course._id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3 flex-1">
                                            {/* Thumbnail */}
                                            {course.thumbnailUrl ? (
                                                <img
                                                    src={getImageUrl(course.thumbnailUrl)}
                                                    alt={course.title}
                                                    className="w-20 h-14 object-cover rounded border border-zinc-600 shrink-0"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-20 h-14 bg-zinc-700 rounded border border-zinc-600 flex items-center justify-center shrink-0">
                                                    <Image size={20} className="text-zinc-500" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-white">{course.title}</h4>
                                                <p className="text-sm text-zinc-400">{course.description}</p>
                                                <div className="flex gap-4 mt-2 text-sm text-zinc-400">
                                                    <span>Category: {course.category}</span>
                                                    <span>Price: ${(course.price || 0).toFixed(2)}</span>
                                                    <span>Videos: {course.videos?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setShowVideoForm(true);
                                                    setUploadStatus('');
                                                    setUploadProgress(0);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                                            >
                                                <Upload size={14} /> Add Video
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course._id)}
                                                className="flex items-center gap-1 px-2 py-2 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded text-sm transition"
                                                title="Delete course"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Videos in course */}
                                    {course.videos && course.videos.length > 0 && (
                                        <div className="border-t border-zinc-700 pt-3 mt-3">
                                            <p className="text-sm font-semibold text-zinc-300 mb-2">Videos:</p>
                                            <div className="space-y-2">
                                                {course.videos.map(video => (
                                                    <div key={video._id} className="flex justify-between items-center bg-zinc-700 p-2 rounded text-sm">
                                                        <div className="text-zinc-200">
                                                            <p className="font-medium">{video.title}</p>
                                                            {video.duration > 0 && (
                                                                <p className="text-xs text-zinc-400">
                                                                    {video.duration >= 60
                                                                        ? `${Math.floor(video.duration / 60)}m ${video.duration % 60}s`
                                                                        : `${video.duration}s`}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteVideo(video._id)}
                                                            className="text-red-400 hover:text-red-300 transition ml-3"
                                                            title="Delete video"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upload Video Form */}
                {showVideoForm && selectedCourse && (
                    <form onSubmit={handleUploadVideo} className="bg-green-900 bg-opacity-30 border border-green-700 p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold text-white mb-4">Upload Video to: <span className="text-green-400">{selectedCourse.title}</span></h4>

                        <input
                            type="text"
                            placeholder="Video Title"
                            value={videoFormData.title}
                            onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                            required
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                        />
                        <textarea
                            placeholder="Video Description (optional)"
                            value={videoFormData.description}
                            onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                            rows="2"
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Duration (in minutes, e.g. 12.5)"
                            value={videoFormData.duration}
                            onChange={(e) => setVideoFormData({ ...videoFormData, duration: e.target.value })}
                            step="0.1"
                            min="0"
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                        />

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">
                                Video File (MP4, MKV, WebM — up to 500MB)
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setVideoFile(e.target.files[0])}
                                accept="video/*"
                                required
                                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded text-sm"
                            />
                        </div>

                        {videoFile && (
                            <p className="text-sm text-green-400 flex items-center gap-1">
                                ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB) selected
                            </p>
                        )}

                        {/* Upload Progress */}
                        {uploadStatus === 'uploading' && (
                            <div>
                                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                    <span>Uploading to Azure...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Large videos may take a while. Please do not close this window.</p>
                            </div>
                        )}

                        {uploadStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <CheckCircle size={16} /> Video uploaded successfully!
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded text-sm font-semibold flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        Uploading...
                                    </>
                                ) : 'Upload Video'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowVideoForm(false);
                                    setSelectedCourse(null);
                                    setVideoFormData({ title: '', description: '', duration: '' });
                                    setVideoFile(null);
                                    setUploadProgress(0);
                                    setUploadStatus('');
                                    setError('');
                                }}
                                disabled={uploading}
                                className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white py-2 rounded text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ManageCourseVideos;
