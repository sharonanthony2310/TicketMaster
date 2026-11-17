
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      maxlength: 3000
    },

    type: {
      type: String,
      enum: ['bug', 'task', 'feature'],
      default: 'bug'
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },

    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo'
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    dueDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

ticketSchema.index({ project: 1, status: 1 });
ticketSchema.index({ project: 1, priority: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
