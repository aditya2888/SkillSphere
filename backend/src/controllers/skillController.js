const Skill = require('../models/Skill');
const Course = require('../models/Course');
const Video = require('../models/Video');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().populate('user', 'name avatar');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Public
const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('user', 'name avatar');
    if (skill) {
      res.json(skill);
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private
const createSkill = async (req, res) => {
  try {
    const { title, description, category, price, mediaUrl } = req.body;

    const skill = new Skill({
      user: req.user.id,
      title,
      description,
      category,
      price,
      mediaUrl,
    });

    const createdSkill = await skill.save();
    res.status(201).json(createdSkill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (skill) {
      // Check if user owns the skill
      if (skill.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to update this skill' });
      }

      skill.title = req.body.title || skill.title;
      skill.description = req.body.description || skill.description;
      skill.category = req.body.category || skill.category;
      skill.price = req.body.price || skill.price;
      skill.mediaUrl = req.body.mediaUrl || skill.mediaUrl;

      const updatedSkill = await skill.save();
      res.json(updatedSkill);
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (skill) {
      if (skill.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to delete this skill' });
      }

      // Cascade delete: find all courses for this skill and delete their videos too
      const courses = await Course.find({ skill: req.params.id });
      for (const course of courses) {
        // Delete all videos belonging to this course
        await Video.deleteMany({ course: course._id });
      }
      // Delete all courses for this skill
      await Course.deleteMany({ skill: req.params.id });

      await skill.deleteOne();
      res.json({ message: 'Skill and associated courses/videos removed' });
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
