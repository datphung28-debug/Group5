import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Xác thực token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_key_gpp");
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
  }
};

// Chỉ admin được truy cập
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Chỉ quản trị viên mới có quyền thực hiện" });
  }
};

// Admin hoặc pharmacist
export const staffOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "pharmacist")) {
    next();
  } else {
    res.status(403).json({ message: "Chỉ nhân viên nhà thuốc mới có quyền thực hiện" });
  }
};
