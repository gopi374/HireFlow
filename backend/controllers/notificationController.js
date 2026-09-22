import Notification from "../models/Notification.js";
import { getPagination } from "../utils/response.js";

// GET Current User's Notifications
export async function getMyNotifications(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { recipient: req.user._id };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
      unreadCount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get Notifications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// MARK Single Notification as Read
export async function markAsRead(req, res) {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    console.error("Mark Read Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// MARK All Notifications as Read
export async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error("Mark All Read Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}
