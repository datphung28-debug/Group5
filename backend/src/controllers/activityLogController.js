import AuditLog from "../models/AuditLog.js";

// Adapter: chuyển đổi sang format Frontend sử dụng
export const adaptActivityLog = (activity) => {
  const d = new Date(activity.createdAt);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const ua = (activity.userAgent || "").toLowerCase();
  let device = "Desktop";
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    device = "Mobile";
  } else if (
    ua.includes("postman") ||
    ua.includes("curl") ||
    ua.includes("http")
  ) {
    device = "API Client";
  }

  return {
    id: activity._id || activity.id,
    timestamp,
    userName: activity.userName,
    userRole: activity.userRole,
    action: activity.action,
    module: activity.module,
    target: activity.target,
    description: activity.description,
    status: activity.status,
    ipAddress: activity.ipAddress || "",
    device,
  };
};

// Builder: Tạo bộ lọc query mongoose
export const buildActivityLogFilter = (query = {}) => {
  const filter = {};

  if (query.module) {
    filter.module = query.module;
  }

  if (query.action) {
    filter.action = query.action;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { userName: searchRegex },
      { target: searchRegex },
      { description: searchRegex },
      { ipAddress: searchRegex },
    ];
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(`${query.startDate}T00:00:00.000Z`);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(`${query.endDate}T23:59:59.999Z`);
    }
  }

  return filter;
};

// GET /api/activity-logs
export const getActivityLogs = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.page, 10) || 1;
    const limitNumber = parseInt(req.query.limit, 10) || 20;
    const filter = buildActivityLogFilter(req.query);

    const total = await AuditLog.countDocuments(filter);
    const activities = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      activities: activities.map(adaptActivityLog),
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Lỗi tải danh sách lịch sử hoạt động",
    });
  }
};
