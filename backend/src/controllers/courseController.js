const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Video = require('../models/Video');
const User = require('../models/User');
const { uploadBuffer } = require('../utils/azureBlob');
const { sendEnrollmentEmail } = require('../utils/azureEmail');
const { trackEvent, trackMetric } = require('../utils/appInsights');
const { analyzeCourseContent } = require('../utils/azureAI');


// @desc    Create a new course under a skill
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    const { skillId, title, description, category, price, thumbnailUrl, contentUrl } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: 'Skill ID is required' });
    }

    // 🔵 Azure AI Language — auto-suggest category from description
    let categoryValue = category || 'General';
    if (description && description.trim().length > 10) {
      const aiResult = await analyzeCourseContent(description);
      // Use AI suggestion only if no category was provided
      if (!category && aiResult.suggestedCategory) {
        categoryValue = aiResult.suggestedCategory;
        console.log(`[AzureAI] Auto-assigned category: ${categoryValue}`);
      }
    }

    const course = new Course({
      skill: skillId,
      instructor: req.user.id,
      title,
      description,
      category: categoryValue,
      price: price || 0,
      thumbnailUrl: thumbnailUrl || '',
      contentUrl: contentUrl || '',
      videos: [],
    });

    const createdCourse = await course.save();

    // 🔵 Azure Application Insights — track course creation
    trackEvent('CourseCreated', { courseId: createdCourse._id.toString(), title, category: categoryValue, instructorId: req.user.id });

    res.status(201).json(createdCourse);
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get courses by skill ID
// @route   GET /api/courses/skill/:skillId
// @access  Public
const getCoursesBySkill = async (req, res) => {
  try {
    const courses = await Course.find({ skill: req.params.skillId })
      .populate('instructor', 'name avatar email')
      .populate('skill', 'title');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate('instructor', 'name email')
      .populate('skill', 'title');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('skill', 'title')
      .populate({
        path: 'videos',
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Determine if the requesting user is enrolled
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ student: req.user.id, course: req.params.id });
      if (enrollment) {
        isEnrolled = true;
      }
    }

    // Determine if the requesting user is the instructor
    const isInstructor = req.user && course.instructor._id.toString() === req.user.id;

    res.json({ course, isEnrolled, isInstructor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is trying to enroll in their own course
    if (course.instructor._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot enroll in your own course' });
    }

    const existingEnrollment = await Enrollment.findOne({ student: req.user.id, course: req.params.id });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      student: req.user.id,
      course: req.params.id
    });

    await enrollment.save();

    // 🔵 Azure Application Insights — track enrollment
    trackEvent('CourseEnrolled', { courseId: req.params.id, studentId: req.user.id, courseTitle: course.title });
    trackMetric('TotalEnrollments', 1);

    // 🔵 Azure Communication Services — send enrollment confirmation email
    const student = await User.findById(req.user.id).select('name email');
    if (student) {
      sendEnrollmentEmail({
        userName: student.name,
        userEmail: student.email,
        courseTitle: course.title,
        coursePrice: (course.price || 0).toFixed(2),
        instructorName: course.instructor.name,
      });
    }

    res.status(201).json({ message: 'Successfully enrolled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my courses (taught and enrolled)
// @route   GET /api/courses/my/courses
// @access  Private
const getMyCourses = async (req, res) => {
  try {
    const taughtCourses = await Course.find({ instructor: req.user.id })
      .populate('skill', 'title');

    const enrollments = await Enrollment.find({ student: req.user.id }).populate({
      path: 'course',
      populate: [
        { path: 'instructor', select: 'name' },
        { path: 'skill', select: 'title' }
      ]
    });

    const enrolledCourses = enrollments.map(e => e.course);

    res.json({ taughtCourses, enrolledCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a video to a course
// @route   POST /api/courses/:courseId/videos
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to upload videos to this course' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    let videoUrl;

    // Azure path: multer memoryStorage gives us req.file.buffer
    if (req.file.buffer) {
      try {
        const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
        console.log(`[Azure] Uploading video "${req.file.originalname}" (${sizeMB} MB) to Azure Blob Storage...`);
        videoUrl = await uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        console.log(`[Azure] Video uploaded successfully → ${videoUrl}`);
      } catch (azureErr) {
        console.error('[Azure] Video upload failed:', azureErr.message);
        return res.status(500).json({ message: 'Video upload to Azure Blob Storage failed: ' + azureErr.message });
      }
    } else if (req.file.filename) {
      // Local fallback (when Azure is not configured)
      const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 5000}`;
      videoUrl = `${CLIENT_URL.replace(/\/$/, '')}/uploads/${req.file.filename}`;
      console.log(`[Local] Video saved locally → ${videoUrl}`);
    } else {
      return res.status(500).json({ message: 'Upload failed: no file data received' });
    }

    const video = new Video({
      course: courseId,
      title,
      description: description || '',
      videoUrl,
      duration: duration ? parseInt(duration, 10) : 0,
      order: order !== undefined ? parseInt(order, 10) : course.videos.length,
    });

    const savedVideo = await video.save();

    // Add video reference to course
    course.videos.push(savedVideo._id);
    await course.save();

    res.status(201).json(savedVideo);
  } catch (error) {
    console.error('uploadVideo error:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get videos of a course
// @route   GET /api/courses/:courseId/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const { courseId } = req.params;

    const videos = await Video.find({ course: courseId }).sort({ order: 1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:videoId
// @access  Private
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId).populate('course');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the instructor of the course
    if (video.course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this video' });
    }

    video.title = req.body.title || video.title;
    video.description = req.body.description || video.description;
    video.duration = req.body.duration || video.duration;
    video.order = req.body.order !== undefined ? req.body.order : video.order;

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course and all its videos
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this course' });
    }

    // Delete all videos in this course
    await Video.deleteMany({ course: req.params.id });

    await course.deleteOne();
    res.json({ message: 'Course and all its videos deleted successfully' });
  } catch (error) {
    console.error('deleteCourse error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:videoId
// @access  Private
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId).populate('course');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the instructor
    if (video.course.instructor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this video' });
    }

    const courseId = video.course._id;
    await video.deleteOne();

    // Remove video from course's videos array
    await Course.findByIdAndUpdate(courseId, { $pull: { videos: req.params.videoId } });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
