import { useState } from 'react';
import axios from 'axios';
import { Plus, X, Upload } from 'lucide-react';

const CreateSkillForm = ({ onSkillCreated, user }) => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError('');

        try {
            let mediaUrl = '';

            // Upload file if selected
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

            // Create skill
            await axios.post(`${API}/skills`, {
                ...formData,
                price: parseFloat(formData.price),
                mediaUrl,
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setFormData({ title: '', description: '', category: '', price: '' });
            setFile(null);
            setShowForm(false);
            onSkillCreated?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating skill');
        } finally {
            setUploading(false);
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
                <Plus size={18} />
                Add New Skill
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Create New Skill</h2>
                    <button
                        onClick={() => setShowForm(false)}
                        className="text-zinc-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Skill Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Web Development with React"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe what this skill covers..."
                            rows="3"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Category *
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Programming, Design"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Price (USD) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Skill Image
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg"
                        />
                        {file && <p className="text-sm text-green-400 mt-2">✓ {file.name} selected</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <span className="animate-spin">⏳</span> Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={18} /> Create Skill
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateSkillForm;
