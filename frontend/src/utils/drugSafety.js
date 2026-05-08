// Danh sách các cặp tương tác thuốc phổ biến (Mô phỏng Database tương tác)
const INTERACTIONS_DB = [
  {
    drugs: ["Amlodipine", "Atorvastatin"],
    severity: "medium",
    warning: "Amlodipine có thể làm tăng nồng độ Atorvastatin trong máu. Cần theo dõi dấu hiệu đau cơ."
  },
  {
    drugs: ["Paracetamol", "Ibuprofen"],
    severity: "low",
    warning: "Cùng có tác dụng giảm đau/hạ sốt. Lưu ý không uống cùng lúc để tránh kích ứng dạ dày."
  },
  {
    drugs: ["Omeprazole", "Diazepam"],
    severity: "high",
    warning: "Omeprazole làm chậm đào thải Diazepam, tăng nguy cơ buồn ngủ kéo dài. Khuyên dùng kèm với sự giám sát."
  },
  {
    drugs: ["Ciprofloxacin", "Calcium"],
    severity: "high",
    warning: "Canxi làm giảm hấp thu Ciprofloxacin. Khuyên bệnh nhân uống cách nhau ít nhất 2 giờ."
  },
  {
    drugs: ["Amoxicillin", "Metoclopramide"],
    severity: "low",
    warning: "Metoclopramide làm tăng tốc độ hấp thu của Amoxicillin."
  }
];

// Giới hạn liều dùng an toàn
const DOSAGE_LIMITS = {
  "Paracetamol 500mg": { maxPerDay: 8, unit: "viên", warning: "Liều tối đa Paracetamol là 4g (8 viên)/ngày. Vượt quá có thể gây suy gan." },
  "Ibuprofen 400mg":   { maxPerDay: 6, unit: "viên", warning: "Liều tối đa Ibuprofen là 2.4g (6 viên)/ngày." },
  "Omeprazole 20mg":   { maxPerDay: 2, unit: "viên", warning: "Liều thông thường không quá 40mg/ngày trừ khi có chỉ định đặc biệt." }
};

/**
 * Hàm kiểm tra an toàn của một đơn thuốc
 * @param {Array} items - Mảng các thuốc đã chọn [{ medicine: {name, ingredients}, quantity, frequency, days }]
 * @returns {Object} { interactions: [], dosageWarnings: [] }
 */
export const checkPrescriptionSafety = (items) => {
  const interactions = [];
  const dosageWarnings = [];

  if (!items || items.length === 0) {
    return { interactions, dosageWarnings };
  }

  const validItems = items.filter(i => i && i.medicine);

  // 1. Kiểm tra tương tác thuốc (n x n)
  for (let i = 0; i < validItems.length; i++) {
    for (let j = i + 1; j < validItems.length; j++) {
      const med1 = (validItems[i].medicine.name || validItems[i].medicine.ingredients || "").toLowerCase();
      const med2 = (validItems[j].medicine.name || validItems[j].medicine.ingredients || "").toLowerCase();

      const foundInteraction = INTERACTIONS_DB.find(rule => {
        const d0 = rule.drugs[0].toLowerCase();
        const d1 = rule.drugs[1].toLowerCase();
        return (med1.includes(d0) && med2.includes(d1)) || (med1.includes(d1) && med2.includes(d0));
      });

      if (foundInteraction) {
        // Tránh push trùng
        const exists = interactions.find(x => x.warning === foundInteraction.warning);
        if (!exists) {
          interactions.push({
            drugPair: [validItems[i].medicine.name, validItems[j].medicine.name],
            severity: foundInteraction.severity,
            warning: foundInteraction.warning
          });
        }
      }
    }
  }

  // 2. Kiểm tra quá liều
  validItems.forEach(item => {
    const medName = item.medicine.name;
    const limitInfo = DOSAGE_LIMITS[medName];
    
    if (limitInfo) {
      // Tính số lượng viên uống 1 ngày = tổng số lượng / số ngày
      const totalDays = item.days || 1;
      const qtyPerDay = (item.quantity || 1) / totalDays;
      
      if (qtyPerDay > limitInfo.maxPerDay) {
        dosageWarnings.push({
          medicine: medName,
          qtyPerDay: qtyPerDay.toFixed(1),
          maxLimit: limitInfo.maxPerDay,
          warning: limitInfo.warning
        });
      }
    }
  });

  return { interactions, dosageWarnings };
};
