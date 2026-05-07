import Sale from "../models/Sale.js";
import Import from "../models/Import.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";

// @GET /api/reports/dashboard
export const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todaySales,
      monthSales,
      totalMedicines,
      lowStockMedicines,
      totalCustomers,
      totalStaff,
    ] = await Promise.all([
      Sale.aggregate([
        { $match: { status: "completed", createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Sale.aggregate([
        { $match: { status: "completed", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      ]),
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$minStock"] } }),
      Customer.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, role: { $in: ["admin", "pharmacist"] } }),
    ]);

    // Thuốc sắp hết hạn (30 ngày)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    const expiringMedicines = await Medicine.countDocuments({
      isActive: true,
      expiryDate: { $lte: expiringDate, $gte: new Date() },
    });

    res.json({
      today: {
        revenue: todaySales[0]?.total || 0,
        orders: todaySales[0]?.count || 0,
      },
      month: {
        revenue: monthSales[0]?.total || 0,
        orders: monthSales[0]?.count || 0,
      },
      inventory: {
        total: totalMedicines,
        lowStock: lowStockMedicines,
        expiring: expiringMedicines,
      },
      customers: totalCustomers,
      staff: totalStaff,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @GET /api/reports/revenue - Doanh thu theo ngày/tháng
export const getRevenueReport = async (req, res) => {
  try {
    const { type = "daily", year, month } = req.query;
    const matchYear = Number(year) || new Date().getFullYear();

    let groupBy, matchFilter;

    if (type === "monthly") {
      matchFilter = { status: "completed", createdAt: { $gte: new Date(`${matchYear}-01-01`) } };
      groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    } else {
      const matchMonth = Number(month) || new Date().getMonth() + 1;
      const start = new Date(matchYear, matchMonth - 1, 1);
      const end = new Date(matchYear, matchMonth, 0, 23, 59, 59);
      matchFilter = { status: "completed", createdAt: { $gte: start, $lte: end } };
      groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
    }

    const revenue = await Sale.aggregate([
      { $match: matchFilter },
      { $group: { _id: groupBy, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @GET /api/reports/top-medicines - Thuốc bán chạy nhất
export const getTopMedicines = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const match = { status: "completed" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const topMedicines = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      { $group: { _id: "$items.medicine", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.total" } } },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) },
      { $lookup: { from: "medicines", localField: "_id", foreignField: "_id", as: "medicine" } },
      { $unwind: "$medicine" },
      { $project: { name: "$medicine.name", code: "$medicine.code", totalSold: 1, revenue: 1 } },
    ]);

    res.json(topMedicines);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// @GET /api/reports/inventory - Báo cáo tồn kho
export const getInventoryReport = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true })
      .populate("category", "name")
      .populate("unit", "name")
      .select("name code stock minStock sellPrice importPrice expiryDate category unit")
      .sort({ stock: 1 });

    const totalValue = medicines.reduce((sum, m) => sum + m.stock * m.importPrice, 0);

    res.json({ medicines, totalValue });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
