import React, { useState, useEffect, useMemo, useRef } from "react";
import { ALGERIAN_CURRICULUM, WEEKS, GRADES, SECTIONS, WEEK_TO_SECTION, WEEK_TO_STYLE, WEEK_TO_VOCABULARY, WEEK_TO_READING, WEEK_TO_GRAMMAR, WEEK_TO_CONJUGATION_ORTHOGRAPHY, WEEK_TO_MEMORIZATION, WEEK_TO_WRITTEN_PRODUCTION, WEEK_TO_PROJECTS, WEEK_TO_MATH_NUMBERS, WEEK_TO_MATH_GEOMETRY, WEEK_TO_MATH_MEASUREMENT, WEEK_TO_SCIENCE_BIOLOGY, WEEK_TO_SCIENCE_PHYSICS, WEEK_TO_ISLAMIC_QURAN, WEEK_TO_ISLAMIC_FAITH, WEEK_TO_ISLAMIC_ETHICS, WEEK_TO_ISLAMIC_BIOGRAPHY, WEEK_TO_CIVIC, WEEK_TO_HISTORY, WEEK_TO_GEOGRAPHY, WEEK_TO_ARTS_DRAWING, WEEK_TO_ARTS_MUSIC, getStandardCompetency } from "../constants";
import { LessonData, Subject, Field, Activity, UserInfo } from "../types";
import { BookOpen, Calendar, GraduationCap, School, User, ChevronRight, Loader2, FileText, MapPin, CalendarDays, Hash, Layers, Check, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface LessonFormProps {
  onGenerate: (data: LessonData) => void;
  isGenerating: boolean;
}

export default function LessonForm({ onGenerate, isGenerating }: LessonFormProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: "",
    school: "",
    grade: GRADES[0],
    inspectionDistrict: "",
    educationDirectorate: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [subjectId, setSubjectId] = useState(ALGERIAN_CURRICULUM[0].id);
  const [fieldId, setFieldId] = useState(ALGERIAN_CURRICULUM[0].fields[0].id);
  const [activityId, setActivityId] = useState(ALGERIAN_CURRICULUM[0].fields[0].activities[0].id);
  
  const [week, setWeek] = useState(WEEKS[0]);
  const [section, setSection] = useState(SECTIONS[0]);

  // Independent data environment for each activity per week
  const [activityData, setActivityData] = useState<Record<string, {
    topic: string;
    competency: string;
  }>>({});

  const currentKey = (subjectId === "math" || subjectId === "science" || subjectId === "islamic" || subjectId === "civic" || subjectId === "history" || subjectId === "geography" || subjectId === "arts")
    ? `${subjectId}-all-${week}` 
    : `${subjectId}-${activityId}-${week}`;

  const currentData = activityData[currentKey] || {
    topic: "",
    competency: ""
  };

  const { topic, competency } = currentData;

  const mathTopics = useMemo(() => {
    if (subjectId !== "math") return [];
    const numbers = WEEK_TO_MATH_NUMBERS[week] || [];
    const geometry = WEEK_TO_MATH_GEOMETRY[week] || [];
    const measurement = WEEK_TO_MATH_MEASUREMENT[week] || [];
    return Array.from(new Set([...numbers, ...geometry, ...measurement]));
  }, [subjectId, week]);

  const scienceTopics = useMemo(() => {
    if (subjectId !== "science") return [];
    const biology = WEEK_TO_SCIENCE_BIOLOGY[week] || [];
    const physics = WEEK_TO_SCIENCE_PHYSICS[week] || [];
    return Array.from(new Set([...biology, ...physics]));
  }, [subjectId, week]);

  const islamicTopics = useMemo(() => {
    if (subjectId !== "islamic") return [];
    const quran = WEEK_TO_ISLAMIC_QURAN[week] || [];
    const faith = WEEK_TO_ISLAMIC_FAITH[week] || [];
    const ethics = WEEK_TO_ISLAMIC_ETHICS[week] || [];
    const biography = WEEK_TO_ISLAMIC_BIOGRAPHY[week] || [];
    return Array.from(new Set([...quran, ...faith, ...ethics, ...biography]));
  }, [subjectId, week]);

  const civicTopics = useMemo(() => {
    if (subjectId !== "civic") return [];
    return WEEK_TO_CIVIC[week] || [];
  }, [subjectId, week]);

  const historyTopics = useMemo(() => {
    if (subjectId !== "history") return [];
    return WEEK_TO_HISTORY[week] || [];
  }, [subjectId, week]);

  const geographyTopics = useMemo(() => {
    if (subjectId !== "geography") return [];
    return WEEK_TO_GEOGRAPHY[week] || [];
  }, [subjectId, week]);

  const artsTopics = useMemo(() => {
    if (subjectId !== "arts") return [];
    const drawing = WEEK_TO_ARTS_DRAWING[week] || [];
    const music = WEEK_TO_ARTS_MUSIC[week] || [];
    return Array.from(new Set([...drawing, ...music]));
  }, [subjectId, week]);

  const availableTopics = useMemo(() => {
    if (subjectId === "math") return mathTopics;
    if (subjectId === "science") return scienceTopics;
    if (subjectId === "islamic") return islamicTopics;
    if (subjectId === "civic") return civicTopics;
    if (subjectId === "history") return historyTopics;
    if (subjectId === "geography") return geographyTopics;
    if (subjectId === "arts") return artsTopics;
    if (activityId === "styles") return [WEEK_TO_STYLE[week]].filter(Boolean) as string[];
    if (activityId === "vocabulary") return [WEEK_TO_VOCABULARY[week]].filter(Boolean) as string[];
    if (activityId === "reading") return [WEEK_TO_READING[week]].filter(Boolean) as string[];
    if (activityId === "grammar") return [WEEK_TO_GRAMMAR[week]].filter(Boolean) as string[];
    if (activityId === "conjugation_orthography") return [WEEK_TO_CONJUGATION_ORTHOGRAPHY[week]].filter(Boolean) as string[];
    if (activityId === "memorization") return [WEEK_TO_MEMORIZATION[week]].filter(Boolean) as string[];
    if (activityId === "written_production") return [WEEK_TO_WRITTEN_PRODUCTION[week]].filter(Boolean) as string[];
    if (activityId === "projects") return [WEEK_TO_PROJECTS[week]].filter(Boolean) as string[];
    return [];
  }, [subjectId, activityId, week, mathTopics, scienceTopics]);

  const updateCurrentData = (updates: any) => {
    setActivityData(prev => ({
      ...prev,
      [currentKey]: { ...currentData, ...updates }
    }));
  };

  const [isSuggesting, setIsSuggesting] = useState(false);
  const lastAutoGeneratedKey = useRef<string>("");

  // Automatic field/activity selection for Mathematics and Science based on topic
  useEffect(() => {
    if (subjectId === "math" && topic) {
      // Find which activity this topic belongs to
      let targetActivityId = "";
      let targetFieldId = "";

      if (WEEK_TO_MATH_NUMBERS[week]?.includes(topic)) {
        targetActivityId = "numbers_calc";
        targetFieldId = "numbers";
      } else if (WEEK_TO_MATH_GEOMETRY[week]?.includes(topic)) {
        targetActivityId = "geometry_act";
        targetFieldId = "geometry";
      } else if (WEEK_TO_MATH_MEASUREMENT[week]?.includes(topic)) {
        targetActivityId = "measurement_act";
        targetFieldId = "measurement";
      }

      if (targetActivityId && targetFieldId) {
        if (activityId !== targetActivityId) setActivityId(targetActivityId);
        if (fieldId !== targetFieldId) setFieldId(targetFieldId);
      }
    } else if (subjectId === "science" && topic) {
      // Find which activity this topic belongs to
      let targetActivityId = "";
      let targetFieldId = "";

      if (WEEK_TO_SCIENCE_BIOLOGY[week]?.includes(topic)) {
        targetActivityId = "biology_act";
        targetFieldId = "biology";
      } else if (WEEK_TO_SCIENCE_PHYSICS[week]?.includes(topic)) {
        targetActivityId = "physics_act";
        targetFieldId = "physics";
      }

      if (targetActivityId && targetFieldId) {
        if (activityId !== targetActivityId) setActivityId(targetActivityId);
        if (fieldId !== targetFieldId) setFieldId(targetFieldId);
      }
    } else if (subjectId === "islamic" && topic) {
      // Find which activity this topic belongs to
      let targetActivityId = "";
      let targetFieldId = "";

      if (WEEK_TO_ISLAMIC_QURAN[week]?.includes(topic)) {
        targetActivityId = "quran_act";
        targetFieldId = "quran";
      } else if (WEEK_TO_ISLAMIC_FAITH[week]?.includes(topic)) {
        targetActivityId = "faith_act";
        targetFieldId = "faith";
      } else if (WEEK_TO_ISLAMIC_ETHICS[week]?.includes(topic)) {
        targetActivityId = "ethics_act";
        targetFieldId = "ethics";
      } else if (WEEK_TO_ISLAMIC_BIOGRAPHY[week]?.includes(topic)) {
        targetActivityId = "biography_act";
        targetFieldId = "biography";
      }

      if (targetActivityId && targetFieldId) {
        if (activityId !== targetActivityId) setActivityId(targetActivityId);
        if (fieldId !== targetFieldId) setFieldId(targetFieldId);
      }
    } else if (subjectId === "civic" && topic) {
      // For Civic Education, we currently only have one field and one activity
      const targetActivityId = "civic_act";
      const targetFieldId = "life";

      if (activityId !== targetActivityId) setActivityId(targetActivityId);
      if (fieldId !== targetFieldId) setFieldId(targetFieldId);
    } else if (subjectId === "history" && topic) {
      const targetActivityId = "history_act";
      const targetFieldId = "history_field";

      if (activityId !== targetActivityId) setActivityId(targetActivityId);
      if (fieldId !== targetFieldId) setFieldId(targetFieldId);
    } else if (subjectId === "geography" && topic) {
      const targetActivityId = "geography_act";
      const targetFieldId = "geography_field";

      if (activityId !== targetActivityId) setActivityId(targetActivityId);
      if (fieldId !== targetFieldId) setFieldId(targetFieldId);
    } else if (subjectId === "arts" && topic) {
      // Find which activity this topic belongs to
      let targetActivityId = "";
      const targetFieldId = "arts_field";

      if (WEEK_TO_ARTS_DRAWING[week]?.includes(topic)) {
        targetActivityId = "drawing";
      } else if (WEEK_TO_ARTS_MUSIC[week]?.includes(topic)) {
        targetActivityId = "music";
      }

      if (targetActivityId && targetFieldId) {
        if (activityId !== targetActivityId) setActivityId(targetActivityId);
        if (fieldId !== targetFieldId) setFieldId(targetFieldId);
      }
    }
  }, [subjectId, topic, week]);

  // Automatic suggestion logic
  useEffect(() => {
    // Special logic for Week 01: Diagnostic Assessment for all subjects/activities
    if (week === "الأسبوع 01") {
      if (topic !== "تقويم تشخيصي") {
        updateCurrentData({ 
          topic: "تقويم تشخيصي", 
          competency: "تشخيص المكتسبات القبلية للمتعلمين وتحديد مواطن القوة والضعف." 
        });
      }
      return; // Skip other logic for week 01
    }

    // Special logic for "Styles", "Vocabulary", "Reading", "Grammar", "Conjugation/Orthography", "Memorization", "Written Production", "Projects", "Mathematics", "Science", "Islamic", "Civic", "History", "Geography", and "Arts" activities to set topic and competency instantly
    if (subjectId === "math" || subjectId === "science" || subjectId === "islamic" || subjectId === "civic" || subjectId === "history" || subjectId === "geography" || subjectId === "arts") {
      if (availableTopics.length > 0 && !availableTopics.includes(topic)) {
        const firstTopic = availableTopics[0];
        const stdComp = getStandardCompetency(activityId, firstTopic);
        updateCurrentData({ topic: firstTopic, competency: stdComp });
      }
      return;
    }

    if (activityId === "styles" || activityId === "vocabulary" || activityId === "reading" || activityId === "grammar" || activityId === "conjugation_orthography" || activityId === "memorization" || activityId === "written_production" || activityId === "projects") {
      let autoTopic: any = "";
      if (activityId === "styles") autoTopic = WEEK_TO_STYLE[week];
      else if (activityId === "vocabulary") autoTopic = WEEK_TO_VOCABULARY[week];
      else if (activityId === "reading") autoTopic = WEEK_TO_READING[week];
      else if (activityId === "grammar") autoTopic = WEEK_TO_GRAMMAR[week];
      else if (activityId === "conjugation_orthography") autoTopic = WEEK_TO_CONJUGATION_ORTHOGRAPHY[week];
      else if (activityId === "memorization") autoTopic = WEEK_TO_MEMORIZATION[week];
      else if (activityId === "written_production") autoTopic = WEEK_TO_WRITTEN_PRODUCTION[week];
      else if (activityId === "projects") autoTopic = WEEK_TO_PROJECTS[week];

      if (autoTopic) {
        if (topic !== autoTopic) {
          const stdComp = getStandardCompetency(activityId, autoTopic);
          updateCurrentData({ topic: autoTopic, competency: stdComp });
        }
      }
    }

    const timer = setTimeout(() => {
      if (subjectId && fieldId && activityId && week && section && !topic && !competency) {
        handleSuggest();
      }
    }, 500); // Reduced delay to 500ms for snappier feel

    return () => clearTimeout(timer);
  }, [subjectId, fieldId, activityId, week, section, topic, competency, availableTopics]);

  // Automatic generation for Mathematics, Science, Islamic, Civic, History, Geography, and Arts when week/topic is ready
  useEffect(() => {
    const isMath = ["numbers_calc", "geometry_act", "measurement_act"].includes(activityId);
    const isScience = ["biology_act", "physics_act"].includes(activityId);
    const isIslamic = ["quran_act", "faith_act", "ethics_act", "biography_act"].includes(activityId);
    const isCivic = activityId === "civic_act";
    const isHistory = activityId === "history_act";
    const isGeography = activityId === "geography_act";
    const isArts = ["drawing", "music"].includes(activityId);
    if ((isMath || isScience || isIslamic || isCivic || isHistory || isGeography || isArts) && topic && competency && !isGenerating && userInfo.fullName && userInfo.school) {
      const generationKey = `${currentKey}-${topic}-${competency}`;
      if (lastAutoGeneratedKey.current !== generationKey) {
        lastAutoGeneratedKey.current = generationKey;
        onGenerate({
          week,
          section,
          subject: currentSubject.name,
          field: currentField.name,
          activity: currentActivity.name,
          topic,
          competency,
          userInfo,
        });
      }
    }
  }, [week, activityId, topic, competency, isGenerating, userInfo.fullName, userInfo.school]);

  // Sync competency when topic changes (if it's a standard activity)
  useEffect(() => {
    const stdComp = getStandardCompetency(activityId, topic);
    if (stdComp && competency !== stdComp) {
      updateCurrentData({ competency: stdComp });
    }
  }, [topic, activityId]);

  const handleSuggest = async () => {
    if (isSuggesting || !process.env.GEMINI_API_KEY) return;
    setIsSuggesting(true);
    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        بناءً على المعطيات التالية للتعليم الابتدائي في الجزائر:
        - الأسبوع: ${week}
        - المقطع: ${section}
        - المادة: ${currentSubject.name}
        - الميدان: ${currentField.name}
        - النشاط: ${currentActivity.name}

        استنتج "الموضوع" (عنوان الدرس) و "الكفاءة المستهدفة" بدقة وفق المنهاج الجزائري.
        يجب أن تكون الكفاءة المستهدفة متسقة تماماً مع الموضوع المختار وتصاغ بأسلوب بيداغوجي احترافي (مثال: أن يكون المتعلم قادراً على...).
        يجب أن تكون المخرجات بصيغة JSON تحتوي على:
        - topic: عنوان الدرس
        - competency: الكفاءة المستهدفة
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
            },
            required: ["topic", "competency"],
          },
        },
      });

      if (response && response.text) {
        const result = JSON.parse(response.text);
        updateCurrentData({
          topic: result.topic || topic,
          competency: result.competency || competency
        });
      }
    } catch (error) {
      // Silent fail for auto-suggestions to avoid cluttering console with network errors
      if (process.env.NODE_ENV === 'development') {
        console.error("Suggestion failed:", error);
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  const currentSubject = ALGERIAN_CURRICULUM.find(s => s.id === subjectId) || ALGERIAN_CURRICULUM[0];
  const currentField = currentSubject.fields.find(f => f.id === fieldId) || currentSubject.fields[0];
  const currentActivity = currentField.activities.find(a => a.id === activityId) || currentField.activities[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      week,
      section,
      subject: currentSubject.name,
      field: currentField.name,
      activity: currentActivity.name,
      topic,
      competency,
      userInfo,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4 text-emerald-600" />
              اسم الأستاذ(ة)
            </label>
            <input
              type="text"
              required
              value={userInfo.fullName}
              onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              placeholder="الاسم واللقب"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <School className="w-4 h-4 text-emerald-600" />
              المؤسسة التربوية
            </label>
            <input
              type="text"
              required
              value={userInfo.school}
              onChange={(e) => setUserInfo({ ...userInfo, school: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              placeholder="اسم المدرسة"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              المقاطعة التفتيشية
            </label>
            <input
              type="text"
              required
              value={userInfo.inspectionDistrict}
              onChange={(e) => setUserInfo({ ...userInfo, inspectionDistrict: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              placeholder="المقاطعة"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              مديرية التربية
            </label>
            <input
              type="text"
              required
              value={userInfo.educationDirectorate}
              onChange={(e) => setUserInfo({ ...userInfo, educationDirectorate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              placeholder="المديرية"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              المستوى التعليمي
            </label>
            <select
              value={userInfo.grade}
              onChange={(e) => setUserInfo({ ...userInfo, grade: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              التاريخ
            </label>
            <input
              type="date"
              required
              value={userInfo.date}
              onChange={(e) => setUserInfo({ ...userInfo, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
            />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Lesson Selection Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-emerald-600" />
              الأسبوع
            </label>
            <select
              value={week}
              onChange={(e) => {
                const newWeek = e.target.value;
                const newSection = WEEK_TO_SECTION[newWeek] || section;
                setWeek(newWeek);
                setSection(newSection);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              {WEEKS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Layers className="w-4 h-4 text-emerald-600" />
              المقطع
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              المادة
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                const newSubjectId = e.target.value;
                const newSubject = ALGERIAN_CURRICULUM.find(s => s.id === newSubjectId) || ALGERIAN_CURRICULUM[0];
                setSubjectId(newSubjectId);
                setFieldId(newSubject.fields[0].id);
                setActivityId(newSubject.fields[0].activities[0].id);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              {ALGERIAN_CURRICULUM.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ChevronRight className="w-4 h-4 text-emerald-600" />
              الميدان
            </label>
            <select
              value={fieldId}
              onChange={(e) => {
                const newFieldId = e.target.value;
                const newField = currentSubject.fields.find(f => f.id === newFieldId) || currentSubject.fields[0];
                setFieldId(newFieldId);
                setActivityId(newField.activities[0].id);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              {currentSubject.fields.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-emerald-600" />
              النشاط
            </label>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              {currentField.activities.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              الموضوع
            </label>
            <div className="relative">
              {availableTopics.length > 0 ? (
                <select
                  required
                  value={topic}
                  onChange={(e) => updateCurrentData({ topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
                >
                  {availableTopics.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => updateCurrentData({ topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white pr-10"
                  placeholder="موضوع الدرس"
                />
              )}
              {isSuggesting && !availableTopics.length && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                </div>
              )}
              {availableTopics.length > 0 && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Competency Section - Centered at the bottom */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <label className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              <Check className="w-5 h-5 text-emerald-600" />
              الكفاءة المستهدفة
            </label>
            <textarea
              required
              rows={2}
              value={competency}
              onChange={(e) => updateCurrentData({ competency: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-center text-gray-700 font-medium resize-none shadow-sm"
              placeholder="أدخل الكفاءة المستهدفة هنا..."
            />
            {isSuggesting && (
              <span className="text-[10px] text-emerald-600 font-bold animate-pulse">
                جاري تحديث الكفاءة تلقائياً...
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isGenerating}
            className={`
              relative group px-12 py-4 rounded-2xl font-bold text-lg text-white transition-all overflow-hidden
              ${isGenerating ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-95'}
            `}
          >
            <span className="relative z-10 flex items-center gap-3">
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري توليد المذكرة...
                </>
              ) : (
                <>
                  توليد المذكرة البيداغوجية
                  <ChevronRight className="w-6 h-6" />
                </>
              )}
            </span>
            {!isGenerating && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
