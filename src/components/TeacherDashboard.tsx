"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, Sparkles, Key, CheckCircle2, Clock, 
  AlertTriangle, Users, Filter, Search, RotateCcw, 
  Edit3, ShieldCheck, ArrowRight, BookOpen, 
  ChevronRight, Award, FileCheck2, XCircle, HelpCircle
} from "lucide-react";

// --- Types ---
export interface MathChapter {
  id: string;
  name: string;
  code: string;
  achievementStandard: string;
  defaultPage: string;
}

export interface GeneratedMathQuestion {
  id: number;
  question: string;
  type: "객관식" | "서술형 풀이";
  options?: string[];
  correctAnswer: string;
  solution: string;
  points: number;
  difficulty: "하" | "중" | "상";
  standardCode: string;
}

export interface QuestionAnswerDetail {
  qNum: number;
  title: string;
  studentAnswer: string;
  correctAnswer: string;
  pointsEarned: number;
  maxPoints: number;
  aiAssessment: string;
}

export interface StudentAssessmentRow {
  id: string;
  grade: number;
  classNum: number;
  studentNum: number;
  name: string;
  submitted: boolean;
  submittedAt?: string;
  aiScore: number;
  teacherScore: number | null;
  isConfirmed: boolean;
  aiSummary: string;
  answers: QuestionAnswerDetail[];
  teacherFeedback?: string;
}

// --- Mock Math Curriculum ---
const MATH_CHAPTERS: MathChapter[] = [
  {
    id: "ch1",
    name: "I-1. 제곱근과 실수",
    code: "9수01-01",
    achievementStandard: "제곱근의 뜻과 성질을 이해하고 실수의 대소 관계를 판단할 수 있다.",
    defaultPage: "p.10 ~ p.25"
  },
  {
    id: "ch2",
    name: "I-2. 근호를 포함한 식의 계산",
    code: "9수01-02",
    achievementStandard: "근호를 포함한 식의 사칙연산을 능숙하게 계산할 수 있다.",
    defaultPage: "p.26 ~ p.42"
  },
  {
    id: "ch3",
    name: "II-1. 다항식의 곱셈과 인수분해",
    code: "9수02-01",
    achievementStandard: "다항식의 곱셈 공식을 이해하고 이를 활용하여 식을 인수분해할 수 있다.",
    defaultPage: "p.46 ~ p.65"
  },
  {
    id: "ch4",
    name: "II-2. 이차방정식의 풀이와 활용",
    code: "9수02-02",
    achievementStandard: "이차방정식을 인수분해와 근의 공식을 통해 풀고 실생활 문제를 해결할 수 있다.",
    defaultPage: "p.68 ~ p.92"
  },
  {
    id: "ch5",
    name: "III-1. 삼각비의 성질과 활용",
    code: "9수03-01",
    achievementStandard: "직각삼각형에서 삼각비의 뜻을 알고 길이와 넓이를 계산할 수 있다.",
    defaultPage: "p.98 ~ p.124"
  }
];

// Initial Generated Math Questions
const DEFAULT_MATH_QUESTIONS: GeneratedMathQuestion[] = [
  {
    id: 1,
    question: "다음 중 √(-5)²의 올바른 양의 제곱근 값을 구하시오.",
    type: "객관식",
    options: ["-5", "5", "±5", "√5"],
    correctAnswer: "5",
    solution: "√(-5)² = √25 = 5 입니다. 제곱근 안의 음수 제곱은 양수가 되므로 결과값은 5입니다.",
    points: 30,
    difficulty: "하",
    standardCode: "9수01-01"
  },
  {
    id: 2,
    question: "다음 식을 간단히 계산하시오: 3√2 + 5√2 - 2√8",
    type: "객관식",
    options: ["4√2", "6√2", "8√2", "2√2"],
    correctAnswer: "4√2",
    solution: "2√8 = 2√(4×2) = 4√2 입니다. 따라서 3√2 + 5√2 - 4√2 = 4√2 입니다.",
    points: 35,
    difficulty: "중",
    standardCode: "9수01-02"
  },
  {
    id: 3,
    question: "[서술형] 이차식 x² - 6x + 9 = 0 의 해를 구하고, 완전제곱식을 이용한 풀이과정을 서술하시오.",
    type: "서술형 풀이",
    correctAnswer: "x = 3 (중근)",
    solution: "(x - 3)² = 0 으로 인수분해되므로 x = 3(중근)입니다. 전개식의 일차항 계수의 반의 제곱이 상수항과 일치함을 명시해야 합니다.",
    points: 35,
    difficulty: "상",
    standardCode: "9수02-01"
  }
];

