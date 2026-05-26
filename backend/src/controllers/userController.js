import User from "../models/User.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

// @GET /api/users - Lấy danh sách người dùng (admin)
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: "i" };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.role = role ?? user.role;
    if (isActive !== undefined) user.isActive = isActive;

    const updated = await user.save();
    res.json({ ...updated._doc, password: undefined, message: "Cập nhật thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @DELETE /api/users/:id - Khóa tài khoản (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    user.isActive = false;
    await user.save();
    res.json({ message: "Tài khoản đã bị khóa" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
