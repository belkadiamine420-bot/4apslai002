export interface Activity {
  id: string;
  name: string;
}

export interface Field {
  id: string;
  name: string;
  activities: Activity[];
}

export interface Subject {
  id: string;
  name: string;
  fields: Field[];
}

export interface UserInfo {
  fullName: string;
  school: string;
  grade: string;
  inspectionDistrict: string;
  educationDirectorate: string;
  date: string;
}

export interface LessonData {
  week: string;
  section: string;
  subject: string;
  field: string;
  activity: string;
  topic: string;
  competency: string;
  userInfo: UserInfo;
}

export interface LessonStage {
  title: string;
  process: string;
  indicators: string;
}

export interface GeneratedLesson {
  topic: string;
  competency: string;
  learningObjective: string;
  stages: LessonStage[];
  teacherNotes?: string;
}
