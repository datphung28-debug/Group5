import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { protect, staffOnly } from '../middlewares/authMiddleware.js';
dotenv.config();

const router = express.Router();
router.use(protect, staffOnly);

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

router.post('/check-interactions', async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!medicines || medicines.length < 2) {
      return res.json({ safe: true, message: "Cần ít nhất 2 loại thuốc để kiểm tra tương tác." });
    }

    if (!genAI) {
      return res.json({ safe: true, message: "Hệ thống chưa được cấu hình API Key để kiểm tra tương tác thuốc." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Bạn là một dược sĩ chuyên nghiệp. Hãy kiểm tra xem có sự tương tác thuốc nguy hiểm nào giữa các loại thuốc sau đây không: ${medicines.join(', ')}. 
    Trả về ĐÚNG định dạng JSON sau, tuyệt đối không trả về text ngoài JSON:
    {
      "safe": true/false (false nếu có tương tác nguy hiểm, true nếu an toàn),
      "message": "Mô tả ngắn gọn về tương tác nếu có, hoặc báo an toàn"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(text);

    return res.json(parsedResult);
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ safe: true, message: "Không thể kết nối dịch vụ AI để kiểm tra tương tác." });
  }
});

export default router;
