
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Comment from '../models/Comment.js';
import createNotification from '../utils/createNotification.js';

const getAccessibleTicket = async (ticketId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return { error: 'INVALID_ID' };
  }

  const ticket = await Ticket.findById(ticketId).populate({
    path: 'project',
    select: 'owner members'
  });

  if (!ticket) {
    return { error: 'NOT_FOUND' };
  }

  const project = ticket.project;

  if (!project) {
    return { error: 'NOT_FOUND' };
  }

  const isOwner = project.owner.toString() === userId.toString();

  const membership = project.members.find(
    (member) => member.user.toString() === userId.toString()
  );

  if (!isOwner && !membership) {
    return { error: 'FORBIDDEN' };
  }

  return {
    ticket,
    isOwner,
    membership
  };
};

// Get comments for a ticket
export const getComments = async (req, res) => {
  try {
    const result = await getAccessibleTicket(
      req.params.ticketId,
      req.user._id
    );

    if (result.error === 'INVALID_ID') {
      return res.status(400).json({
        message: 'Invalid ticket ID.'
      });
    }

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        message: 'Ticket not found.'
      });
    }

    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({
        message: 'You do not have access to this ticket.'
      });
    }

    const comments = await Comment.find({
      ticket: req.params.ticketId
    })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error);

    return res.status(500).json({
      message: 'Failed to fetch comments.',
      error: error.message
    });
  }
};

// Add a comment to a ticket
export const addComment = async (req, res) => {
  try {
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        message: 'Comment cannot be empty.'
      });
    }

    if (body.trim().length > 2000) {
      return res.status(400).json({
        message: 'Comment cannot exceed 2000 characters.'
      });
    }

    const result = await getAccessibleTicket(
      req.params.ticketId,
      req.user._id
    );

    if (result.error === 'INVALID_ID') {
      return res.status(400).json({
        message: 'Invalid ticket ID.'
      });
    }

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        message: 'Ticket not found.'
      });
    }

    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({
        message: 'You do not have access to this ticket.'
      });
    }

    if (!result.isOwner && result.membership.role === 'viewer') {
      return res.status(403).json({
        message: 'Viewers cannot post comments.'
      });
    }

    const comment = await Comment.create({
      ticket: result.ticket._id,
      user: req.user._id,
      body: body.trim()
    });

    // Collect the reporter and assignee as notification recipients.
    // A Set prevents duplicate notifications if they are the same user.
    const recipients = new Set([
      result.ticket.reporter.toString()
    ]);

    if (result.ticket.assignee) {
      recipients.add(result.ticket.assignee.toString());
    }

    // Notify relevant users, excluding the comment author.
    await Promise.all(
      [...recipients].map(recipient =>
        createNotification({
          recipient,
          sender: req.user._id,
          project: result.ticket.project._id,
          ticket: result.ticket._id,
          type: 'ticket_commented',
          message: `A new comment was added to "${result.ticket.title}".`
        })
      )
    );

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email');

    return res.status(201).json({
      message: 'Comment added successfully.',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);

    return res.status(500).json({
      message: 'Failed to add comment.',
      error: error.message
    });
  }
};
