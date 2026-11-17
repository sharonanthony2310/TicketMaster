
import Notification from '../models/Notification.js';

const createNotification = async ({
  recipient,
  sender = null,
  project = null,
  ticket = null,
  type,
  message
}) => {
  try {
    if (!recipient || !type || !message) {
      console.error('Notification skipped: required information is missing.');
      return null;
    }

    // Do not notify a user about their own action.
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      project,
      ticket,
      type,
      message
    });

    return notification;
  } catch (error) {
    // Notification failure should not interrupt the main operation.
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

export default createNotification;
