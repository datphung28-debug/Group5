import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
  req,
  user,
  action,
  module,
  target,
  description,
  status = "success",
}) => {
  try {
    const actor = user || req?.user;
    const forwardedFor = req?.headers?.["x-forwarded-for"];
    return await AuditLog.create({
      user: actor?._id,
      userName: actor?.name,
      userRole: actor?.role,
      action,
      module,
      target,
      description,
      status,
      ipAddress:
        forwardedFor?.split(",")[0].trim() ||
        req?.ip ||
        req?.socket?.remoteAddress ||
        "",
      userAgent:
        req?.get?.("user-agent") || req?.headers?.["user-agent"] || "",
    });
  } catch (error) {
    console.error("Không thể ghi audit log:", error);
    return null;
  }
};
