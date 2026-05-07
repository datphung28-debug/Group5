import Prescription from "../models/Prescription.js";

// Tạo mã đơn thuốc
const generatePrescriptionCode = async () => {
  const today = new Date();
  const prefix = `DT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const count = await Prescription.countDocuments();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

// @GET /api/prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.patientName = { $regex: search, $options: "i" };

    const total = await Prescription.countDocuments(filter);
    const prescriptions = await Prescription.find(filter)
      .populate("customer", "name phone")
      .populate("createdBy", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ prescriptions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("items.medicine", "name code requiresPrescription")
      .populate("createdBy", "name");
    if (!prescription) return res.status(404).json({ message: "Không tìm thấy đơn thuốc" });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @POST /api/prescriptions
export const createPrescription = async (req, res) => {
  try {
    const code = await generatePrescriptionCode();
    const prescription = await Prescription.create({
      ...req.body,
      code,
      createdBy: req.user._id,
    });
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @PUT /api/prescriptions/:id
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!prescription) return res.status(404).json({ message: "Không tìm thấy đơn thuốc" });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
