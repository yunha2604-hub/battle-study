"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, FileText, Settings, ShieldAlert, Award, Brain, 
  RotateCw, Plus, Trash2, Send, Check, BarChart2, BookOpen, UserCheck
} from "lucide-react";

interface QuestionTemplate {
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
}

const MOCK_GENERATED_QUESTIONS: QuestionTemplate[] = [
  {
    category: "국어",
    question: "Q. 다음 중 표준어 표기가 올바르게 짝지어진 문장을 고르시오.",
    options: [
      "그 일은 네 마음대로 하면 되게 되어 있어.",
      "설레임 가득한 첫출근 날이다.",
      "어제는 밤새도록 바람이 불대요.",
      "오랫만에 친구들을 만났다."
    ],
    answerIndex: 0
  },
  {
    category: "영어",
    question: "Q. Choose the grammatically incorrect sentence.",
    options: [
      "The car which he bought yesterday was very expensive.",
      "This is the student who I talked about.",
      "She has a friend whose father is a famous doctor.",
      "The movie what I saw last week was boring."
    ],
    answerIndex: 3
  },
  {
    category: "수학",
    question: "Q. sin 30° + cos 60°의 값은 얼마인가?",
    options: [
      "1/2",
      "1",
      "√3/2",
      "2"
    ],
    answerIndex: 1
  }
];

interface StudentReport {
  name: string;
  school: string;
  accuracy: string;
  speed: string;
  report: string;
}

const STUDENT_REPORTS: StudentReport[] = [
  {
    name: "김민수",
    school: "청계중학교 2학년",
    accuracy: "92.3%",
    speed: "2.4초",
    report: "관계대명사의 문법 판단 속도가 매우 신속하며 정답률이 95%에 달함. 문장 주어 및 종속절 구조 파악에 강점을 나타내며, 퀴즈 배틀 중 고난도 보스 배틀 유형에 대응하는 집중력이 매우 탁월함. 수행평가 최상위권의 문법 이해도를 입증함."
  },
  {
    name: "박지민",
    school: "청계중학교 2학년",
    accuracy: "84.6%",
    speed: "3.2초",
    report: "삼각함수의 기초 삼각비 계산(sin, cos)에 대한 직관적 이해가 뛰어나 연산 속도가 우수함. 단, 영어 관계대명사 문법 문항에서 30% 초과 지연을 보이는 경향이 있어, 향후 구문 구조 파악 중심의 문법 학습 보강을 통한 시간 단축이 권장됨."
  },
  {
    name: "최예은",
    school: "청계중학교 2학년",
    accuracy: "76.9%",
    speed: "4.1초",
    report: "한글 맞춤법 어미(되 vs 돼) 구분 문항에서 우수한 성취도를 보여 기본 표기 개념을 잘 정립하고 있음. 오답 던전(Shadow Raid)을 적극적으로 탐색하여 오답 격파 후 LP 및 번개를 복구하려는 자기주도적 보강 노력이 인상적임."
  }
];

interface ChapterInfo {
  name: string;
  achievementStandard: string;
  achievementStandardCode: string;
}

interface SubjectInfo {
  name: string;
  chapters: ChapterInfo[];
}

interface PublisherInfo {
  name: string;
  subjects: SubjectInfo[];
}

