import { GoogleGenerativeAI } from "@google/generative-ai";

// ═══════════════════════════════════════════════════════════════════
// AI VISION OCR — Nhận diện Đơn Thuốc bằng Google Gemini
// Sử dụng SDK Classic @google/generative-ai (Ổn định nhất)
// ═══════════════════════════════════════════════════════════════════

/**
 * Gửi ảnh toa thuốc lên Gemini AI Vision để nhận diện.
 * @param {string} imageBase64 - Ảnh dạng base64
 * @param {string} mimeType - Loại ảnh
 */
export async function scanPrescriptionWithAI(imageBase64, mimeType = "image/jpeg") {
  // Khởi tạo ở đây để đảm bảo đọc được từ .env
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `Bạn là một Dược sĩ AI chuyên nghiệp. Hãy đọc và phân tích toa thuốc trong ảnh này.

QUY TẮC BẮT BUỘC:
1. Đọc toa thuốc (có thể viết tay hoặc in máy) và trích xuất thông tin.
2. Trả về KẾT QUẢ DUY NHẤT là một đối tượng JSON hợp lệ (KHÔNG giải thích, KHÔNG markdown).
3. Nếu không đọc được trường nào, để giá trị là null.
4. Tên thuốc phải ghi đầy đủ (bao gồm hàm lượng nếu có, ví dụ: "Amoxicillin 500mg").
5. Liều dùng phải ghi chi tiết cách uống (ví dụ: "Sáng 1 viên sau ăn, Tối 1 viên sau ăn").

FORMAT JSON BẮT BUỘC:
{
  "patientName": "tên bệnh nhân hoặc null",
  "doctorName": "tên bác sĩ hoặc null", 
  "diagnosis": "chẩn đoán bệnh hoặc null",
  "clinicName": "tên phòng khám/bệnh viện hoặc null",
  "prescriptionDate": "ngày kê đơn (DD/MM/YYYY) hoặc null",
  "items": [
    {
      "drugName": "tên thuốc đầy đủ kèm hàm lượng",
      "dosage": "hướng dẫn sử dụng chi tiết (cách uống, thời gian)",
      "quantity": số_lượng_là_number,
      "unit": "viên/gói/chai/ống/hộp",
      "frequency": "số lần uống mỗi ngày (ví dụ: 2 lần/ngày)",
      "duration": "số ngày uống (ví dụ: 5 ngày) hoặc null"
    }
  ]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType
        }
      }
    ]);

    const rawText = result.response.text() || "";

    // Parse JSON
    const jsonStr = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const parsed = JSON.parse(jsonStr);

    return {
      success: true,
      data: parsed,
      rawResponse: rawText,
    };
  } catch (error) {
    console.error("❌ AI Vision OCR Error:", error.message);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}
