import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Info, ShieldCheck, Mail, ExternalLink, Facebook, Instagram } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children, icon }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
          dir="rtl"
        >
          <div className="bg-emerald-600 p-6 text-white flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {icon}
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-8 text-gray-700 leading-relaxed space-y-4">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const AboutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="حول المنصة" icon={<Info className="w-6 h-6" />}>
    <p className="font-bold text-lg text-emerald-800">مرحباً بكم في منصة المذكرة الذكية للسنة الرابعة ابتدائي.</p>
    <p>
      تعد هذه المنصة أول مبادرة رقمية جزائرية تهدف إلى مساعدة أساتذة التعليم الابتدائي في إعداد مذكراتهم البيداغوجية بذكاء وسرعة. 
      نحن ندرك حجم المسؤولية الملقاة على عاتق الأستاذ والوقت الكبير الذي يستغرقه التحضير اليومي، لذا قمنا بتطوير هذا المحرك الذكي 
      الذي يعتمد على أحدث تقنيات الذكاء الاصطناعي لتوليد محتوى تعليمي متوافق تماماً مع منهاج الجيل الثاني.
    </p>
    <h4 className="font-bold text-emerald-700 mt-4">أهدافنا:</h4>
    <ul className="list-disc list-inside space-y-2">
      <li>توفير الوقت والجهد للأستاذ الجزائري.</li>
      <li>ضمان جودة المحتوى البيداغوجي وتوافقه مع المعايير الوطنية.</li>
      <li>رقمنة قطاع التربية والمساهمة في تطوير الأداء التعليمي.</li>
    </ul>
  </Modal>
);

export const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="سياسة الخصوصية" icon={<ShieldCheck className="w-6 h-6" />}>
    <p>نحن في "المذكرة الذكية" نولي أهمية قصوى لخصوصية بياناتكم.</p>
    <h4 className="font-bold text-emerald-700 mt-4">جمع البيانات:</h4>
    <p>
      البيانات التي يتم إدخالها في النموذج (الاسم، المدرسة، إلخ) تُستخدم فقط لغرض توليد المذكرة وتنسيقها في ملف PDF. 
      نحن لا نقوم ببيع أو مشاركة هذه البيانات مع أي جهات خارجية.
    </p>
    <h4 className="font-bold text-emerald-700 mt-4">استخدام الذكاء الاصطناعي:</h4>
    <p>
      يتم إرسال معطيات الدرس (المادة، الميدان، النشاط) إلى محرك الذكاء الاصطناعي لتوليد المحتوى البيداغوجي. 
      هذه البيانات لا تحتوي على معلومات شخصية حساسة.
    </p>
    <h4 className="font-bold text-emerald-700 mt-4">ملفات تعريف الارتباط:</h4>
    <p>
      قد نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة المستخدم وحفظ بعض التفضيلات المحلية على متصفحكم.
    </p>
  </Modal>
);

export const ContactModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="اتصل بنا" icon={<Mail className="w-6 h-6" />}>
    <p>يسعدنا دائماً تلقي ملاحظاتكم واقتراحاتكم لتطوير المنصة.</p>
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">البريد الإلكتروني</p>
          <p className="font-bold">belkadiamine@gmail.com</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
          <Facebook className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">فيسبوك</p>
          <p className="font-bold">Amine Belkadi</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
          <Instagram className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">إنستغرام</p>
          <p className="font-bold">belkadi_amine</p>
        </div>
      </div>
    </div>
  </Modal>
);

export const AdSpace = ({ className, label = "مساحة إعلانية" }: { className?: string; label?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 font-bold text-sm min-h-[100px] ${className}`}>
    {label}
  </div>
);
