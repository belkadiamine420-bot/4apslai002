import React, { useState } from "react";
import { LessonData, GeneratedLesson } from "./types";
import { generateLessonContent } from "./services/geminiService";
import LessonForm from "./components/LessonForm";
import LessonPreview from "./components/LessonPreview";
import { AboutModal, PrivacyModal, ContactModal, AdSpace } from "./components/InfoModals";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, GraduationCap, Shield, Zap, FileText, ChevronDown, CheckCircle2, Sparkles, ExternalLink, Info, ShieldCheck, Mail } from "lucide-react";

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleGenerate = async (data: LessonData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateLessonContent(data);
      setGeneratedLesson(result);
      setLessonData({ ...data, topic: result.topic, competency: result.competency });
      
      // Scroll to preview
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء توليد المذكرة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedLesson(null);
    setLessonData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900" dir="rtl">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-100/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-3 hover:rotate-0 transition-transform">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-900 tracking-tight">المذكرة الذكية للسنة الرابعة</h1>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">منصة الأستاذ الجزائري</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">الرئيسية</button>
          <button onClick={() => setIsAboutOpen(true)} className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">حول المنصة</button>
          <button onClick={() => setIsContactOpen(true)} className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">اتصل بنا</button>
          <a 
            href="https://www.education.gov.dz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
          >
            وزارة التربية الوطنية
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Ad Space Top */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <AdSpace className="h-24" label="مساحة إعلانية علوية" />
        </div>

        {/* Hero Section */}
        <section className="px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            توليد ذكي للمذكرات البيداغوجية وفق المنهاج الجزائري
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[1.1]"
          >
            وفّر وقتك وجهدك مع <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">المذكرة الذكية للسنة الرابعة</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            أول منصة رقمية جزائرية متخصصة في توليد المذكرات البيداغوجية لأساتذة التعليم الابتدائي. 
            دقة عالية، توافق تام مع المنهاج، وسهولة في الاستخدام.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {[
              { icon: Shield, title: "آمنة وموثوقة", desc: "بياناتك محمية ومحفوظة بدقة" },
              { icon: Zap, title: "توليد فوري", desc: "مذكرات جاهزة في ثوانٍ معدودة" },
              { icon: GraduationCap, title: "منهاج الجيل الثاني", desc: "متوافقة تماماً مع المعايير الوطنية" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-right"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => document.getElementById('generator-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex flex-col items-center gap-4 focus:outline-none"
            >
              <div className="animate-bounce">
                <ChevronDown className="w-8 h-8 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest group-hover:text-emerald-800 transition-colors">ابدأ الآن</p>
            </button>
          </div>
        </section>

        {/* Form Section */}
        <section id="generator-form" className="px-6 py-20 bg-emerald-50/50 border-y border-emerald-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-black text-gray-900 mb-4">محرك التوليد التلقائي</h3>
              <p className="text-gray-500">املأ الحقول أدناه لتوليد مذكرتك البيداغوجية المخصصة</p>
            </div>

            <LessonForm onGenerate={handleGenerate} isGenerating={isGenerating} />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-center max-w-2xl mx-auto"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Ad Space Middle */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <AdSpace className="h-32" label="مساحة إعلانية وسطية" />
        </div>

        {/* Preview Section */}
        <section className="px-6 py-24 min-h-[600px]">
          <AnimatePresence mode="wait">
            {generatedLesson && lessonData ? (
              <LessonPreview 
                key="preview"
                lesson={generatedLesson} 
                data={lessonData} 
                onReset={handleReset}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <FileText className="w-12 h-12" />
                </div>
                <h4 className="text-xl font-bold text-gray-400">ستظهر المذكرة هنا بعد التوليد</h4>
                <p className="text-gray-400 mt-2 max-w-xs">يمكنك تحميلها بصيغة PDF وطباعتها مباشرة</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Ad Space Bottom */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <AdSpace className="h-24" label="مساحة إعلانية سفلية" />
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-emerald-900">المذكرة الذكية للسنة الرابعة</h1>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">منصة الأستاذ الجزائري</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  المنصة الرقمية الأولى لتوليد المذكرات البيداغوجية لأساتذة التعليم الابتدائي في الجزائر. دقة، سرعة، وتوافق تام.
                </p>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-emerald-900 border-r-4 border-emerald-600 pr-3">روابط سريعة</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setIsAboutOpen(true)} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors text-right flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    حول المنصة
                  </button>
                  <button onClick={() => setIsPrivacyOpen(true)} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors text-right flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    سياسة الخصوصية
                  </button>
                  <button onClick={() => setIsContactOpen(true)} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors text-right flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    اتصل بنا
                  </button>
                  <a href="https://www.education.gov.dz" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors text-right flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    وزارة التربية
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-emerald-900 border-r-4 border-emerald-600 pr-3">تواصل معنا</h4>
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsContactOpen(true)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                    <Mail className="w-5 h-5" />
                  </button>
                  <a href="https://www.education.gov.dz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-8" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
              <p>© 2026 جميع الحقوق محفوظة لمنصة المذكرة الذكية.</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                متوافق مع وزارة التربية الوطنية الجزائرية
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </main>
    </div>
  );
}
