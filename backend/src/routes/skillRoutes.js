const express = require('express');
const router = express.Router();
const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getSkills)
  .post(protect, createSkill);

router.route('/:id')
  .get(getSkillById)
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;