// Mock Student Assessment Rows (Class 1, 2, 3)
const INITIAL_STUDENTS: StudentAssessmentRow[] = [
  {
    id: "std-1",
    grade: 3,
    classNum: 1,
    studentNum: 1,
    name: "김민수",
    submitted: true,
    submittedAt: "10:24",
    aiScore: 95,
    teacherScore: 95,
    isConfirmed: true,
    aiSummary: "객관식 2문항 만점(+65점). 3번 서술형 완전제곱식 유도 과정 논리적 완결성 우수(+30/35점).",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "정답 (2√8 단순화 정확함)" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "(x-3)^2 = 0 이므로 x=3 중근", correctAnswer: "x=3 (중근)", pointsEarned: 30, maxPoints: 35, aiAssessment: "부분점수 부여: 중근 도출은 완벽하나 계수 관계 설명 1줄 누락" }
    ],
    teacherFeedback: "풀이 단계별 전개 과정이 매우 우수하여 AI 1차 채점 점수를 그대로 확정함."
  },
  {
    id: "std-2",
    grade: 3,
    classNum: 1,
    studentNum: 2,
    name: "박지민",
    submitted: true,
    submittedAt: "10:28",
    aiScore: 84,
    teacherScore: null,
    isConfirmed: false,
    aiSummary: "객관식 1번 정답(+30점), 2번 오답(6√2 선택, 0점). 3번 서술형 완벽 풀이(+35/35점). AI 산출 65점이나 서술형 가산점 적용 84점 부여.",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "6√2", correctAnswer: "4√2", pointsEarned: 19, maxPoints: 35, aiAssessment: "오답: 2√8 단순화 부호 계산 실수 (부분 배점 적용)" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "x^2 - 6x + 9 = (x-3)^2 = 0, 따라서 x=3 (중근)", correctAnswer: "x=3 (중근)", pointsEarned: 35, maxPoints: 35, aiAssessment: "만점: 완전제곱식 공식과 중근 표기 완벽" }
    ]
  },
  {
    id: "std-3",
    grade: 3,
    classNum: 1,
    studentNum: 3,
    name: "최예은",
    submitted: true,
    submittedAt: "10:19",
    aiScore: 78,
    teacherScore: 82,
    isConfirmed: true,
    aiSummary: "객관식 2문항 정답(+65점). 서술형 풀이에서 중근 표기 누락(-10점). AI 70점 산출 후 교사가 풀이 성의 감안 82점으로 상향 확정.",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "정답" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "x=3", correctAnswer: "x=3 (중근)", pointsEarned: 13, maxPoints: 35, aiAssessment: "부분점수: 중근 명시 누락으로 13점 부여" }
    ],
    teacherFeedback: "중근 표현은 누락했으나 근의 도출 과정이 명확하므로 4점 상향 조정(82점)."
  },
  {
    id: "std-4",
    grade: 3,
    classNum: 1,
    studentNum: 4,
    name: "이도윤",
    submitted: true,
    submittedAt: "10:15",
    aiScore: 100,
    teacherScore: 100,
    isConfirmed: true,
    aiSummary: "전 문항 정답 및 서술형 풀이과정 모범답안 수준(+100점).",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "만점" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "만점" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "x² - 6x + 9 = (x - 3)² = 0 이므로 x = 3 (중근)", correctAnswer: "x=3 (중근)", pointsEarned: 35, maxPoints: 35, aiAssessment: "만점" }
    ]
  },
  {
    id: "std-5",
    grade: 3,
    classNum: 1,
    studentNum: 5,
    name: "정서연",
    submitted: true,
    submittedAt: "10:31",
    aiScore: 88,
    teacherScore: null,
    isConfirmed: false,
    aiSummary: "1번 정답(+30점), 2번 정답(+35점). 3번 서술형 수식 전개 부분오류(+23/35점). 교사 확인 요망.",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "정답" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "(x-3)(x-3)=0, x=3", correctAnswer: "x=3 (중근)", pointsEarned: 23, maxPoints: 35, aiAssessment: "중근 표기 생략으로 감점" }
    ]
  },
  {
    id: "std-6",
    grade: 3,
    classNum: 2,
    studentNum: 1,
    name: "강하준",
    submitted: true,
    submittedAt: "10:22",
    aiScore: 92,
    teacherScore: 92,
    isConfirmed: true,
    aiSummary: "모든 문항 안정적 해결, 계산 속도 우수(+92점).",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "정답" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "(x-3)² = 0, x=3 (중근)", correctAnswer: "x=3 (중근)", pointsEarned: 27, maxPoints: 35, aiAssessment: "우수" }
    ]
  },
  {
    id: "std-7",
    grade: 3,
    classNum: 2,
    studentNum: 2,
    name: "윤아인",
    submitted: true,
    submittedAt: "10:29",
    aiScore: 75,
    teacherScore: null,
    isConfirmed: false,
    aiSummary: "1번 정답(+30점), 2번 계산 오류(+15/35점), 3번 서술형 부분점수(+30/35점).",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "8√2", correctAnswer: "4√2", pointsEarned: 15, maxPoints: 35, aiAssessment: "2√8 덧셈 기호 오인" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "(x-3)²=0 => x=3", correctAnswer: "x=3 (중근)", pointsEarned: 30, maxPoints: 35, aiAssessment: "양호" }
    ]
  },
  {
    id: "std-8",
    grade: 3,
    classNum: 2,
    studentNum: 3,
    name: "조우진",
    submitted: true,
    submittedAt: "10:20",
    aiScore: 85,
    teacherScore: 85,
    isConfirmed: true,
    aiSummary: "안정적인 풀이와 정확한 중근 도출(+85점).",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "정답" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "x=3", correctAnswer: "x=3 (중근)", pointsEarned: 20, maxPoints: 35, aiAssessment: "부분점수" }
    ]
  },
  {
    id: "std-9",
    grade: 3,
    classNum: 3,
    studentNum: 1,
    name: "한수아",
    submitted: true,
    submittedAt: "10:12",
    aiScore: 100,
    teacherScore: 100,
    isConfirmed: true,
    aiSummary: "수행평가 만점. 서술형 풀이 논리 전개 완벽(+100점).",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "만점" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "4√2", correctAnswer: "4√2", pointsEarned: 35, maxPoints: 35, aiAssessment: "만점" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "x² - 6x + 9 = (x - 3)² = 0, x = 3(중근)", correctAnswer: "x=3 (중근)", pointsEarned: 35, maxPoints: 35, aiAssessment: "만점" }
    ]
  },
  {
    id: "std-10",
    grade: 3,
    classNum: 3,
    studentNum: 2,
    name: "배현우",
    submitted: true,
    submittedAt: "10:35",
    aiScore: 68,
    teacherScore: null,
    isConfirmed: false,
    aiSummary: "1번 정답(+30점), 2번 오답(+10/35점), 3번 서술형 식 미완성(+28/35점). 2차 검토 필요.",
    answers: [
      { qNum: 1, title: "제곱근 계산", studentAnswer: "5", correctAnswer: "5", pointsEarned: 30, maxPoints: 30, aiAssessment: "정답" },
      { qNum: 2, title: "근호 사칙연산", studentAnswer: "2√2", correctAnswer: "4√2", pointsEarned: 10, maxPoints: 35, aiAssessment: "감점" },
      { qNum: 3, title: "이차식 서술형", studentAnswer: "x=3", correctAnswer: "x=3 (중근)", pointsEarned: 28, maxPoints: 35, aiAssessment: "부분점수" }
    ]
  },
  {
    id: "std-11",
    grade: 3,
    classNum: 3,
    studentNum: 3,
    name: "송지우",
    submitted: false,
    aiScore: 0,
    teacherScore: null,
    isConfirmed: false,
    aiSummary: "수행평가 미응시 (시험 미제출 상태).",
    answers: []
  }
];

