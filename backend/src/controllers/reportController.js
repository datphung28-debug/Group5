import Sale from "../models/Sale.js";
import { sendErrorResponse } from "../utils/errorResponse.js";
import Import from "../models/Import.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";

const PAYMENT_LABELS = {
  cash: "Tiền mặt",
  card: "Thẻ",
  transfer: "Chuyển khoản",
};

const formatTrendDate = (date, groupType) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  if (groupType === "monthly") return `${month}/${date.getFullYear()}`;
  return `${day}/${month}`;
};

export const normalizeRevenueRange = (query = {}) => {
  const now = new Date();
  const groupType = query.type === "monthly" ? "monthly" : "daily";

  if (query.fromDate || query.toDate) {
    const start = query.fromDate
      ? new Date(query.fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = query.toDate
      ? new Date(query.toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end, groupType };
  }

  const year = Number(query.year) || now.getFullYear();
  if (groupType === "monthly") {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
      groupType,
    };
  }

  const month = Number(query.month) || now.getMonth() + 1;
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
    groupType,
  };
};

const getMedicineCategoryName = (medicine) => {
  if (!medicine?.category) return "Khác";
  if (typeof medicine.category === "object") return medicine.category.name || "Khác";
  return "Khác";
};

const getItemGrossProfit = (item) => {
  const revenue = Number(item.total || 0);
  const importPrice = Number(item.medicine?.importPrice || 0);
  const quantity = Number(item.quantity || 0);
  return revenue - importPrice * quantity;
};

