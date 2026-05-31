import User from "../models/User.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import jwt from "jsonwebtoken";
import { createAuditLog } from "../utils/createAuditLog.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret_key_gpp", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email không tồn tại trong hệ thống" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để mở lại." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }

    await createAuditLog({
      req,
      user,
      action: "login",
      module: "auth",
      target: user.email,
      description: "Đăng nhập hệ thống thành công",
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/auth/register (chỉ admin mới được tạo tài khoản nhân viên - gọi từ route admin)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const user = await User.create({ name, email, password, role, phone, address });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "Tạo tài khoản thành công",
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user);
};

// @PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
