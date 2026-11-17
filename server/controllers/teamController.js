
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';

// Add a member to a project
export const addProjectMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const allowedRoles = ['manager', 'developer', 'viewer'];

    if (!allowedRoles.includes(role || 'developer')) {
      return res.status(400).json({ message: 'Invalid member role.' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the project owner can manage team members.'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        message: 'No registered user found with this email.'
      });
    }

    if (user._id.toString() === project.owner.toString()) {
      return res.status(400).json({
        message: 'The project owner is already a member.'
      });
    }

    const existingMember = project.members.find(
      (member) => member.user.toString() === user._id.toString()
    );

    if (existingMember) {
      return res.status(409).json({
        message: 'This user is already a project member.'
      });
    }

    project.members.push({
      user: user._id,
      role: role || 'developer'
    });

    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    return res.status(201).json({
      message: 'Team member added successfully.',
      project: updatedProject
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to add team member.',
      error: error.message
    });
  }
};

// Get project team members
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID.' });
    }

    const project = await Project.findById(projectId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(
        (member) => member.user?._id.toString() === req.user._id.toString()
      );

    if (!isMember) {
      return res.status(403).json({
        message: 'You do not have access to this project.'
      });
    }

    return res.status(200).json({
      owner: project.owner,
      members: project.members
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch team members.',
      error: error.message
    });
  }
};

// Update a member's role
export const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    const allowedRoles = ['manager', 'developer', 'viewer'];

    if (!mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid ID.' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the project owner can change member roles.'
      });
    }

    const member = project.members.find(
      (item) => item.user.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    member.role = role;
    await project.save();

    return res.status(200).json({
      message: 'Member role updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update member role.',
      error: error.message
    });
  }
};

// Remove a member from a project
export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid ID.' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the project owner can remove team members.'
      });
    }

    const memberExists = project.members.some(
      (member) => member.user.toString() === memberId
    );

    if (!memberExists) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    project.members = project.members.filter(
      (member) => member.user.toString() !== memberId
    );

    await project.save();

    return res.status(200).json({
      message: 'Team member removed successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to remove team member.',
      error: error.message
    });
  }
};
