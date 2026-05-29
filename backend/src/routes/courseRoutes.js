const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCoursesBySkill,
  getCourseById,
  enrollCourse,
  getMyCourses,
  uploadVideo,
  getVideos,
  updateVideo,
  deleteCourse,
  deleteVideo,
} = require('../controllers/courseController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .post(protect, createCourse)
  .get(getCourses);

router.route('/my')
  .get(protect, getMyCourses);

router.route('/skill/:skillId')
  .get(getCoursesBySkill);

router.route('/:id')
  .get(optionalAuth, getCourseById)
  .delete(protect, deleteCourse);

router.route('/:id/enroll')
  .post(protect, enrollCourse);

// Video routes
router.route('/:courseId/videos')
  .post(protect, upload.single('video'), uploadVideo)
  .get(getVideos);

router.route('/videos/:videoId')
  .put(protect, updateVideo)
  .delete(protect, deleteVideo);

module.exports = router;
