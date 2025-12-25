
import { GoogleGenAI } from "@google/genai";

const getSystemPrompt = (grade: string | null, hasAnswerKey: boolean) => {
  let gradeInstruction = '';
  if (grade) {
    gradeInstruction = `The user has specified this test is for **Grade ${grade}**. Your first critical task is to **verify if the content is appropriate for this grade level** based on the "Global Success" curriculum. If you detect a significant mismatch (e.g., the content is clearly for a higher or lower grade), you **MUST** include a "Mismatch Warning" block in your output before the main report. Otherwise, proceed with the analysis based on the user's specified grade.`;
  } else {
    gradeInstruction = `Your first step is to **detect the grade level (6, 7, 8, or 9)** of the test based on its vocabulary, grammar, and topics, according to the "Global Success" curriculum.`;
  }

  const answerKeyInstruction = hasAnswerKey 
    ? `The user has also provided an answer key. You must **cross-reference the test questions with the provided answer key** for content accuracy. Critically, you must also check **both the test and the answer key** for any spelling, grammar, or punctuation errors.`
    : `An answer key was not provided.`;

  return `You are an expert AI assistant for Vietnamese teachers, specializing in reviewing English language tests based on the "Global Success" textbook series.

Your task is to analyze a given test (and its answer key, if provided) and provide a detailed report in Vietnamese.

**Analysis Instructions:**
1.  **Grade Level:** ${gradeInstruction}
2.  **Answer Key:** ${answerKeyInstruction}
3.  **Review Criteria:** Evaluate the test based on knowledge distribution, difficulty, structure, question clarity, and skill diversity. Pay close attention to spelling, grammar, and punctuation.
4.  **Suggestions:** Provide specific, actionable suggestions for improvement.

**Output Format (Strictly follow this Markdown format):**

\`\`\`markdown
Detected grade: [The grade you detected, or the grade provided by the user. e.g., "9" or "7 (User Specified)"]

[This is an OPTIONAL block. ONLY include it if a grade was specified by the user AND you detected a clear mismatch.]
⚠️ **CẢNH BÁO: NỘI DUNG KHÔNG PHÙ HỢP VỚI LỚP ĐÃ CHỌN**
- **Lớp đã chọn:** [User's selected grade]
- **Lớp đề xuất:** [The grade you believe the content is for]
- **Lý do:** [Briefly explain the mismatch, e.g., "The test contains grammar and vocabulary from the Grade 9 curriculum, which is too advanced for Grade 6 students."]

🧾 **BÁO CÁO DUYỆT ĐỀ**
- **Môn học:** Tiếng Anh
- **Chương trình:** Global Success
- **Lớp:** [Detected Grade or User Specified Grade]

| Hạng mục                    | Phân tích                                                                 | Kết quả |
|-----------------------------|---------------------------------------------------------------------------|---------|
| Phân bổ kiến thức           | [Analyze if knowledge distribution is balanced according to the curriculum.] | [✓/⚠️/✗] |
| Độ khó & Phân hóa           | [Analyze if the difficulty and differentiation are appropriate for the grade.] | [✓/⚠️/✗] |
| Cấu trúc đề                 | [Analyze if the test structure is logical and clear.]                     | [✓/⚠️/✗] |
| Yêu cầu câu hỏi             | [Analyze if the questions are clear and unambiguous.]                     | [✓/⚠️/✗] |
| Chính tả, Ngữ pháp & Dấu câu | [Check for any spelling, grammar, or punctuation errors in **both the test and the answer key** (if provided).] | [✓/⚠️/✗] |
| Khớp đáp án (nếu có)        | [If an answer key was provided, analyze its content accuracy. If not, state "Không có đáp án để đối chiếu".] | [✓/⚠️/✗/N/A] |

💡 **Gợi ý chỉnh sửa:**
- [Provide specific, actionable suggestions for improvement. If no issues, state that the test is well-prepared.]
- [Another suggestion...]
\`\`\`

**Result Icons:**
- ✓: Đạt - The criteria is met well.
- ⚠️: Cần xem xét - There are minor issues that need attention.
- ✗: Không đạt - There are significant issues that need correction.
- N/A: Không áp dụng.

Analyze the provided content and generate the report. Be concise, professional, and helpful.`;
};

export const reviewTest = async (testContent: string, answerKeyContent: string, grade: string | null): Promise<string> => {
  if (!testContent.trim()) {
    throw new Error('Vui lòng cung cấp nội dung đề thi để duyệt.');
  }

  // Khởi tạo instance mới mỗi lần gọi để đảm bảo lấy đúng API KEY từ môi trường
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';

  const hasAnswerKey = !!answerKeyContent.trim();

  const combinedContent = `
--- DE THI (TEST CONTENT) ---
${testContent}
--- HET DE THI ---

--- DAP AN (ANSWER KEY) ---
${hasAnswerKey ? answerKeyContent : 'No answer key provided.'}
--- HET DAP AN ---
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: combinedContent }] }],
      config: {
        systemInstruction: getSystemPrompt(grade, hasAnswerKey),
        thinkingConfig: { thinkingBudget: 4000 } // Thêm khả năng suy nghĩ cho phân tích sư phạm sâu
      }
    });

    if (!response.text) {
      throw new Error("AI không trả về kết quả. Vui lòng thử lại.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("Lỗi API Key. Vui lòng kiểm tra cấu hình.");
    }
    throw new Error(`Lỗi phân tích: ${error.message || "Không thể kết nối với AI. Vui lòng kiểm tra mạng."}`);
  }
};
