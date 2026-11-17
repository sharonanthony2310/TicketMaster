
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Project from '../models/Project.js';
import createNotification from '../utils/createNotification.js';

// Check whether a user belongs to a project
const findUserProject = async (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  });
};

// Create a ticket
export const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      status,
      project,
      assignee,
      dueDate
    } = req.body;

    if (!title?.trim() || !description?.trim() || !project) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and project are required'
      });
    }

    const projectData = await findUserProject(
      project,
      req.user._id
    );

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    const membership = projectData.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!membership || membership.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create tickets'
      });
    }

    if (assignee) {
      const isMember = projectData.members.some(
        member => member.user.toString() === assignee
      );

      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must belong to this project'
        });
      }
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description: description.trim(),
      type: type || 'bug',
      priority: priority || 'medium',
      status: status || 'todo',
      project: projectData._id,
      reporter: req.user._id,
      assignee: assignee || null,
      dueDate: dueDate || null
    });

    // Notify the assigned user
    if (ticket.assignee) {
      await createNotification({
        recipient: ticket.assignee,
        sender: req.user._id,
        project: projectData._id,
        ticket: ticket._id,
        type: 'ticket_assigned',
        message: `You have been assigned the ticket "${ticket.title}".`
      });
    }

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('project', 'name')
      .populate('reporter', 'name email')
      .populate('assignee', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket: populatedTicket
    });

  } catch (error) {
    console.error('Create ticket error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
};

// Get tickets
export const getTickets = async (req, res) => {
  try {
    const {
      projectId,
      status,
      priority,
      type,
      search
    } = req.query;

    const query = {};

    if (projectId) {
      const project = await findUserProject(
        projectId,
        req.user._id
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied'
        });
      }

      query.project = project._id;
    } else {
      const userProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      }).select('_id');

      query.project = {
        $in: userProjects.map(project => project._id)
      };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (type) {
      query.type = type;
    }

    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('project', 'name')
      .populate('reporter', 'name email')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });

  } catch (error) {
    console.error('Get tickets error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tickets'
    });
  }
};

// Get one ticket
export const getTicketById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('project', 'name owner members')
      .populate('reporter', 'name email')
      .populate('assignee', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const project = ticket.project;

    const hasAccess =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some(
        member => member.user.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this ticket'
      });
    }

    return res.status(200).json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Get ticket error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket'
    });
  }
};

// Update a ticket
export const updateTicket = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const project = await findUserProject(
      ticket.project,
      req.user._id
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this ticket'
      });
    }

    const membership = project.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!membership || membership.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update tickets'
      });
    }

    // Store previous values to detect changes
    const previousStatus = ticket.status;
    const previousAssignee = ticket.assignee
      ? ticket.assignee.toString()
      : null;

    const allowedFields = [
      'title',
      'description',
      'type',
      'priority',
      'status',
      'assignee',
      'dueDate'
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        ticket[field] = req.body[field];
      }
    }

    if (!ticket.title?.trim() || !ticket.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and description cannot be empty'
      });
    }

    if (ticket.assignee) {
      const isMember = project.members.some(
        member => member.user.toString() === ticket.assignee.toString()
      );

      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must belong to this project'
        });
      }
    }

    await ticket.save();

    const currentAssignee = ticket.assignee
      ? ticket.assignee.toString()
      : null;

    // Notify newly assigned user
    if (
      currentAssignee &&
      currentAssignee !== previousAssignee
    ) {
      await createNotification({
        recipient: ticket.assignee,
        sender: req.user._id,
        project: project._id,
        ticket: ticket._id,
        type: 'ticket_assigned',
        message: `You have been assigned the ticket "${ticket.title}".`
      });
    }

    // Notify reporter and assignee when ticket status changes
    if (previousStatus !== ticket.status) {
      const recipients = new Set([
        ticket.reporter.toString()
      ]);

      if (ticket.assignee) {
        recipients.add(ticket.assignee.toString());
      }

      const statusLabels = {
        todo: 'To Do',
        'in-progress': 'In Progress',
        done: 'Done'
      };

      const newStatus = statusLabels[ticket.status] || ticket.status;

      await Promise.all(
        [...recipients].map(recipient =>
          createNotification({
            recipient,
            sender: req.user._id,
            project: project._id,
            ticket: ticket._id,
            type: 'ticket_status_changed',
            message: `The status of "${ticket.title}" changed to ${newStatus}.`
          })
        )
      );
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('project', 'name')
      .populate('reporter', 'name email')
      .populate('assignee', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Update ticket error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
};

// Delete a ticket
export const deleteTicket = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const project = await findUserProject(
      ticket.project,
      req.user._id
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this ticket'
      });
    }

    const membership = project.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!membership || membership.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers can delete tickets'
      });
    }

    await ticket.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('Delete ticket error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete ticket'
    });
  }
};
