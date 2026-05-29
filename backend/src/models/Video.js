const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    videoUrl: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in seconds
        default: 0,
    },
    thumbnail: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Video', VideoSchema);