const getSalesStatsInRange = async (startDate, endDate) => {
  const match = {
    status: "completed",
    createdAt: { $gte: startDate }
  };
  if (endDate) {
    match.createdAt.$lte = endDate;
  }

  const result = await Sale.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "medicines",
        localField: "items.medicine",
        foreignField: "_id",
        as: "medicine"
      }
    },
    { $unwind: { path: "$medicine", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        totalAmount: { $first: "$totalAmount" },
        profit: {
          $sum: {
            $subtract: [
              "$items.total",
              { $multiply: ["$items.quantity", { $ifNull: ["$medicine.importPrice", 0] }] }
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        profit: { $sum: "$profit" },
        orders: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { revenue: 0, profit: 0, orders: 0 };
};

export const buildRevenueReportPayload = ({ salesData = [], groupType = "daily" } = {}) => {
  const trendMap = new Map();
  const paymentMap = new Map();
  const categoryMap = new Map();

  let totalRevenue = 0;
  let grossProfit = 0;

  salesData.forEach((sale) => {
    const saleTotal = Number(sale.totalAmount || 0);
    totalRevenue += saleTotal;
    grossProfit += Number(sale.saleProfit || 0);

    const trendKey = formatTrendDate(new Date(sale.createdAt), groupType);
    const currentTrend = trendMap.get(trendKey) || { revenue: 0, grossProfit: 0 };
    currentTrend.revenue += saleTotal;
    currentTrend.grossProfit += Number(sale.saleProfit || 0);
    trendMap.set(trendKey, currentTrend);

    const paymentKey = sale.paymentMethod || "cash";
    const currentPayment = paymentMap.get(paymentKey) || { value: 0, count: 0 };
    currentPayment.value += saleTotal;
    currentPayment.count += 1;
    paymentMap.set(paymentKey, currentPayment);

    (sale.categories || []).forEach((cat) => {
      const categoryName = cat.name || "Khác";
      const catTotal = Number(cat.total || 0);
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + catTotal);
    });
  });

  const trendData = [];
  trendMap.forEach((value, date) => {
    trendData.push({ date, type: "Doanh thu", value: value.revenue });
    trendData.push({ date, type: "Lãi gộp", value: value.grossProfit });
  });

  return {
    kpis: {
      totalRevenue,
      grossProfit,
      margin: totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0,
      invoiceCount: salesData.length,
      avgOrderValue: salesData.length > 0 ? Math.round(totalRevenue / salesData.length) : 0,
    },
    trendData,
    paymentData: Array.from(paymentMap.entries()).map(([method, value]) => ({
      type: PAYMENT_LABELS[method] || method,
      value: value.value,
      count: value.count,
    })),
    categoryData: Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue),
  };
};

// @GET /api/reports/dashboard
export const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);

    const [
      totalMedicines,
      lowStockMedicines,
      totalCustomers,
      totalStaff,
    ] = await Promise.all([
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

    // Tính giá trị tồn kho bằng Aggregation
    const inventoryValuation = await Medicine.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: null, 
          totalValue: { $sum: { $multiply: ["$stock", "$importPrice"] } } 
        } 
      }
    ]);
    const inventoryValue = inventoryValuation[0]?.totalValue || 0;

    // Tính công nợ nhà cung cấp bằng Aggregation
    const supplierDebtAggregation = await Supplier.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalDebt: { $sum: { $ifNull: ["$currentDebt", 0] } }
        }
      }
    ]);
    const supplierDebt = supplierDebtAggregation[0]?.totalDebt || 0;

    // Tính công nợ khách hàng bằng Aggregation
    const customerDebtAggregation = await Sale.aggregate([
      { $match: { status: "completed" } },
      {
        $project: {
          debt: {
            $max: [
              { $subtract: ["$totalAmount", { $ifNull: ["$amountPaid", "$totalAmount"] }] },
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDebt: { $sum: "$debt" }
        }
      }
    ]);
    const customerDebt = customerDebtAggregation[0]?.totalDebt || 0;

    // Tính doanh thu & lợi nhuận ngày hôm nay và tháng này bằng Aggregation
    const [todayStats, monthStats] = await Promise.all([
      getSalesStatsInRange(startOfDay, endOfDay),
      getSalesStatsInRange(startOfMonth),
    ]);

    // 4. Daily revenue & profit for the last 30 days
    const startOf30DaysAgo = new Date();
    startOf30DaysAgo.setDate(startOf30DaysAgo.getDate() - 29);
    startOf30DaysAgo.setHours(0, 0, 0, 0);

    const last30DaysSalesResult = await Sale.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOf30DaysAgo }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "medicines",
          localField: "items.medicine",
          foreignField: "_id",
          as: "medicine"
        }
      },
      { $unwind: { path: "$medicine", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalAmount: 1,
          createdAt: 1,
          itemTotal: "$items.total",
          itemQty: "$items.quantity",
          importPrice: { $ifNull: ["$medicine.importPrice", 0] }
        }
      },
      {
        $group: {
          _id: "$_id",
          createdAt: { $first: "$createdAt" },
          totalAmount: { $first: "$totalAmount" },
          profit: {
            $sum: {
              $subtract: [
                "$itemTotal",
                { $multiply: ["$itemQty", "$importPrice"] }
              ]
            }
          }
        }
      }
    ]);

    const dailyMap = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      dailyMap.set(key, { date: key, revenue: 0, profit: 0 });
    }

    last30DaysSalesResult.forEach(sale => {
      const d = new Date(sale.createdAt);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (dailyMap.has(key)) {
        const item = dailyMap.get(key);
        item.revenue += sale.totalAmount || 0;
        item.profit += sale.profit || 0;
        dailyMap.set(key, item);
      }
    });
    const revenueProfit30Days = Array.from(dailyMap.values());

    // 5. Hourly Revenue for Today (7h to 21h)
    const todaySales = await Sale.find({
      status: "completed",
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).select("createdAt totalAmount");

    const hourlyMap = new Map();
    for (let h = 7; h <= 21; h++) {
      const key = `${h}h`;
      hourlyMap.set(key, { hour: key, revenue: 0 });
    }

    todaySales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      const key = `${hour}h`;
      if (hourlyMap.has(key)) {
        const item = hourlyMap.get(key);
        item.revenue += sale.totalAmount || 0;
        hourlyMap.set(key, item);
      }
    });
    const hourlyRevenueToday = Array.from(hourlyMap.values());

    // 6. Yearly Revenue & Comparative Summary (Current Year vs Last Year)
    const currentYear = today.getFullYear();
    const startOfLastYear = new Date(currentYear - 1, 0, 1, 0, 0, 0, 0);

    const yearlySalesResult = await Sale.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfLastYear }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "medicines",
          localField: "items.medicine",
          foreignField: "_id",
          as: "medicine"
        }
      },
      { $unwind: { path: "$medicine", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalAmount: 1,
          createdAt: 1,
          itemTotal: "$items.total",
          itemQty: "$items.quantity",
          importPrice: { $ifNull: ["$medicine.importPrice", 0] }
        }
      },
      {
        $group: {
          _id: "$_id",
          createdAt: { $first: "$createdAt" },
          totalAmount: { $first: "$totalAmount" },
          profit: {
            $sum: {
              $subtract: [
                "$itemTotal",
                { $multiply: ["$itemQty", "$importPrice"] }
              ]
            }
          }
        }
      },
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          totalAmount: 1,
          profit: 1
        }
      }
    ]);

    const yearlyMap = new Map();
    const monthLabels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    monthLabels.forEach((m, idx) => {
      yearlyMap.set(idx, { month: m, revenueThisYear: 0, revenueLastYear: 0, profitThisYear: 0 });
    });

    let totalRevThisYear = 0;
    let totalRevLastYear = 0;
    let totalProfitThisYear = 0;

    yearlySalesResult.forEach(sale => {
      const saleYear = sale.year;
      const monthIdx = sale.month - 1; // MongoDB $month is 1-indexed

      const val = yearlyMap.get(monthIdx);
      if (val) {
        if (saleYear === currentYear) {
          val.revenueThisYear += sale.totalAmount || 0;
          totalRevThisYear += sale.totalAmount || 0;
          val.profitThisYear += sale.profit || 0;
          totalProfitThisYear += sale.profit || 0;
        } else if (saleYear === currentYear - 1) {
          val.revenueLastYear += sale.totalAmount || 0;
          totalRevLastYear += sale.totalAmount || 0;
        }
        yearlyMap.set(monthIdx, val);
      }
    });

    const yearlyRevenue = Array.from(yearlyMap.values());
    const yearlySummary = {
      revenueThisYear: totalRevThisYear,
      revenueLastYear: totalRevLastYear,
      profitThisYear: totalProfitThisYear
    };

    res.json({
      today: {
        revenue: todayStats.revenue,
        profit: todayStats.profit,
        orders: todayStats.orders,
      },
      month: {
        revenue: monthStats.revenue,
        profit: monthStats.profit,
        orders: monthStats.orders,
      },
      inventory: {
        total: totalMedicines,
        lowStock: lowStockMedicines,
        expiring: expiringMedicines,
        value: inventoryValue,
      },
      customers: totalCustomers,
      staff: totalStaff,
      customerDebt,
      supplierDebt,
      revenueProfit30Days,
      hourlyRevenueToday,
      yearlyRevenue,
      yearlySummary
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @GET /api/reports/revenue - Doanh thu theo ngày/tháng
export const getRevenueReport = async (req, res) => {
  try {
    const { start, end, groupType } = normalizeRevenueRange(req.query);

    const salesData = await Sale.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start, $lte: end }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "medicines",
          localField: "items.medicine",
          foreignField: "_id",
          as: "medicine"
        }
      },
      { $unwind: { path: "$medicine", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "medicine.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          createdAt: { $first: "$createdAt" },
          totalAmount: { $first: "$totalAmount" },
          paymentMethod: { $first: "$paymentMethod" },
          saleProfit: {
            $sum: {
              $subtract: [
                "$items.total",
                { $multiply: ["$items.quantity", { $ifNull: ["$medicine.importPrice", 0] }] }
              ]
            }
          },
          categories: {
            $push: {
              name: { $ifNull: ["$category.name", "Khác"] },
              total: "$items.total"
            }
          }
        }
      },
      { $sort: { createdAt: 1 } }
    ]);

    res.json(buildRevenueReportPayload({ salesData, groupType }));
  } catch (error) {
    return sendErrorResponse(res, error);
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
      { $project: {
          name: "$medicine.name",
          code: "$medicine.code",
          totalSold: 1,
          revenue: 1,
          profit: { $subtract: ["$revenue", { $multiply: ["$totalSold", "$medicine.importPrice"] }] }
      } },
    ]);

    res.json(topMedicines);
  } catch (error) {
    return sendErrorResponse(res, error);
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
    return sendErrorResponse(res, error);
  }
};
