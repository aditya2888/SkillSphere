const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'General',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    contentUrl: {
      type: String,
      default: '', // Path to the video or pdf file (legacy)
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