// cascading data structure for Publishers, Subjects, and Chapters with standard mapping
const CURRICULUM_DATA: PublisherInfo[] = [
  {
    name: "미래엔",
    subjects: [
      {
        name: "고1 영어",
        chapters: [
          {
            name: "Lesson 2. The Power of Creativity",
            achievementStandard: "목적에 맞는 어휘 선택 및 구문 판단",
            achievementStandardCode: "12영01-03"
          },
          {
            name: "Lesson 1. A Spark in You",
            achievementStandard: "맥락에 맞는 적절한 표현과 구문 파악",
            achievementStandardCode: "12영01-01"
          },
          {
            name: "Lesson 3. Under the Same Sky",
            achievementStandard: "글의 주제와 문맥 속 관계사 이해",
            achievementStandardCode: "12영01-05"
          }
        ]
      },
      {
        name: "고2 수학 I",
        chapters: [
          {
            name: "I-2. 삼각함수",
            achievementStandard: "사인법칙과 코사인법칙을 이용한 삼각비 구하기",
            achievementStandardCode: "12수01-02"
          },
          {
            name: "I-1. 지수함수와 로그함수",
            achievementStandard: "지수와 로그의 성질을 이용한 식의 계산",
            achievementStandardCode: "12수01-01"
          }
        ]
      },
      {
        name: "중3 국어",
        chapters: [
          {
            name: "1-1. 문학과 만나는 시간",
            achievementStandard: "작가의 의도와 맞춤법 규칙의 이해",
            achievementStandardCode: "12국01-02"
          }
        ]
      }
    ]
  },
  {
    name: "천재교육",
    subjects: [
      {
        name: "고1 영어",
        chapters: [
          {
            name: "Lesson 1. Start Anew",
            achievementStandard: "관계사 구조와 문법 이해",
            achievementStandardCode: "12영02-01"
          },
          {
            name: "Lesson 2. Share Your Thoughts",
            achievementStandard: "어휘 적절성 및 상황별 읽기",
            achievementStandardCode: "12영02-02"
          }
        ]
      },
      {
        name: "고2 수학 I",
        chapters: [
          {
            name: "I-1. 등차수열과 등비수열",
            achievementStandard: "수열의 합과 일반항의 성질 파악",
            achievementStandardCode: "12수02-01"
          }
        ]
      }
    ]
  },
  {
    name: "비상",
    subjects: [
      {
        name: "고1 영어",
        chapters: [
          {
            name: "Lesson 1. Step into the World",
            achievementStandard: "구문 해석 및 문맥적 어휘 유추",
            achievementStandardCode: "12영03-01"
          }
        ]
      }
    ]
  },
  {
    name: "EBS",
    subjects: [
      {
        name: "고1 영어",
        chapters: [
          {
            name: "Lesson 1. 수능특강 라이트 1강",
            achievementStandard: "구문 파악 능력 및 유의어 식별",
            achievementStandardCode: "12영04-01"
          }
        ]
      }
    ]
  },
  {
    name: "YBM",
    subjects: [
      {
        name: "고1 영어",
        chapters: [
          {
            name: "Lesson 1. Open Your Eyes",
            achievementStandard: "다양한 문맥 속 올바른 표현 판단",
            achievementStandardCode: "12영05-01"
          }
        ]
      }
    ]
  }
];

interface TeacherDashboardProps {
  onStartAssessmentMatch: (isStrict: boolean) => void;
  onExit: () => void;
}

