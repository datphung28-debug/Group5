import Medicine from "../models/Medicine.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

const populateMedicineQuery = (query) => query
  .populate("category", "name")
  .populate("unit", "name")
  .populate("supplier", "name phone");

const INVENTORY_MANAGED_FIELDS = new Set(["stock", "expiryDate", "manufacturingDate"]);

export const sanitizeMedicineCatalogPayload = (payload = {}) => Object.fromEntries(
  Object.entries(payload).filter(([key]) => !INVENTORY_MANAGED_FIELDS.has(key))
);

export const buildMedicineFilter = (query = {}) => {
  const { search, category, requiresPrescription, lowStock } = query;
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { ingredients: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = category;
  if (requiresPrescription !== undefined && requiresPrescription !== "") {
    filter.requiresPrescription = requiresPrescription === "true";
  }
  if (lowStock === "true") filter.$expr = { $lte: ["$stock", "$minStock"] };

  return filter;
};

// @GET /api/medicines
export const getMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = buildMedicineFilter(req.query);
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const total = await Medicine.countDocuments(filter);
    const medicines = await populateMedicineQuery(Medicine.find(filter))
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ name: 1 });

    res.json({ medicines, total, page: pageNumber, pages: Math.ceil(total / limitNumber) });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/medicines/:id
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await populateMedicineQuery(
      Medicine.findOne({ _id: req.params.id, isActive: true })
    );
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

    const medicine = await Medicine.create(sanitizeMedicineCatalogPayload(req.body));
    const populatedMedicine = await populateMedicineQuery(Medicine.findById(medicine._id));
    res.status(201).json(populatedMedicine);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/medicines/:id
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await populateMedicineQuery(Medicine.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      sanitizeMedicineCatalogPayload(req.body),
      {
        returnDocument: "after",
        runValidators: true,
      }
    ));
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
      { returnDocument: "after" }
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
