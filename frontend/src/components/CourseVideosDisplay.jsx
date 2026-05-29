import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, getFileUrl } from '../utils/api';
import { Play, Lock, Upload, CheckCircle, AlertCircle, X, Cloud } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

/**
 * Resolves an azblob:// or legacy URL to a direct SAS URL by calling the backend.
 * Falls back to getFileUrl() for local/non-Azure assets.
 */
async function resolveSasUrl(storedUrl) {
    if (!storedUrl) return '';
    if (storedUrl.startsWith('azblob://') || storedUrl.includes('.blob.core.windows.net/')) {
        try {
            const res = await axios.get(`${API}/media/sas?url=${encodeURIComponent(storedUrl)}`);
            return res.data.signedUrl || getFileUrl(storedUrl);
        } catch {
            return getFileUrl(storedUrl);
        }
    }
    return getFileUrl(storedUrl);
}

const CourseVideosDisplay = ({ course, isEnrolled, isInstructor, onVideoAdded }) => {
    const { user } = useContext(AuthContext);
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [resolvedVideoUrl, setResolvedVideoUrl] = useState('');
    const [loading, setLoading] = useState(true);

    // Video upload state (for instructors)
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [videoForm, setVideoForm] = useState({ title: '', description: '', duration: '' });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(''); // '', 'uploading', 'success', 'error'
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (course._id) {
            fetchVideos();
        }
    }, [course._id]);

    // Whenever selected video changes, resolve the SAS URL for streaming
    useEffect(() => {
        if (!selectedVideo?.videoUrl) {
            setResolvedVideoUrl('');
            return;
        }
        setResolvedVideoUrl(''); // reset while resolving
        resolveSasUrl(selectedVideo.videoUrl).then(setResolvedVideoUrl);
    }, [selectedVideo?._id]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/courses/${course._id}/videos`);
            setVideos(res.data);
            if (res.data.length > 0 && !selectedVideo) {
                setSelectedVideo(res.data[0]);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadVideo = async (e) => {
        e.preventDefault();
        if (!videoFile) { setUploadError('Please select a video file'); return; }

        setUploading(true);
        setUploadProgress(0);
        setUploadStatus('uploading');
        setUploadError('');

        try {
            const fd = new FormData();
            fd.append('video', videoFile);
            fd.append('title', videoForm.title);
            fd.append('description', videoForm.description);
            fd.append('duration', videoForm.duration ? Math.round(parseFloat(videoForm.duration) * 60) : 0);

            await axios.post(`${API}/courses/${course._id}/videos`, fd, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 15 * 60 * 1000, // 15 minute timeout
                onUploadProgress: (evt) => {
                    setUploadProgress(Math.round((evt.loaded * 100) / (evt.total || 1)));
                },
            });

            setUploadStatus('success');
            setTimeout(() => {
                setShowUploadForm(false);
                setVideoFile(null);
                setVideoForm({ title: '', description: '', duration: '' });
                setUploadProgress(0);
                setUploadStatus('');
                fetchVideos();
                if (onVideoAdded) onVideoAdded();
            }, 1800);
        } catch (err) {
            setUploadStatus('error');
            setUploadError(err.response?.data?.message || err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="text-center text-zinc-400 py-8">Loading videos...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Instructor Upload Button */}
            {isInstructor && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">
                        {videos.length === 0 ? 'No videos yet. Add your first video!' : `${videos.length} video${videos.length > 1 ? 's' : ''}`}
                    </p>
                    <button
                        onClick={() => { setShowUploadForm(v => !v); setUploadStatus(''); setUploadError(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition"
                    >
                        <Upload size={14} />
                        {showUploadForm ? 'Cancel' : 'Add Video'}
                    </button>
                </div>
            )}

            {/* Upload Form (instructor only) */}
            {isInstructor && showUploadForm && (
                <form onSubmit={handleUploadVideo} className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Cloud size={18} className="text-blue-400" />
                        <h4 className="font-semibold text-white">Upload Video to Azure</h4>
                    </div>

                    <input
                        type="text" required
                        placeholder="Video Title"
                        value={videoForm.title}
                        onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={videoForm.description}
                        onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                        rows="2"
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                    <input
                        type="number" placeholder="Duration (minutes, e.g. 12.5)"
                        value={videoForm.duration}
                        onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                        step="0.1" min="0"
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />

                    <div>
                        <label className="block text-xs text-zinc-400 mb-2">Video File (MP4, MKV, WebM — up to 500MB)</label>
                        <input
                            type="file" accept="video/*" required
                            onChange={e => setVideoFile(e.target.files[0])}
                            className="w-full text-sm text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-500"
                        />
                        {videoFile && (
                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                ✓ {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                            </p>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {uploadStatus === 'uploading' && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-zinc-400">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    Uploading to Azure Blob Storage...
                                </span>
                                <span className="font-mono font-semibold text-blue-400">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-zinc-500">Large videos may take a while. Do not close this window.</p>
                        </div>
                    )}

                    {uploadStatus === 'success' && (
                        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                            <CheckCircle size={16} /> Video uploaded to Azure successfully!
                        </div>
                    )}

                    {uploadError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <AlertCircle size={16} /> {uploadError}
                            <button onClick={() => setUploadError('')} className="ml-auto"><X size={14} /></button>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit" disabled={uploading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
                        >
                            {uploading ? (
                                <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                            ) : (
                                <><Upload size={14} /> Upload to Azure</>
                            )}
                        </button>
                        <button
                            type="button" disabled={uploading}
                            onClick={() => { setShowUploadForm(false); setVideoFile(null); setVideoForm({ title: '', description: '', duration: '' }); setUploadStatus(''); setUploadError(''); }}
                            className="px-4 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition"
                        >Cancel</button>
                    </div>
                </form>
            )}

            {videos.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">
                    {isInstructor ? 'Add your first video using the button above.' : 'This course has no videos yet.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main video player */}
                    <div className="lg:col-span-2">
                        {selectedVideo ? (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                <div className="aspect-video bg-black flex items-center justify-center relative">
                                    {isEnrolled || isInstructor ? (
                                        resolvedVideoUrl ? (
                                            <video
                                                src={resolvedVideoUrl}
                                                controls
                                                className="w-full h-full"
                                                key={selectedVideo._id}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-zinc-400">
                                                <span className="inline-block w-8 h-8 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
                                                <p className="text-sm">Loading video from Azure...</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <Lock size={48} className="text-zinc-500" />
                                            <p className="text-zinc-400">Enroll in the course to watch videos</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                                    {selectedVideo.duration > 0 && (
                                        <p className="text-sm text-zinc-400 mb-4">
                                            Duration: {Math.round(selectedVideo.duration / 60)} minutes
                                        </p>
                                    )}
                                    {selectedVideo.description && (
                                        <p className="text-zinc-300">{selectedVideo.description}</p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Videos playlist */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-white mb-4">Course Videos ({videos.length})</h3>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {videos.map((video, index) => (
                                    <button
                                        key={video._id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`w-full text-left p-3 rounded-lg transition flex items-start gap-3 ${selectedVideo?._id === video._id
                                            ? 'bg-blue-600 border border-blue-500'
                                            : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <Play size={16} className={selectedVideo?._id === video._id ? 'text-white' : 'text-zinc-400'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm truncate ${selectedVideo?._id === video._id ? 'text-white' : 'text-zinc-200'}`}>
                                                {index + 1}. {video.title}
                                            </p>
                                            {video.duration > 0 && (
                                                <p className={`text-xs ${selectedVideo?._id === video._id ? 'text-blue-100' : 'text-zinc-400'}`}>
                                                    {Math.round(video.duration / 60)} min
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseVideosDisplay;