export default function TeacherDashboard({ onStartAssessmentMatch, onExit }: TeacherDashboardProps) {
  const [isStrictAssessment, setIsStrictAssessment] = useState(true);
  const [passageText, setPassageText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuests, setGeneratedQuests] = useState<QuestionTemplate[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(STUDENT_REPORTS[0]);
  const [difficulties, setDifficulties] = useState<string[]>(["중", "중", "하"]);

  // Curriculum Scope Selector state
  const [selectedPublisher, setSelectedPublisher] = useState("미래엔");
  const [selectedSubject, setSelectedSubject] = useState("고1 영어");
  const [selectedChapter, setSelectedChapter] = useState("Lesson 2. The Power of Creativity");

  // Derive cascading selectors based on selections
  const currentPublisherObj = CURRICULUM_DATA.find(p => p.name === selectedPublisher) || CURRICULUM_DATA[0];
  const availableSubjects = currentPublisherObj.subjects;
  
  const currentSubjectObj = availableSubjects.find(s => s.name === selectedSubject) || availableSubjects[0] || { name: "", chapters: [] };
  const availableChapters = currentSubjectObj.chapters || [];

  const currentChapterObj = availableChapters.find(c => c.name === selectedChapter) || availableChapters[0] || { name: "", achievementStandard: "", achievementStandardCode: "" };

  const getMetadataBadge = () => {
    const lessonPart = selectedChapter.split(".")[0];
    return `${selectedPublisher} | ${selectedSubject} | ${lessonPart}`;
  };

  const handleGenerate = () => {
    if (!passageText.trim()) {
      alert("지문을 먼저 입력해 주세요!");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Attach scope metadata as badge
      const badge = getMetadataBadge();
      const mapped = MOCK_GENERATED_QUESTIONS.map(q => ({
        ...q,
        category: badge
      }));
      setGeneratedQuests(mapped);
      setDifficulties(["중", "중", "하"]);
    }, 1500);
  };

  const handleDifficultyChange = (index: number, value: string) => {
    setDifficulties((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // Compile paragraph dynamically for AI Assessment report linking the curriculum scope
  const getDynamicReport = (student: StudentReport | null) => {
    if (!student) return "";
    const subjectName = selectedSubject.includes("영어") ? "영어" : selectedSubject.includes("수학") ? "수학" : "국어";
    const lessonPart = selectedChapter.split(".")[0];
    
    const scopeName = `${selectedPublisher} ${subjectName} ${lessonPart}`;
    const standardName = currentChapterObj ? currentChapterObj.achievementStandard : "목적에 맞는 어휘 선택";

    if (student.name === "김민수") {
      return `${scopeName}의 [${standardName}] 성취기준 평가에서 매우 우수한 반응 속도(상위 10%)와 정확도를 보임. 특히 수행평가 블라인드 배틀 모드에서 주도적으로 문제를 해결하며, 관계대명사의 문법 판단 속도가 매우 신속함. 문장 주어 및 종속절 구조 파악에 강점을 나타내며, 수행평가 최상위권의 문법 이해도를 입증함.`;
    }
    if (student.name === "박지민") {
      return `${scopeName}의 [${standardName}] 성취기준 평가에서 삼각비 계산에 대한 직관적 이해가 뛰어나 연산 속도가 우수함. 단, 관계대명사 구문 구조 파악 중심의 문법 문항에서 30% 초과 지연을 보이는 경향이 있어, 향후 구문 구조 파악 중심의 문법 학습 보강을 통한 시간 단축이 권장됨.`;
    }
    // 최예은
    return `${scopeName}의 [${standardName}] 성취기준 평가에서 한글 맞춤법 표기 개념을 잘 정립하고 있으며, 수행평가 진행 과정 중 오답 던전(Shadow Raid)을 탐색하여 오답 격파 후 개념을 보강하려는 자기주도적 보강 노력이 인상적임.`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10 flex flex-col justify-between">
      
      {/* Dashboard Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-6 mb-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-950 flex items-center gap-2">
              SchoolBattle 교사용 B2B 대시보드
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              학생들의 수행평가 출제 관리 및 AI 생활기록부 세특 리포팅 도구입니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onExit}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
          >
            학생 모드로 복귀
          </button>
          
          <button 
            onClick={() => onStartAssessmentMatch(isStrictAssessment)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-colors cursor-pointer ${
              isStrictAssessment 
                ? "bg-red-600 hover:bg-red-500 shadow-red-600/10" 
                : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10"
            }`}
          >
            {isStrictAssessment ? "수행평가 아레나 테스트 시작" : "일반 배틀 아레나 테스트 시작"}
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left Column: Settings & AI Quiz Generator (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Assessment Mode Toggle Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-slate-500" />
                출제 배틀 모드 제어
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                '수행평가 모드'를 활성화하면 학생들의 화면에 이탈 방지 경고 및 익명 처리가 적용되며 화려한 특수효과가 배제됩니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-black ${!isStrictAssessment ? "text-slate-900" : "text-slate-400"}`}>
                일반 배틀
              </span>
              
              {/* Switch */}
              <button 
                onClick={() => setIsStrictAssessment(!isStrictAssessment)}
                className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer ${
                  isStrictAssessment ? "bg-red-600" : "bg-slate-200"
                }`}
              >
                <motion.div 
                  layout
                  className="w-5.5 h-5.5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"
                  animate={{ x: isStrictAssessment ? 22 : 0 }}
                />
              </button>
              
              <span className={`text-xs font-black ${isStrictAssessment ? "text-red-600" : "text-slate-400"}`}>
                수행평가 엄근진 모드
              </span>
            </div>
          </div>

          {/* AI 1초 출제 엔진 (Passage Input) & Curriculum scope selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500/10 animate-pulse" />
                AI 1초 문항 출제 엔진
              </h3>
            </div>
            
            {/* 평가 범위 및 기준 설정 (Assessment Scope Setup) */}
            <div className="border-t border-b border-slate-100 py-4 my-2 space-y-4">
              <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">
                평가 범위 및 기준 설정 (Assessment Scope Setup)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Publisher Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">출판사 선택</label>
                  <select
                    value={selectedPublisher}
                    onChange={(e) => {
                      const newPubName = e.target.value;
                      setSelectedPublisher(newPubName);
                      
                      const pub = CURRICULUM_DATA.find(p => p.name === newPubName);
                      if (pub && pub.subjects.length > 0) {
                        const newSub = pub.subjects[0];
                        setSelectedSubject(newSub.name);
                        if (newSub.chapters.length > 0) {
                          setSelectedChapter(newSub.chapters[0].name);
                        } else {
                          setSelectedChapter("");
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    {CURRICULUM_DATA.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Grade & Subject Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">학년/과목 선택</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      const newSubName = e.target.value;
                      setSelectedSubject(newSubName);
                      
                      const pub = CURRICULUM_DATA.find(p => p.name === selectedPublisher);
                      const sub = pub?.subjects.find(s => s.name === newSubName);
                      if (sub && sub.chapters.length > 0) {
                        setSelectedChapter(sub.chapters[0].name);
                      } else {
                        setSelectedChapter("");
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    {availableSubjects.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold">단원/목차 선택</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    {availableChapters.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Achievement Standard Tag */}
              {currentChapterObj && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">성취기준 매핑 (Achievement Standard)</span>
                    <p className="text-[11px] text-slate-700 font-extrabold">
                      교육과정 코드: <span className="text-purple-650 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/50">[{currentChapterObj.achievementStandardCode}]</span> {currentChapterObj.achievementStandard}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              교과서 본문 지문이나 개념 텍스트를 입력하시면 AI가 적합한 다지선다 퀴즈를 자동으로 설계합니다.
            </p>

            <textarea 
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
              placeholder="예시 지문 입력: 'The information which I found on the website was helpful. sin 30 is 1/2...'"
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-medium"
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI 분석 및 출제 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-white/10" />
                  <span>✨ AI 문제 자동 생성</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Questions List */}
          <AnimatePresence>
            {generatedQuests.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    추천 생성 문항 리스트
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-200">
                    AI 분석 문항 3건
                  </span>
                </div>

                <div className="space-y-4">
                  {generatedQuests.map((quest, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-250">
                          {quest.category}
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          {quest.question}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          정답: {quest.answerIndex + 1}. {quest.options[quest.answerIndex]}
                        </span>
                      </div>

                      {/* Difficulty drop box */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner">
                        <span className="text-[10px] text-slate-500 font-bold">난이도:</span>
                        <select 
                          value={difficulties[idx]} 
                          onChange={(e) => handleDifficultyChange(idx, e.target.value)}
                          className="text-[10px] font-black text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                        >
                          <option value="하">하 (Easy)</option>
                          <option value="중">중 (Normal)</option>
                          <option value="수능형 킬러">수능형 킬러 (Killer)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </section>

        {/* Right Column: Student Reports Dashboard (5 cols) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
              <UserCheck className="w-5 h-5 text-slate-500" />
              AI 세특 분석 리포트
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              학생의 아레나 퀴즈 전적 및 정답 속도를 분석하여 생활기록부용 세특 단락을 추천합니다.
            </p>
          </div>

          {/* Students list */}
          <div className="flex flex-wrap gap-2">
            {STUDENT_REPORTS.map((student) => (
              <button
                key={student.name}
                type="button"
                onClick={() => setSelectedStudent(student)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedStudent?.name === student.name
                    ? "bg-slate-900 text-white border-slate-900 shadow"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {student.name} ({student.school.split(" ")[0]})
              </button>
            ))}
          </div>

          {/* Student Report breakdown */}
          <AnimatePresence mode="wait">
            {selectedStudent && (
              <motion.div
                key={selectedStudent.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 border-t border-slate-100 pt-4"
              >
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">평균 정답률</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">{selectedStudent.accuracy}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">평균 풀이 반응속도</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">{selectedStudent.speed}</span>
                  </div>
                </div>

                {/* Report Area */}
                <div className="p-4 bg-slate-950 text-slate-100 rounded-2xl relative shadow-md">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20 animate-pulse" />
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                      생기부 세부능력 및 특기사항 추천
                    </span>
                  </div>

                  <p className="text-xs md:text-sm font-medium leading-relaxed break-keep">
                    {getDynamicReport(selectedStudent)}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">GENERATED BY BATTLE AI</span>
                    <button
                      onClick={() => {
                        const dynamicReport = getDynamicReport(selectedStudent);
                        navigator.clipboard.writeText(dynamicReport);
                        alert("세특 추천 문장이 클립보드에 복사되었습니다! NEIS 생기부에 붙여넣으세요.");
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      문구 복사하기
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </section>

      </main>

    </div>
  );
}
