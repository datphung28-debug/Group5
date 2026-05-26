import Medicine from "../models/Medicine.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

// @GET /api/medicines
export const getMedicines = async (req, res) => {
  try {
    const { search, category, requiresPrescription, lowStock, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (requiresPrescription !== undefined) filter.requiresPrescription = requiresPrescription === "true";
    if (lowStock === "true") filter.$expr = { $lte: ["$stock", "$minStock"] };

    const total = await Medicine.countDocuments(filter);
    const medicines = await Medicine.find(filter)
      .populate("category", "name")
      .populate("unit", "name")
      .populate("supplier", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    res.json({ medicines, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/medicines/:id
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate("category", "name")
      .populate("unit", "name")
      .populate("supplier", "name phone");
    if (!medicine) return res.status(404).json({ message: "Không tìm thấy thuốc" });
    res.json(medicine);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/medicines
export const createMedicine = async (req, res) => {
  try {
    const exists = await Medicine.findOne({ code: req.body.code });
    if (exists) return res.status(400).json({ message: "Mã thuốc đã tồn tại" });

    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/medicines/:id
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!medicine) return res.status(404).json({ message: "Không tìm thấy thuốc" });
    res.json(medicine);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @DELETE /api/medicines/:id
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: "Không tìm thấy thuốc" });
    res.json({ message: "Đã xóa thuốc khỏi danh mục" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/medicines/expiring - Thuốc sắp hết hạn trong 30 ngày
export const getExpiringMedicines = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);

    const medicines = await Medicine.find({
      isActive: true,
      expiryDate: { $lte: deadline, $gte: new Date() },
    })
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ expiryDate: 1 });

    res.json(medicines);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
