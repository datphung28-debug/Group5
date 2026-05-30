export const sendErrorResponse = (res, error) => {
  console.error(error);

  if (error?.name === "CastError" || error?.name === "ValidationError") {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
  }

  if (error?.code === 11000) {
    return res.status(400).json({ message: "Dữ liệu đã tồn tại" });
  }

  return res.status(500).json({ message: "Lỗi hệ thống: " + (error?.message || "Không xác định"), stack: error?.stack });
};
