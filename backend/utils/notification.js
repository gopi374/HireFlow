import Notification from "../models/Notification.js";

/**
 * Helper to safely create a notification in the database.
 * Does not throw so it doesn't break main API response flow if notifications fail.
 */
export async function createNotification(data) {
  try {
    if (!data || !data.recipient) return null;
    return await Notification.create(data);
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}
