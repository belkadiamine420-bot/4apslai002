import React, { useRef, useState } from "react";
import { LessonData, GeneratedLesson } from "../types";
import Markdown from "react-markdown";
import { Download, Printer, Send, Edit2, Check, X, FileText, User, School, Calendar, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import * as htmlToImage from 'html-to-image';

interface LessonPreviewProps {
  lesson: GeneratedLesson;
  data: LessonData;
  onReset: () => void;
}

export default function LessonPreview({ lesson, data, onReset }: LessonPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editedTopic, setEditedTopic] = useState(lesson.topic);
  const [editedCompetency, setEditedCompetency] = useState(lesson.competency);
  const [editedObjective, setEditedObjective] = useState(lesson.learningObjective);
  const [editedStages, setEditedStages] = useState(lesson.stages);
  const [editedNotes, setEditedNotes] = useState(lesson.teacherNotes || "");
  
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!previewRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      // Ensure fonts are loaded
      await document.fonts.ready;
      
      // Generate high resolution image
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        pixelRatio: 3, // Increase resolution for better quality
        quality: 1,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top center',
          margin: '0',
          padding: '0',
        }
      });
      
      const imgProps = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = dataUrl;
      });

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit on a single page
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const width = imgProps.width * ratio;
      const height = imgProps.height * ratio;
      
      // Center the content on the page
      const x = (pdfWidth - width) / 2;
      const y = 0; // Start from top

      pdf.addImage(dataUrl, 'PNG', x, y, width, height, undefined, 'SLOW');
      pdf.save(`مذكرة_${editedTopic.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    const content = `الموضوع: ${editedTopic}\nالكفاءة الختامية: ${editedCompetency}\nالهدف التعلمي: ${editedObjective}\n\nالمراحل:\n${editedStages.map(s => `${s.title}:\n${s.process}\nمؤشرات التقويم: ${s.indicators}`).join('\n\n')}`;
    const mailto = `mailto:?subject=مذكرة بيداغوجية: ${editedTopic}&body=${encodeURIComponent(content)}`;
    window.location.href = mailto;
  };

  const handleStageChange = (index: number, field: 'title' | 'process' | 'indicators', value: string) => {
    const newStages = [...editedStages];
    newStages[index][field] = value;
    setEditedStages(newStages);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto space-y-6 pb-20"
    >
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-[#e5e7eb] shadow-lg sticky top-6 z-20 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            disabled={isDownloading}
            className="px-4 py-2 rounded-xl text-[#4b5563] hover:bg-[#f3f4f6] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            إلغاء
          </button>
          <div className="w-px h-6 bg-[#e5e7eb]" />
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isDownloading}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 ${
              isEditing ? 'bg-[#ecfdf5] text-[#047857]' : 'text-[#4b5563] hover:bg-[#f3f4f6]'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                حفظ التعديلات
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                تعديل المذكرة
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={isDownloading}
            className="p-3 rounded-xl text-[#2563eb] hover:bg-[#eff6ff] transition-colors disabled:opacity-50"
            title="إرسال عبر البريد"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            disabled={isDownloading}
            className="p-3 rounded-xl text-[#4b5563] hover:bg-[#f9fafb] transition-colors disabled:opacity-50"
            title="طباعة"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-2 bg-[#059669] text-white rounded-xl hover:bg-[#047857] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                تحميل PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#ecfdf5] border-t-[#059669] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#059669]" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-bold text-[#064e3b]">جاري معالجة المذكرة...</p>
              <p className="text-sm text-[#047857]">يرجى الانتظار قليلاً، نقوم بتحسين الجودة</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Preview */}
      <div 
        ref={previewRef}
        className="bg-[#ffffff] pt-12 pb-12 pr-16 pl-8 rounded-sm border border-[#f3f4f6] mx-auto w-full max-w-[210mm] min-h-[297mm] text-right font-['Noto_Sans_Arabic'] leading-relaxed print:p-8 print:shadow-none"
        dir="rtl"
        style={{ 
          fontFamily: "'Noto Sans Arabic', sans-serif",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
        }}
      >
        {/* Official Header */}
        <div className="flex justify-between items-start mb-12 text-sm">
          <div className="text-right space-y-1.5 w-1/3">
            <p className="font-bold text-[#111827] text-base mb-1">الجمهورية الجزائرية الديمقراطية الشعبية</p>
            <p className="font-bold text-[#111827]">وزارة التربية الوطنية</p>
            <p className="text-[#374151]">مديرية التربية لولاية: {data.userInfo.educationDirectorate || "...................."}</p>
          </div>
          <div className="text-center w-1/3 pt-2">
            <div className="border-2 border-[#111827] rounded-2xl px-8 py-4 inline-block bg-[#f9fafb] shadow-sm">
              <h1 className="text-2xl font-black text-[#111827] tracking-tight">مذكرة تربوية</h1>
            </div>
          </div>
          <div className="text-right space-y-1.5 w-1/3">
            <p className="text-[#374151]">المقاطعة التفتيشية: {data.userInfo.inspectionDistrict || "...................."}</p>
            <p className="text-[#374151]">المدرسة: {data.userInfo.school || "...................."}</p>
            <p className="text-[#374151]">الأستاذ(ة): {data.userInfo.fullName || "...................."}</p>
          </div>
        </div>

        {/* Metadata Table */}
        <div className="mb-6 overflow-hidden border-2 border-[#111827] rounded-lg shadow-sm">
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              <tr className="border-b-2 border-[#111827]">
                <td className="border-l-2 border-[#111827] p-2 bg-[#f9fafb] font-bold w-1/6 text-[#374151]">المستوى:</td>
                <td className="border-l-2 border-[#111827] p-2 w-2/6 text-[#111827]">{data.userInfo.grade}</td>
                <td className="border-l-2 border-[#111827] p-2 bg-[#f9fafb] font-bold w-1/6 text-[#374151]">السنة الدراسية:</td>
                <td className="p-2 w-2/6 text-[#111827]">2025 / 2026</td>
              </tr>
              <tr className="border-b-2 border-[#111827]">
                <td className="border-l-2 border-[#111827] p-2 bg-[#f9fafb] font-bold text-[#374151]">المادة:</td>
                <td className="border-l-2 border-[#111827] p-2 text-[#111827]">{data.subject}</td>
                <td className="border-l-2 border-[#111827] p-2 bg-[#f9fafb] font-bold text-[#374151]">النشاط:</td>
                <td className="p-2 text-[#111827]">{data.activity} {data.field && <span className="text-[#6b7280] text-[11px]">({data.field})</span>}</td>
              </tr>
              <tr>
                <td className="border-l-2 border-[#111827] p-2 bg-[#f9fafb] font-bold text-[#374151]">التاريخ:</td>
                <td className="border-l-2 border-[#111827] p-2 text-[#111827]">{data.userInfo.date}</td>
                <td className="border-l-2 border-[#111827] p-2 bg-[#f9fafb] font-bold text-[#374151]">الموضوع:</td>
                <td className="p-2 font-bold text-[#059669]">
                  {isEditing ? (
                    <input 
                      value={editedTopic} 
                      onChange={e => setEditedTopic(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 font-bold text-[#059669] p-0"
                    />
                  ) : (
                    editedTopic
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Competency & Objective Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border-2 border-[#111827] rounded-lg p-3 bg-[#ecfdf5]/30">
            <h3 className="font-black text-[#064e3b] text-sm mb-1 border-b border-[#a7f3d0] pb-1 inline-block">الكفاءة الختامية:</h3>
            {isEditing ? (
              <textarea 
                value={editedCompetency} 
                onChange={e => setEditedCompetency(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 resize-none text-[13px] font-medium text-[#1f2937] p-0"
                rows={2}
              />
            ) : (
              <p className="text-[#1f2937] text-[13px] font-medium leading-relaxed">{editedCompetency}</p>
            )}
          </div>
          
          <div className="border-2 border-[#111827] rounded-lg p-3 bg-[#eff6ff]/30">
            <h3 className="font-black text-[#1e3a8a] text-sm mb-1 border-b border-[#bfdbfe] pb-1 inline-block">الهدف التعلمي:</h3>
            {isEditing ? (
              <textarea
                value={editedObjective}
                onChange={(e) => setEditedObjective(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 resize-none text-[13px] font-medium text-[#1f2937] p-0"
                rows={2}
              />
            ) : (
              <p className="text-[#1f2937] text-[13px] font-medium leading-relaxed">{editedObjective}</p>
            )}
          </div>
        </div>

        {/* Stages Table */}
        <div className="mb-6 overflow-hidden border-2 border-[#111827] rounded-lg shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f3f4f6] border-b-2 border-[#111827]">
                <th className="border-l-2 border-[#111827] p-2 w-1/5 font-black text-center text-[#111827] text-sm">المراحل</th>
                <th className="border-l-2 border-[#111827] p-2 w-3/5 font-black text-center text-[#111827] text-sm">السيرورة التعلمية (الوضعيات والأنشطة)</th>
                <th className="p-2 w-1/5 font-black text-center text-[#111827] text-sm">مؤشرات التقويم</th>
              </tr>
            </thead>
            <tbody>
              {editedStages.map((stage, index) => (
                <tr key={index} className="border-b border-[#111827] last:border-b-0">
                  <td className="border-l-2 border-[#111827] p-2 font-bold align-top bg-[#f9fafb] text-center text-[#111827] text-[13px]">
                    {isEditing ? (
                      <input
                        value={stage.title}
                        onChange={(e) => handleStageChange(index, 'title', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-center p-0"
                      />
                    ) : (
                      stage.title
                    )}
                  </td>
                  <td className="border-l-2 border-[#111827] p-3 align-top text-[#1f2937]">
                    {isEditing ? (
                      <textarea
                        value={stage.process}
                        onChange={(e) => handleStageChange(index, 'process', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none text-[12px] leading-relaxed p-0"
                        rows={6}
                      />
                    ) : (
                      <div className="text-[12px] leading-relaxed whitespace-pre-wrap">
                        {stage.process}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top text-[#059669]">
                    {isEditing ? (
                      <textarea
                        value={stage.indicators}
                        onChange={(e) => handleStageChange(index, 'indicators', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none text-[12px] leading-relaxed text-[#059669] p-0"
                        rows={6}
                      />
                    ) : (
                      <div className="text-[12px] leading-relaxed text-[#059669] whitespace-pre-wrap">
                        {stage.indicators}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Teacher Notes */}
        <div className="mb-8 border-2 border-[#111827] rounded-lg p-3 bg-[#f9fafb]">
          <h3 className="font-black text-sm mb-2 border-b border-[#e5e7eb] pb-1 inline-block text-[#111827]">ملاحظات المعلم:</h3>
          {isEditing ? (
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-[12px] italic text-[#4b5563] p-0"
              rows={2}
              placeholder="أضف ملاحظاتك هنا..."
            />
          ) : (
            <p className="text-[12px] italic text-[#4b5563] min-h-[40px]">{editedNotes || "لا توجد ملاحظات."}</p>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 text-center mt-10 font-bold text-[#111827] text-sm">
          <div className="space-y-8">
            <p className="border-b border-[#111827] pb-1">توقيع المفتش</p>
            <div className="h-12"></div>
          </div>
          <div className="space-y-8">
            <p className="border-b border-[#111827] pb-1">توقيع المدير</p>
            <div className="h-12"></div>
          </div>
          <div className="space-y-8">
            <p className="border-b border-[#111827] pb-1">توقيع الأستاذ</p>
            <div className="h-12"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