interface TeacherDashboardProps {
  onStartAssessmentMatch: (isStrict: boolean) => void;
  onExit: () => void;
}

export default function TeacherDashboard({ onStartAssessmentMatch, onExit }: TeacherDashboardProps) {
  // --- Step 1: AI Math Question Generator State ---
  const [selectedChapterId, setSelectedChapterId] = useState<string>("ch1");
  const [pageRange, setPageRange] = useState<string>("p.10 ~ p.25");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<"하" | "중" | "상">("중");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<GeneratedMathQuestion[]>(DEFAULT_MATH_QUESTIONS);
  const [isQuestionsConfirmed, setIsQuestionsConfirmed] = useState<boolean>(true);

  // --- Step 2: One-time Code (PIN) State ---
  const [roomCode, setRoomCode] = useState<string>("MTH-7429");
  const [codeStatus, setCodeStatus] = useState<"READY" | "IN_PROGRESS" | "EXPIRED">("IN_PROGRESS");
  const [submittedCount, setSubmittedCount] = useState<number>(10);
  const [totalStudentsCount] = useState<number>(11);

  // --- Step 3: Student Performance Assessment Table & Filters ---
  const [students, setStudents] = useState<StudentAssessmentRow[]>(INITIAL_STUDENTS);
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStudentNum, setFilterStudentNum] = useState<string>("");

  // --- Step 4: Teacher 2nd Evaluation Modal State ---
  const [selectedStudentForReview, setSelectedStudentForReview] = useState<StudentAssessmentRow | null>(null);
  const [tempTeacherScore, setTempTeacherScore] = useState<number>(85);
  const [tempFeedback, setTempFeedback] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedChapter = useMemo(() => {
    return MATH_CHAPTERS.find(c => c.id === selectedChapterId) || MATH_CHAPTERS[0];
  }, [selectedChapterId]);

  // Handle AI Question Generation
  const handleGenerateQuestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Generate sample questions matching the chosen chapter & difficulty
      const chapter = MATH_CHAPTERS.find(c => c.id === selectedChapterId) || MATH_CHAPTERS[0];
      const newQuests: GeneratedMathQuestion[] = [
        {
          id: 1,
          question: `[${chapter.name}] 다음 조건을 만족하는 실수의 개수를 구하시오. (출제 범위: ${pageRange})`,
          type: "객관식",
          options: ["1개", "2개", "3개", "무수히 많다"],
          correctAnswer: "2개",
          solution: `${chapter.achievementStandard} 개념에 따라 근호 안의 수는 항상 0 이상이어야 하므로 2개가 성립합니다.`,
          points: 30,
          difficulty: difficulty,
          standardCode: chapter.code
        },
        {
          id: 2,
          question: `[${chapter.name}] 주어진 식을 전개하여 동류항끼리 정리했을 때 최고차항의 계수는?`,
          type: "객관식",
          options: ["-1", "1", "2", "3"],
          correctAnswer: "1",
          solution: "다항식 곱셈 공식을 적용하여 식을 단순화하면 x² + 2x - 3 이 되므로 최고차항 계수는 1입니다.",
          points: 35,
          difficulty: difficulty,
          standardCode: chapter.code
        },
        {
          id: 3,
          question: `[서술형] ${chapter.name}의 성취기준(${chapter.code})에 기반하여 문제의 풀이과정과 답을 단계별로 서술하시오.`,
          type: "서술형 풀이",
          correctAnswer: "단계별 풀이 및 최종값 유도",
          solution: "조건에 맞춘 식 수립(15점) + 계산 과정의 정확성(10점) + 최종 해 도출(10점)",
          points: 35,
          difficulty: difficulty,
          standardCode: chapter.code
        }
      ];
      setQuestions(newQuests.slice(0, questionCount));
      setIsQuestionsConfirmed(false);
      showToast("✨ AI가 수학 수행평가 문항을 자동 출제했습니다! 문항을 확인하고 확정해주세요.");
    }, 1200);
  };

  const handleConfirmQuestions = () => {
    setIsQuestionsConfirmed(true);
    showToast("✅ 수학 수행평가 문항이 최종 확정되었습니다! 이제 일회성 코드를 발급할 수 있습니다.");
  };

  // Generate New One-time Code
  const handleGenerateNewCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `MTH-${randomDigits}`;
    setRoomCode(newCode);
    setCodeStatus("IN_PROGRESS");
    setSubmittedCount(0);
    showToast(`🔑 새 일회성 시험 코드 [${newCode}]가 발급되었습니다. 학생들에게 공유하세요.`);
  };

  // Expire Code
  const handleExpireCode = () => {
    setCodeStatus("EXPIRED");
    showToast("🛑 시험이 종료되어 일회성 코드가 만료되었습니다. 더 이상 재사용할 수 없습니다.");
  };

  // Simulate Student Submission
  const handleSimulateStudentSubmit = () => {
    if (codeStatus !== "IN_PROGRESS") {
      alert("시험이 진행 중일 때만 학생 제출이 가능합니다.");
      return;
    }
    setSubmittedCount(prev => Math.min(totalStudentsCount, prev + 1));
    showToast("⚡ 실시간 알림: 학생 1명이 수학 수행평가 답안을 제출했습니다.");
  };

  // Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Class filter
      if (filterClass !== "ALL" && student.classNum !== parseInt(filterClass)) {
        return false;
      }
      // Status filter
      if (filterStatus === "CONFIRMED" && !student.isConfirmed) return false;
      if (filterStatus === "PENDING" && (!student.submitted || student.isConfirmed)) return false;
      if (filterStatus === "NOT_SUBMITTED" && student.submitted) return false;

      // Student number filter
      if (filterStudentNum && student.studentNum !== parseInt(filterStudentNum)) {
        return false;
      }
      // Name search
      if (searchQuery.trim() && !student.name.includes(searchQuery.trim())) {
        return false;
      }

      return true;
    });
  }, [students, filterClass, filterStatus, filterStudentNum, searchQuery]);

  // Open 2nd Evaluation Modal
  const handleOpenReviewModal = (student: StudentAssessmentRow) => {
    setSelectedStudentForReview(student);
    setTempTeacherScore(student.teacherScore ?? student.aiScore);
    setTempFeedback(student.teacherFeedback ?? "");
  };

  // Confirm Teacher 2nd Evaluation Score
  const handleSaveTeacherEvaluation = () => {
    if (!selectedStudentForReview) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentForReview.id) {
        return {
          ...s,
          teacherScore: tempTeacherScore,
          isConfirmed: true,
          teacherFeedback: tempFeedback.trim() || undefined
        };
      }
      return s;
    }));

    showToast(`🎯 [${selectedStudentForReview.name}] 학생의 2차 평가 점수(${tempTeacherScore}점)가 최종 확정되었습니다.`);
    setSelectedStudentForReview(null);
  };

  // Calculated Stats
  const confirmedCount = students.filter(s => s.isConfirmed).length;
  const pendingCount = students.filter(s => s.submitted && !s.isConfirmed).length;
  const averageScore = Math.round(
    students.filter(s => s.submitted).reduce((acc, cur) => acc + (cur.teacherScore ?? cur.aiScore), 0) /
    (students.filter(s => s.submitted).length || 1)
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 md:p-8 flex flex-col justify-between">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs md:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto border-b border-slate-300 pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                수학과 전용 관리 대시보드
              </span>
              <span className="text-xs text-slate-500 font-semibold">청계중학교 3학년 수학과</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-950 mt-1">
              수학 수행평가 통합 관리 시스템
            </h1>
          </div>
        </div>

        {/* Global Navigation Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onExit}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
          >
            학생 화면으로 복귀
          </button>
          
          <button
            onClick={() => onStartAssessmentMatch(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>수행평가 시험 응시 테스트</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto space-y-6">

        {/* Summary Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>수행평가 과목</span>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <span className="text-base md:text-lg font-black text-slate-900">중3 수학 (I. 실수와 연산)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">평가 범위: {selectedChapter.name}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>응시 현황</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{students.filter(s => s.submitted).length}</span>
              <span className="text-xs font-bold text-slate-500">/ {students.length}명 응시 완료</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(students.filter(s => s.submitted).length / students.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>학급 평균 점수</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{averageScore}</span>
              <span className="text-xs font-bold text-slate-500">/ 100점 만점</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">최고 100점 · 최저 68점</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>2차 교사 확정 현황</span>
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-600">{confirmedCount}</span>
              <span className="text-xs font-bold text-slate-500">명 확정 (대기: <strong className="text-amber-600">{pendingCount}명</strong>)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">AI 1차 채점 자동 완료됨</p>
          </div>
        </section>

        {/* Section 1 & 2 Grid: AI Question Maker & One-Time Code */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Step 1: AI 수행평가 문항 출제 및 문제 확정 (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>AI 수학 수행평가 문항 출제 및 문제 확정</span>
                </h2>
              </div>
              {isQuestionsConfirmed ? (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 문제 확정 완료
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-black flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 확정 대기 중
                </span>
              )}
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Chapter Select */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600">교과서 단원 (목차)</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    setSelectedChapterId(e.target.value);
                    const ch = MATH_CHAPTERS.find(c => c.id === e.target.value);
                    if (ch) setPageRange(ch.defaultPage);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {MATH_CHAPTERS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Page Range */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">페이지 범위</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="예: p.12 ~ p.35"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">출제 난이도</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as "하" | "중" | "상")}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="하">기본 (하)</option>
                  <option value="중">표준 (중)</option>
                  <option value="상">심화 (상)</option>
                </select>
              </div>
            </div>

            {/* Curriculum standard note */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-indigo-900">
              <span className="font-extrabold bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-800">
                교육과정 성취기준 [{selectedChapter.code}]
              </span>
              <span className="truncate">{selectedChapter.achievementStandard}</span>
            </div>

            {/* AI Generate Button */}
            <div className="flex gap-2">
              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>AI 수학 문항 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white/20" />
                    <span>AI 수행평가 문항 자동 생성</span>
                  </>
                )}
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                <span>생성된 문항 리스트 ({questions.length}문항)</span>
                <span className="text-[11px] text-slate-500 font-semibold">총 배점: 100점 만점</span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black">
                          {idx + 1}번 문항
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {q.type}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          배점 {q.points}점
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        난이도: {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question}
                    </p>

                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                              opt === q.correctAnswer 
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" 
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {optIdx + 1}. {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                      <div><strong className="text-slate-800">정답:</strong> {q.correctAnswer}</div>
                      <div><strong className="text-slate-800">채점 기준/해설:</strong> {q.solution}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirm Questions Button */}
              {!isQuestionsConfirmed ? (
                <button
                  onClick={handleConfirmQuestions}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>위 문항으로 수행평가 문제 최종 확정하기</span>
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>수행평가 문제가 확정되었습니다. 일회성 코드로 시험을 시작할 수 있습니다.</span>
                  </div>
                  <button 
                    onClick={() => setIsQuestionsConfirmed(false)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    문제 재수정
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: 일회성 시험 코드 배포 & 만료 관리 (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h2 className="font-extrabold text-slate-900 text-base">
                  수업시간 일회성 시험 코드 배포
                </h2>
              </div>
            </div>

            {/* Code Box */}
            <div className={`p-6 rounded-3xl border-2 text-center transition-all ${
              codeStatus === "IN_PROGRESS"
                ? "bg-slate-950 text-white border-indigo-500 shadow-xl"
                : codeStatus === "EXPIRED"
                ? "bg-slate-100 text-slate-400 border-slate-300"
                : "bg-slate-50 text-slate-800 border-dashed border-slate-300"
            }`}>
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>수행평가 일회성 시험 PIN</span>
              </div>

              {/* Large PIN Display */}
              <div className="my-3">
                <span className={`font-mono text-3xl md:text-4xl font-black tracking-widest ${
                  codeStatus === "EXPIRED" ? "line-through text-slate-400" : "text-indigo-400"
                }`}>
                  {roomCode}
                </span>
              </div>

              {/* Status Badge */}
              <div className="inline-block mt-1">
                {codeStatus === "IN_PROGRESS" && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    시험 진행 중 (학생 응시 가능)
                  </span>
                )}
                {codeStatus === "EXPIRED" && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    시험 종료 (코드 만료됨 · 재사용 불가)
                  </span>
                )}
              </div>

              <p className={`text-xs mt-4 ${codeStatus === "IN_PROGRESS" ? "text-slate-400" : "text-slate-500"}`}>
                {codeStatus === "IN_PROGRESS"
                  ? "수업 시간에 학생들에게 이 코드를 공유하면 즉시 시험이 시작됩니다."
                  : "시험이 종료되면 일회성 코드는 보안을 위해 영구 만료되며 재사용할 수 없습니다."}
              </p>
            </div>

            {/* Submission Simulator & Controls */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                <span>실시간 답안 제출 현황</span>
                <span className="font-mono text-indigo-600">
                  {students.filter(s => s.submitted).length} / {students.length}명 제출 완료
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(students.filter(s => s.submitted).length / students.length) * 100}%` }}
                />
              </div>

              {/* Code Control Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleGenerateNewCode}
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>새 일회성 코드 생성</span>
                </button>

                <button
                  onClick={handleExpireCode}
                  disabled={codeStatus === "EXPIRED"}
                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  <span>시험 종료 & 코드 만료</span>
                </button>
              </div>
            </div>

            {/* Guide alert box */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>선생님 안내:</strong> 학생들이 제출한 답안은 일차적으로 AI가 정밀 자동 채점하며, 아래 관리 테이블에서 최종 점수를 확정할 수 있습니다.
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: 학생 수행평가 관리 테이블 (요구사항 1 & 2) */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base md:text-lg">
                  학생 수행평가 응시 현황 및 2차 채점 관리 테이블
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  이름, 학년, 반, 번호별 검색 및 필터링이 가능하며, AI 1차 자동 채점 결과를 검토하고 최종 점수를 확정합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span>표시 학생:</span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-extrabold">
                총 {students.length}명 중 {filteredStudents.length}명
              </span>
            </div>
          </div>

          {/* Filtering & Search Bar (이름, 학년, 반, 번호, 상태별 검색 지원) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Class Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">학급(반) 선택</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">전체 반 (1~3반)</option>
                <option value="1">3학년 1반</option>
                <option value="2">3학년 2반</option>
                <option value="3">3학년 3반</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">채점 및 평가 상태</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">전체 상태</option>
                <option value="CONFIRMED">교사 2차 확정 완료</option>
                <option value="PENDING">AI 완료 (교사 확정 대기)</option>
                <option value="NOT_SUBMITTED">미응시 (미제출)</option>
              </select>
            </div>

            {/* Student Number Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">번호 검색</label>
              <input
                type="number"
                value={filterStudentNum}
                onChange={(e) => setFilterStudentNum(e.target.value)}
                placeholder="예: 1, 2, 3..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Name Search */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600">학생 이름 실시간 검색</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="학생 이름 입력 (예: 김민수, 박지민...)"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">학년</th>
                  <th className="py-3.5 px-3">반</th>
                  <th className="py-3.5 px-3">번호</th>
                  <th className="py-3.5 px-4">이름</th>
                  <th className="py-3.5 px-4">응시 상태</th>
                  <th className="py-3.5 px-4 text-center">AI 1차 점수</th>
                  <th className="py-3.5 px-4 text-center">교사 2차 확정 점수</th>
                  <th className="py-3.5 px-4 text-center">평가 상태</th>
                  <th className="py-3.5 px-4 text-right">채점 및 조정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400 font-bold">
                      검색 조건에 일치하는 학생이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">{student.grade}학년</td>
                      <td className="py-3.5 px-3 font-bold">{student.classNum}반</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-500">{student.studentNum}번</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-950">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4">
                        {student.submitted ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold">
                            제출 완료 ({student.submittedAt})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[11px] font-bold">
                            미제출
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-slate-800">
                        {student.submitted ? (
                          <span className="text-sm">{student.aiScore}점</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black">
                        {student.isConfirmed ? (
                          <span className="text-sm text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                            {student.teacherScore}점
                          </span>
                        ) : student.submitted ? (
                          <span className="text-xs text-amber-600 font-bold">대기 중</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {student.isConfirmed ? (
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            최종 확정
                          </span>
                        ) : student.submitted ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            AI 1차 완료
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold">
                            미응시
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {student.submitted ? (
                          <button
                            onClick={() => handleOpenReviewModal(student)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                            <span>{student.isConfirmed ? "점수 재조정" : "2차 채점/확정"}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Step 4: 2차 평가 상세 모달 (AI 1차 채점 -> 교사 2차 점수 조정 및 확정) */}
      <AnimatePresence>
        {selectedStudentForReview && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-black">
                      2차 평가자 점수 조정
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {selectedStudentForReview.grade}학년 {selectedStudentForReview.classNum}반 {selectedStudentForReview.studentNum}번
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedStudentForReview.name} 학생 수행평가 채점 및 확정
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudentForReview(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* AI 1st Evaluation Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI 1차 자동 채점 결과
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">
                    AI 점수: {selectedStudentForReview.aiScore}점 / 100점
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                  {selectedStudentForReview.aiSummary}
                </p>
              </div>

              {/* Detailed Question Answers & AI Check */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700">문항별 학생 답안 및 AI 세부 판정</h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedStudentForReview.answers.map((ans) => (
                    <div key={ans.qNum} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{ans.qNum}번. {ans.title}</span>
                        <span className="font-mono text-indigo-600 font-black">
                          {ans.pointsEarned} / {ans.maxPoints}점
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-3">
                        <span><strong>학생 답안:</strong> {ans.studentAnswer}</span>
                        <span><strong>정답:</strong> {ans.correctAnswer}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-150">
                        <strong>AI 판정:</strong> {ans.aiAssessment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher 2nd Adjustment Controls */}
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-indigo-600" />
                      선생님 최종 점수 조정 (2차 평가자)
                    </h4>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      AI 1차 채점 점수를 확인한 후, 풀이과정 및 성취도를 고려하여 점수를 확정해주세요.
                    </p>
                  </div>

                  {/* Score Stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTempTeacherScore(prev => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-indigo-200 font-black text-slate-800 hover:bg-indigo-100 cursor-pointer flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tempTeacherScore}
                      onChange={(e) => setTempTeacherScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-16 text-center font-mono font-black text-lg bg-white border border-indigo-300 rounded-xl py-1 text-indigo-900 focus:outline-none"
                    />
                    <button
                      onClick={() => setTempTeacherScore(prev => Math.min(100, prev + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-indigo-200 font-black text-slate-800 hover:bg-indigo-100 cursor-pointer flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-xs font-bold text-indigo-900">점</span>
                  </div>
                </div>

                {/* Teacher Feedback textarea */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-indigo-950">
                    교사 평가 의견 / 점수 조정 사유 (선택)
                  </label>
                  <textarea
                    value={tempFeedback}
                    onChange={(e) => setTempFeedback(e.target.value)}
                    placeholder="예: 서술형 단계별 유도 공식이 논리적이므로 부분점수 4점 상향 조정함."
                    rows={2}
                    className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedStudentForReview(null)}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveTeacherEvaluation}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>최종 점수 확정 및 저장</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
