import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";

export const logAudit = async ({ actor, action, entityType, entityId, metadata, req }) => {
  try {
    const ipAddress = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress;
    const userAgent = req?.headers?.["user-agent"];
    await AuditLog.create({
      actor,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

export const createNotification = async ({ recipient, type, title, message, entityType, entityId }) => {
  try {
    return await Notification.create({
      recipient,
      type,
      title,
      message,
      entityType,
      entityId,
    });
  } catch (error) {
    console.error("Notification creation error:", error.message);
  }
};
