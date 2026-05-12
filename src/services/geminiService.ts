import { GoogleGenAI, Type } from "@google/genai";
import { LessonData, GeneratedLesson } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateLessonContent(data: LessonData): Promise<GeneratedLesson> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    أنت خبير تربوي جزائري مختص في التعليم الابتدائي.
    قم بتوليد مذكرة بيداغوجية كاملة وفق منهاج الجيل الثاني الجزائري بناءً على المعطيات التالية:
    - الأسبوع: ${data.week}
    - المادة: ${data.subject}
    - الميدان: ${data.field}
    - النشاط: ${data.activity}
    - المستوى: ${data.userInfo.grade}
    - الأستاذ: ${data.userInfo.fullName}
    - المؤسسة: ${data.userInfo.school}
    - مديرية التربية: ${data.userInfo.educationDirectorate}
    - المقاطعة التفتيشية: ${data.userInfo.inspectionDistrict}
    - التاريخ: ${data.userInfo.date}
    - الموضوع المقترح: ${data.topic || "غير محدد، يرجى استنتاجه"}
    - الكفاءة المستهدفة المقترحة: ${data.competency || "غير محددة، يرجى استنتاجها"}

    المطلوب:
    1. تأكيد أو تحسين "الموضوع" (عنوان الدرس) بناءً على المقترح.
    2. صياغة "الكفاءة الختامية" بدقة (ما يجب أن يكتسبه المتعلم في نهاية المقطع).
    3. صياغة "الهدف التعلمي" (ما يتوقع من التلميذ تحقيقه في نهاية هذه الحصة تحديداً).
    4. كتابة مراحل الدرس بالتفصيل في جدول يحتوي على:
       - مرحلة الانطلاق (الوضعية المشكلة الأم أو الجزئية، مراجعة المكتسبات القبلية).
       - بناء التعلمات (مرحلة البحث والتحليل، عرض الوضعية المشكلة، استنتاج القواعد).
       - استثمار المكتسبات (مرحلة التدريب والتقويم، حل تمارين، تطبيق عملي).
    5. في حقل "السيرورة التعلمية" (process)، اكتب بالتفصيل ما يفعله المعلم وما يفعله المتعلم.
    6. في حقل "مؤشرات التقويم" (indicators)، اكتب المعايير التي تدل على تحقق الهدف في كل مرحلة.
    7. إضافة ملاحظات المعلم (نصائح بيداغوجية أو تنبيهات).
    8. استخدام لغة عربية فصيحة وسليمة بأسلوب تربوي احترافي.

    يجب أن تكون المخرجات بصيغة JSON تحتوي على:
    - topic: عنوان الدرس
    - competency: الكفاءة الختامية
    - learningObjective: الهدف التعلمي
    - stages: مصفوفة من الكائنات تحتوي على (title, process, indicators)
    - teacherNotes: ملاحظات المعلم
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          competency: { type: Type.STRING },
          learningObjective: { type: Type.STRING },
          stages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                process: { type: Type.STRING },
                indicators: { type: Type.STRING },
              },
              required: ["title", "process", "indicators"],
            },
          },
          teacherNotes: { type: Type.STRING },
        },
        required: ["topic", "competency", "learningObjective", "stages"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  return result as GeneratedLesson;
}
