import { GoogleGenerativeAI } from "@google/generative-ai";

// ═══════════════════════════════════════════════════════════════════
// AI VISION OCR — Nhận diện Đơn Thuốc bằng Google Gemini
// Sử dụng SDK Classic @google/generative-ai (Ổn định nhất)
// ═══════════════════════════════════════════════════════════════════

import dotenv from "dotenv";

/**
 * Gửi ảnh toa thuốc lên Gemini AI Vision để nhận diện.
 * @param {string} imageBase64 - Ảnh dạng base64
 * @param {string} mimeType - Loại ảnh
 */
export async function scanPrescriptionWithAI(imageBase64, mimeType = "image/jpeg") {
  // Ép Node.js đọc lại file .env ngay lập tức
  dotenv.config({ override: true });
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Dùng gemini-2.5-flash để lấy bộ Quota giới hạn ngày mới tinh (do bản flash-latest đã kiệt sức)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `Đọc toa thuốc (viết tay/in). Trả về JSON duy nhất (KHÔNG markdown). Ưu tiên tốc độ.

{
  "patientName": "tên hoặc null",
  "doctorName": "tên hoặc null", 
  "diagnosis": "chẩn đoán hoặc null",
  "clinicName": "phòng khám hoặc null",
  "prescriptionDate": "DD/MM/YYYY hoặc null",
  "items": [{
    "drugName": "tên thuốc",
    "dosage": "cách uống",
    "quantity": số_lượng,
    "unit": "viên/gói/hộp",
    "frequency": "số lần/ngày",
    "duration": "số ngày hoặc null"
  }]
}`;

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
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
      attempt++;
      console.error(`❌ AI Vision OCR Error (Lần thử ${attempt}/${maxRetries}):`, error.message);
      
      // Nếu là lỗi 429 (Hết Quota/Quá tải request)
      if (error.message && error.message.includes("429 Too Many Requests")) {
        return {
          success: false,
          error: "API Key đã hết hạn mức (Quota) quét đơn thuốc miễn phí TRONG NGÀY hôm nay. Vui lòng thử lại vào ngày mai hoặc dùng API Key khác!",
          data: null,
        };
      }

      if (attempt >= maxRetries) {
        return {
          success: false,
          error: error.message,
          data: null,
        };
      }
      
      // Chờ 2 giây x attempt trước khi thử lại để tránh gửi request liên tục
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}
