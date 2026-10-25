"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, Sparkles, Key, CheckCircle2, Clock, 
  AlertTriangle, Users, Filter, Search, RotateCcw, 
  Edit3, ShieldCheck, ArrowRight, BookOpen, 
  ChevronRight, Award, FileCheck2, XCircle, HelpCircle,
  Swords, Zap, LogIn, QrCode, Monitor, Maximize2
} from "lucide-react";
import EduHeader from "./EduHeader";
import { makeSampleHandwritingImage, SAMPLE_SOLUTION_IMAGE } from "./HandwritingSolution";

// Purity compliant random PIN generator
function generateRandomTeacherPin(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `MTH-${randomDigits}`;
}

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
  // AI 감점 집중 검수 필드
  deductionCriteria?: string;   // 감점 기준 (예: [성취기준] 완전제곱식 전개 누락)
  errorLine?: string;           // 오류가 있는 답안 줄 (예: 답안 2행: (x-3)^2 전개식 생략)
  aiReviewOpinion?: string;     // AI 검토 의견
  isAmbiguous?: boolean;        // 풀이 비약 등 모호한 답안 여부
  // 손글씨 풀이 제출 (필기 원본 이미지 + 디지털 변환 텍스트는 studentAnswer)
  handwritingImage?: string;    // 학생 필기 원본 이미지 (data URL)
  confirmedAt?: string;         // 학생 최종 제출(확정) 시각
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
  // 예외 확인 플래그 (풀이 비약 등 모호한 답안 교사 직접 확인 요망)
  isNeedsReview?: boolean;
  reviewReason?: string;
}

// 교사용 기본 출제 프롬프트 및 채점 기준 템플릿
export const DEFAULT_TEACHER_PROMPT_TEMPLATE = `[출제 목적] 2022 개정 교육과정 성취기준 연계 중3 수학 형성평가
[문항 구성] 객관식 2문항, 서술형 풀이 1문항
[세부 지침] 서술형 문항은 단계별 풀이 과정을 유도하고, 학생이 자주 범하는 부호 실수 및 조건 누락 요소를 포함할 것.`;

export const DEFAULT_RUBRIC_TEMPLATE = `[1번 30점] 제곱근 정의 및 부호 판단 일치 여부
[2번 35점] 근호 사칙연산 단순화 정확성 (부호 오류 시 15점 감점)
[3번 35점] 완전제곱식 전개 과정 20점, 최종 중근 명시 15점 (풀이 비약 시 교사 확인 플래그 지정)`;


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
export const DEFAULT_MATH_QUESTIONS: GeneratedMathQuestion[] = [
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
export const INITIAL_STUDENTS: StudentAssessmentRow[] = [
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
    isNeedsReview: false,
    aiSummary: "객관식 2문항 만점(+65점). 3번 서술형 완전제곱식 유도 과정 논리적 완결성 우수(+30/35점).",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음 (정답 일치)",
        errorLine: "오류 없음",
        aiReviewOpinion: "제곱근의 양의 값 정의를 정확히 이해하고 올바른 값을 도출함."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "정답 (2√8 단순화 정확함)",
        deductionCriteria: "감점 기준 없음 (동류항 계산 완벽)",
        errorLine: "오류 없음",
        aiReviewOpinion: "2√8 = 4√2 변형 및 동류항 덧셈·뺄셈 과정이 완전하게 성립함."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "(x - 3)² = 0 | x = 3", 
        handwritingImage: SAMPLE_SOLUTION_IMAGE,
        confirmedAt: "10:41:52",
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 30, 
        maxPoints: 35, 
        aiAssessment: "부분점수 부여: 중근 도출은 완벽하나 계수 관계 설명 1줄 누락",
        deductionCriteria: "완전제곱식 계수 관계(b/2)² = c 유도 서술 누락 (-5점)",
        errorLine: "답안 1행: 인수분해 공식 성립 이유 설명 생략",
        aiReviewOpinion: "완전제곱식 변형과 중근 표기는 완벽하나 일차항 계수와의 관계 서술이 누락되어 5점 감점 산출."
      }
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
    aiScore: 90,
    teacherScore: null,
    isConfirmed: false,
    isNeedsReview: false,
    aiSummary: "1, 2, 4번 문항 기준 충족(+75점). 3번 서술형 답안 3행에서 분수 약분 분배법칙 오류(-10점) 감지. 부분점수 15점 부여 제안.",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 25, 
        maxPoints: 25, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음 (정답 일치)",
        errorLine: "오류 없음",
        aiReviewOpinion: "올바른 정답 선택."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 25, 
        maxPoints: 25, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음 (정답 일치)",
        errorLine: "오류 없음",
        aiReviewOpinion: "올바른 정답 도출."
      },
      { 
        qNum: 3, 
        title: "이차방정식 근의 공식 서술형", 
        studentAnswer: "1행: a=1, b=-6, c=5를 근의 공식에 대입 | 2행: x = (6 ± √(36 - 20)) / 2 = (6 ± √16) / 2 | 3행: x = (6 ± 4) / 2 이므로 약분하여 x = 3 ± 4 | 4행: 따라서 해는 x = 7 또는 x = -1", 
        correctAnswer: "x = (6 ± 4) / 2 이므로 분자 전체를 2로 나누면 x = 3 ± 2. 따라서 x = 5 또는 x = 1", 
        handwritingImage: makeSampleHandwritingImage("1행: a=1, b=-6, c=5를 근의 공식에 대입 | 2행: x = (6 ± √(36 - 20)) / 2 = (6 ± √16) / 2 | 3행: x = (6 ± 4) / 2 이므로 약분하여 x = 3 ± 4 | 4행: 따라서 해는 x = 7 또는 x = -1"),
        confirmedAt: "10:42:18",
        pointsEarned: 15, 
        maxPoints: 25, 
        aiAssessment: "부분점수: 공식 대입은 정확하나 분수 약분 분배법칙 누락으로 감점",
        deductionCriteria: "다항식 분수 약분 원칙 미준수 (분자 전체 분배 약분 누락, -10점)",
        errorLine: "답안 3행: '(6 ± 4) / 2'에서 분모 2를 앞 항(6)에만 나누어 '3 ± 4'로 전개한 오류 발생",
        aiReviewOpinion: "근의 공식 계수 대입(1~2행) 및 판별식 계산(√16)은 정확하게 수행하여 수학적 개념을 올바르게 숙지하고 있습니다. 그러나 3행의 분수 약분 과정에서 분모 2를 분자 전체에 분배하지 않고 앞 항(6)만 약분하여 최종 근이 오답으로 도출되었습니다. 공식 대입 및 전개 배점(15점)은 인정하고, 분수 약분 오류(-10점)를 감점하여 부분점수 15점 부여를 제안합니다."
      },
      {
        qNum: 4,
        title: "이차방정식 실생활 활용 서술형",
        studentAnswer: "식: x(x+2)=24, x²+2x-24=0, (x+6)(x-4)=0. x>0이므로 가로 길이는 4m",
        handwritingImage: makeSampleHandwritingImage("식: x(x+2)=24, x²+2x-24=0, (x+6)(x-4)=0. x>0이므로 가로 길이는 4m"),
        confirmedAt: "10:42:18",
        correctAnswer: "가로 길이: 4m (길이 조건 x>0)",
        pointsEarned: 25,
        maxPoints: 25,
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음 (충족)",
        errorLine: "오류 없음",
        aiReviewOpinion: "미지수 설정, 방정식 수립, 음수 근 제외 조건 서술이 모두 완벽함."
      }
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
    isNeedsReview: false,
    aiSummary: "객관식 2문항 정답(+65점). 서술형 풀이에서 중근 표기 누락(-22점). 교사가 풀이 성의 감안 82점으로 상향 확정.",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답 판정."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답 판정."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "x=3", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 13, 
        maxPoints: 35, 
        aiAssessment: "부분점수: 중근 명시 누락 및 전개식 생략으로 13점 부여",
        deductionCriteria: "중근(Multiple Root) 표기 누락(-15점) 및 인수분해 과정 생략(-7점)",
        errorLine: "답안 1행: 'x=3' 단독 기재 (중근 괄호 및 유도식 없음)",
        aiReviewOpinion: "정답 수치 3은 맞았으나 중근 표기가 생략되었고 완전제곱식 전개 과정이 작성되지 않아 부분점수 13점 산출."
      }
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
    isNeedsReview: false,
    aiSummary: "전 문항 정답 및 서술형 풀이과정 모범답안 수준(+100점).",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "x² - 6x + 9 = (x - 3)² = 0 이므로 x = 3 (중근)", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음 (충족)",
        errorLine: "오류 없음",
        aiReviewOpinion: "완전제곱식의 도출 과정과 중근 표시가 모두 포함된 모범 답안."
      }
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
    isNeedsReview: true,
    reviewReason: "3번 서술형 풀이 비약 감지: AI 단독 판정 모호 (교사 직접 확인 필요)",
    aiSummary: "1번 정답(+30점), 2번 정답(+35점). 3번 서술형 수식 전개에서 풀이 비약 감지(+23/35점). 교사 직접 검수 요망.",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답 일치."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답 일치."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "(x-3)(x-3)=0, x=3", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 23, 
        maxPoints: 35, 
        aiAssessment: "중근 표기 생략 및 완전제곱식 유도 비약 감점",
        deductionCriteria: "완전제곱식 표준 꼴 (x-a)² 미작성(-7점) 및 중근 명시 누락(-5점)",
        errorLine: "답안 1행: (x-3)(x-3)=0에서 (x-3)² 변형 생략 및 중근 누락",
        aiReviewOpinion: "인수분해를 (x-3)(x-3)으로 표현한 후 바로 x=3으로 비약함. 완전제곱식 개념을 인지한 것인지 단순 나열인지 모호하므로 교사의 직접 감점 폭 결정이 필요합니다.",
        isAmbiguous: true
      }
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
    isNeedsReview: false,
    aiSummary: "모든 문항 안정적 해결, 계산 속도 우수(+92점).",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "(x-3)² = 0, x=3 (중근)", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 27, 
        maxPoints: 35, 
        aiAssessment: "우수 (세부 유도 과정 1줄 생략)",
        deductionCriteria: "일차항 계수의 반의 제곱 관계식 서술 생략 (-8점)",
        errorLine: "답안 1행: 유도 근거 문장 누락",
        aiReviewOpinion: "완전제곱식 표현과 중근 명시는 완벽하나 전개 공식 연계 문장이 축약되어 27점 산출."
      }
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
    isNeedsReview: false,
    aiSummary: "1번 정답(+30점), 2번 계산 오류(+15/35점), 3번 서술형 부분점수(+30/35점).",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "8√2", 
        correctAnswer: "4√2", 
        pointsEarned: 15, 
        maxPoints: 35, 
        aiAssessment: "2√8 덧셈 기호 오인",
        deductionCriteria: "연산 부호 실수 (-20점)",
        errorLine: "답안 1행: 3√2 + 5√2 = 8√2 후 2√8을 빼지 않고 누락",
        aiReviewOpinion: "앞부분 덧셈만 완료하고 뒤의 뺄셈 항을 정상 처리하지 못함."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "(x-3)²=0 => x=3", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 30, 
        maxPoints: 35, 
        aiAssessment: "양호 (중근 표기 생략)",
        deductionCriteria: "중근 표기 생략 (-5점)",
        errorLine: "답안 1행: x=3 뒤 (중근) 표시 누락",
        aiReviewOpinion: "완전제곱식 유도는 정확하나 중근 표기를 생략하여 5점 감점."
      }
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
    isNeedsReview: false,
    aiSummary: "안정적인 풀이와 정확한 중근 도출(+85점).",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "x=3 (중근)", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 20, 
        maxPoints: 35, 
        aiAssessment: "부분점수 (풀이 유도식 생략)",
        deductionCriteria: "완전제곱식 전개 과정 미기재 (-15점)",
        errorLine: "답안 1행: 인수분해 과정 없이 해만 제시",
        aiReviewOpinion: "중근 명시는 완벽하나 서술형 요구사항인 완전제곱식 전개 과정이 누락되어 15점 감점."
      }
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
    isNeedsReview: false,
    aiSummary: "수행평가 만점. 서술형 풀이 논리 전개 완벽(+100점).",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "모범 답안."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "4√2", 
        correctAnswer: "4√2", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "모범 답안."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "x² - 6x + 9 = (x - 3)² = 0, x = 3(중근)", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 35, 
        maxPoints: 35, 
        aiAssessment: "만점",
        deductionCriteria: "감점 기준 없음 (충족)",
        errorLine: "오류 없음",
        aiReviewOpinion: "논리적 비약 없이 모든 수식이 완결된 최고 수준의 서술."
      }
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
    isNeedsReview: true,
    reviewReason: "2번 오답 원인 및 3번 식 미완성: 교사 확인 필요",
    aiSummary: "1번 정답(+30점), 2번 오답(+10/35점), 3번 서술형 식 미완성(+28/35점). 2차 검토 필요.",
    answers: [
      { 
        qNum: 1, 
        title: "제곱근 계산", 
        studentAnswer: "5", 
        correctAnswer: "5", 
        pointsEarned: 30, 
        maxPoints: 30, 
        aiAssessment: "정답",
        deductionCriteria: "감점 기준 없음",
        errorLine: "오류 없음",
        aiReviewOpinion: "정답 일치."
      },
      { 
        qNum: 2, 
        title: "근호 사칙연산", 
        studentAnswer: "2√2", 
        correctAnswer: "4√2", 
        pointsEarned: 10, 
        maxPoints: 35, 
        aiAssessment: "감점 (단순화 계산 착오)",
        deductionCriteria: "근호 안 소인수분해 계산 착오 (-25점)",
        errorLine: "답안 1행: 2√8을 6√2로 잘못 단순화",
        aiReviewOpinion: "근호 밖으로 빼는 소인수분해 연산 오류."
      },
      { 
        qNum: 3, 
        title: "이차식 서술형", 
        studentAnswer: "x=3", 
        correctAnswer: "x=3 (중근)", 
        pointsEarned: 28, 
        maxPoints: 35, 
        aiAssessment: "부분점수 (중근 표기 생략)",
        deductionCriteria: "중근 표기 누락 (-7점)",
        errorLine: "답안 1행: x=3 단독 표기",
        aiReviewOpinion: "중근 표현 누락으로 7점 감점 처리.",
        isAmbiguous: true
      }
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
    isNeedsReview: false,
    aiSummary: "수행평가 미응시 (시험 미제출 상태).",
    answers: []
  }
];

export interface TeacherDashboardProps {
  onStartAssessmentMatch: (isStrict: boolean) => void;
  onExit: () => void;
  roomCode?: string;
  setRoomCode?: (code: string) => void;
  codeStatus?: "READY" | "IN_PROGRESS" | "EXPIRED";
  setCodeStatus?: (status: "READY" | "IN_PROGRESS" | "EXPIRED") => void;
  students?: StudentAssessmentRow[];
  setStudents?: React.Dispatch<React.SetStateAction<StudentAssessmentRow[]>>;
  questions?: GeneratedMathQuestion[];
  setQuestions?: React.Dispatch<React.SetStateAction<GeneratedMathQuestion[]>>;
  isQuestionsConfirmed?: boolean;
  setIsQuestionsConfirmed?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TeacherDashboard({ 
  onStartAssessmentMatch, 
  onExit,
  roomCode: propRoomCode,
  setRoomCode: propSetRoomCode,
  codeStatus: propCodeStatus,
  setCodeStatus: propSetCodeStatus,
  students: propStudents,
  setStudents: propSetStudents,
  questions: propQuestions,
  setQuestions: propSetQuestions,
  isQuestionsConfirmed: propIsQuestionsConfirmed,
  setIsQuestionsConfirmed: propSetIsQuestionsConfirmed
}: TeacherDashboardProps) {
  const router = useRouter();
  // Shared state with local fallback
  const [internalQuestions, setInternalQuestions] = useState<GeneratedMathQuestion[]>(DEFAULT_MATH_QUESTIONS);
  const questions = propQuestions ?? internalQuestions;
  const setQuestions = propSetQuestions ?? setInternalQuestions;

  const [internalIsQuestionsConfirmed, setInternalIsQuestionsConfirmed] = useState<boolean>(true);
  const isQuestionsConfirmed = propIsQuestionsConfirmed ?? internalIsQuestionsConfirmed;
  const setIsQuestionsConfirmed = propSetIsQuestionsConfirmed ?? setInternalIsQuestionsConfirmed;

  const [internalRoomCode, setInternalRoomCode] = useState<string>("MTH-7429");
  const roomCode = propRoomCode ?? internalRoomCode;
  const setRoomCode = propSetRoomCode ?? setInternalRoomCode;

  const [internalCodeStatus, setInternalCodeStatus] = useState<"READY" | "IN_PROGRESS" | "EXPIRED">("IN_PROGRESS");
  const codeStatus = propCodeStatus ?? internalCodeStatus;
  const setCodeStatus = propSetCodeStatus ?? setInternalCodeStatus;

  const [internalStudents, setInternalStudents] = useState<StudentAssessmentRow[]>(INITIAL_STUDENTS);
  const students = propStudents ?? internalStudents;
  const setStudents = propSetStudents ?? setInternalStudents;

  // --- Step 1: AI Math Question Generator State ---
  const [selectedChapterId, setSelectedChapterId] = useState<string>("ch1");
  const [pageRange, setPageRange] = useState<string>("p.10 ~ p.25");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<"하" | "중" | "상">("중");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // 선생님 AI 직접 요구 프롬프트 및 AI 1차 채점 평가요소 상태
  const [teacherAiPrompt, setTeacherAiPrompt] = useState<string>(DEFAULT_TEACHER_PROMPT_TEMPLATE);
  const [assessmentRubricCriteria, setAssessmentRubricCriteria] = useState<string>(DEFAULT_RUBRIC_TEMPLATE);

  const handleResetPromptTemplate = () => {
    setTeacherAiPrompt(DEFAULT_TEACHER_PROMPT_TEMPLATE);
    setAssessmentRubricCriteria(DEFAULT_RUBRIC_TEMPLATE);
    showToast("🔄 출제 프롬프트와 채점 기준이 기본 표준 템플릿으로 복원되었습니다.");
  };


  // --- Step 2: One-time Code (PIN) State & Projector View ---
  const [submittedCount, setSubmittedCount] = useState<number>(10);
  const [totalStudentsCount] = useState<number>(11);
  const [showProjectorModal, setShowProjectorModal] = useState<boolean>(false);

  // --- Step 3: Student Performance Assessment Table & Filters ---
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStudentNum, setFilterStudentNum] = useState<string>("");

  // --- Step 4: Teacher 2nd Evaluation Modal State ---
  const [selectedStudentForReview, setSelectedStudentForReview] = useState<StudentAssessmentRow | null>(null);
  const [tempAnswers, setTempAnswers] = useState<QuestionAnswerDetail[]>([]);
  const [tempTeacherScore, setTempTeacherScore] = useState<number>(85);
  const [tempFeedback, setTempFeedback] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Step 4: 감점(오답) 문항만 보기 필터 (기본: 감점 문항만 상단 필터링)
  const [showOnlyDeductions, setShowOnlyDeductions] = useState<boolean>(false);

  // Step 4: AI 감점 검수 적용 여부 (문항별 토글 상태 - 기본값: 전체 적용)
  const [appliedAiQuestions, setAppliedAiQuestions] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true
  });

  // --- Step 1 Inline Question Edit State ---
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    question: string;
    type: "객관식" | "서술형 풀이";
    options: string[];
    correctAnswer: string;
    solution: string;
    points: number;
    difficulty: "하" | "중" | "상";
  } | null>(null);

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
          question: `[서술형] ${chapter.name}의 성취기준(${chapter.code})에 기반하여 문제의 풀이과정과 답을 단계별로 서술하시오.${teacherAiPrompt.trim() ? ` (선생님 요청: ${teacherAiPrompt.trim()})` : ""}`,
          type: "서술형 풀이",
          correctAnswer: "단계별 풀이 및 최종값 유도",
          solution: assessmentRubricCriteria.trim() 
            ? `교사 입력 채점 기준표 반영: ${assessmentRubricCriteria.trim()}`
            : "조건에 맞춘 식 수립(15점) + 계산 과정의 정확성(10점) + 최종 해 도출(10점)",
          points: 35,
          difficulty: difficulty,
          standardCode: chapter.code
        }
      ];
      setQuestions(newQuests.slice(0, questionCount));
      setIsQuestionsConfirmed(false);
      setEditingQuestionId(null);
      setEditFormData(null);
      showToast("✨ AI가 수학 수행평가 문항을 자동 출제했습니다! 문항을 확인하고 확정해주세요.");
    }, 1200);
  };

  const handleConfirmQuestions = () => {
    setIsQuestionsConfirmed(true);
    setEditingQuestionId(null);
    setEditFormData(null);
    showToast("✅ 수학 수행평가 문항이 최종 확정되었습니다! 이제 일회성 코드를 발급할 수 있습니다.");
  };

  // Inline Question Edit Handlers
  const handleStartEditQuestion = (q: GeneratedMathQuestion) => {
    setEditingQuestionId(q.id);
    setEditFormData({
      question: q.question,
      type: q.type,
      options: q.options ? [...q.options] : ["", "", "", ""],
      correctAnswer: q.correctAnswer,
      solution: q.solution,
      points: q.points,
      difficulty: q.difficulty
    });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditFormData(null);
  };

  const handleSaveEditQuestion = (qId: number) => {
    if (!editFormData) return;
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          question: editFormData.question.trim() || q.question,
          type: editFormData.type,
          options: editFormData.type === "객관식" ? editFormData.options : undefined,
          correctAnswer: editFormData.correctAnswer.trim() || q.correctAnswer,
          solution: editFormData.solution.trim() || q.solution,
          points: Number(editFormData.points) || q.points,
          difficulty: editFormData.difficulty
        };
      }
      return q;
    }));
    setIsQuestionsConfirmed(false);
    setEditingQuestionId(null);
    setEditFormData(null);
    showToast(`✏️ ${qId}번 문항이 성공적으로 수정되었습니다! 내용 확인 후 최종 확정해주세요.`);
  };

  // Generate New One-time Code
  const handleGenerateNewCode = () => {
    const newCode = generateRandomTeacherPin();
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
      if (filterStatus === "NEEDS_REVIEW" && (!student.isNeedsReview || student.isConfirmed)) return false;
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
    const initialAnswers = student.answers.map(a => ({ ...a }));
    setTempAnswers(initialAnswers);
    const calculatedTotal = initialAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
    setTempTeacherScore(student.teacherScore ?? calculatedTotal);
    setTempFeedback(student.teacherFeedback ?? "");
    // 모달 오픈 시 필터 초기화 및 모든 문항 AI 검수 기본 활성화
    setShowOnlyDeductions(false);
    setAppliedAiQuestions({
      1: true,
      2: true,
      3: true,
      4: true
    });
  };

  // 개별 문항 AI 감점 검수 적용/미적용 토글
  const handleToggleAiForQuestion = (qNum: number) => {
    setAppliedAiQuestions(prev => {
      const willApply = !prev[qNum];
      const nextState = { ...prev, [qNum]: willApply };

      setTempAnswers(ansList => {
        const updated = ansList.map(ans => {
          if (ans.qNum === qNum) {
            if (!willApply) {
              // 미적용(Uncheck) 시 감점 배제하고 해당 문항 만점으로 복원
              return { ...ans, pointsEarned: ans.maxPoints };
            } else {
              // 적용(Check) 시 원래 학생 점수로 환원
              const originalAns = selectedStudentForReview?.answers.find(a => a.qNum === qNum);
              return { ...ans, pointsEarned: originalAns ? originalAns.pointsEarned : ans.pointsEarned };
            }
          }
          return ans;
        });
        const newTotal = updated.reduce((sum, a) => sum + a.pointsEarned, 0);
        setTempTeacherScore(newTotal);
        return updated;
      });

      if (!willApply) {
        setTempFeedback(fb => {
          const note = `[${qNum}번 문항: 교사 판단으로 AI 감점 미적용 (원안 인정)]`;
          if (fb.includes(note)) return fb;
          return fb ? `${fb}\n${note}` : note;
        });
        showToast(`💡 ${qNum}번 문항: AI 감점을 미적용하고 만점으로 복원했습니다.`);
      } else {
        showToast(`🔄 ${qNum}번 문항: AI 감점 검수를 다시 적용했습니다.`);
      }

      return nextState;
    });
  };

  // 전체 문항 AI 감점 검수 일괄 토글 (마스터 스위치)
  const handleToggleAllAi = () => {
    const anyOn = Object.values(appliedAiQuestions).some(v => v);
    const targetState = !anyOn;

    const nextState: Record<number, boolean> = {
      1: targetState,
      2: targetState,
      3: targetState,
      4: targetState
    };
    setAppliedAiQuestions(nextState);

    setTempAnswers(ansList => {
      const updated = ansList.map(ans => {
        if (!targetState) {
          return { ...ans, pointsEarned: ans.maxPoints };
        } else {
          const originalAns = selectedStudentForReview?.answers.find(a => a.qNum === ans.qNum);
          return { ...ans, pointsEarned: originalAns ? originalAns.pointsEarned : ans.pointsEarned };
        }
      });
      const newTotal = updated.reduce((sum, a) => sum + a.pointsEarned, 0);
      setTempTeacherScore(newTotal);
      return updated;
    });

    if (!targetState) {
      setTempFeedback(fb => {
        const note = "[전체 문항: 교사 전권으로 AI 감점 일괄 미적용 (원안 인정)]";
        return fb.includes(note) ? fb : (fb ? `${fb}\n${note}` : note);
      });
      showToast("💡 전체 문항에 AI 감점을 미적용하고 만점으로 일괄 복원했습니다.");
    } else {
      showToast("🔄 전체 문항에 AI 감점 검수를 다시 일괄 적용했습니다.");
    }
  };

  // Step 4: Per-Question Score Adjustment with Real-time Total Sum (Requirement 1 - Option 2)
  const handleUpdateQuestionScore = (qNum: number, delta: number) => {
    setTempAnswers(prev => {
      const next = prev.map(ans => {
        if (ans.qNum === qNum) {
          const newPoints = Math.min(ans.maxPoints, Math.max(0, ans.pointsEarned + delta));
          return { ...ans, pointsEarned: newPoints };
        }
        return ans;
      });
      const newTotal = next.reduce((sum, a) => sum + a.pointsEarned, 0);
      setTempTeacherScore(newTotal);
      return next;
    });
  };

  const handleSetQuestionScoreDirect = (qNum: number, valueStr: string) => {
    const val = parseInt(valueStr) || 0;
    setTempAnswers(prev => {
      const next = prev.map(ans => {
        if (ans.qNum === qNum) {
          const newPoints = Math.min(ans.maxPoints, Math.max(0, val));
          return { ...ans, pointsEarned: newPoints };
        }
        return ans;
      });
      const newTotal = next.reduce((sum, a) => sum + a.pointsEarned, 0);
      setTempTeacherScore(newTotal);
      return next;
    });
  };

  // Confirm Teacher 2nd Evaluation Score
  const handleSaveTeacherEvaluation = () => {
    if (!selectedStudentForReview) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentForReview.id) {
        return {
          ...s,
          answers: tempAnswers,
          teacherScore: tempTeacherScore,
          isConfirmed: true,
          isNeedsReview: false,
          teacherFeedback: tempFeedback.trim() || undefined
        };
      }
      return s;
    }));

    showToast(`🎯 [${selectedStudentForReview.name}] 학생의 문항별 재조정 평가(총점 ${tempTeacherScore}점)가 최종 확정되었습니다.`);
    setSelectedStudentForReview(null);
  };

  // Calculated Stats
  const confirmedCount = students.filter(s => s.isConfirmed).length;
  const pendingCount = students.filter(s => s.submitted && !s.isConfirmed).length;
  const needsReviewCount = students.filter(s => s.isNeedsReview && !s.isConfirmed).length;
  const averageScore = Math.round(
    students.filter(s => s.submitted).reduce((acc, cur) => acc + (cur.teacherScore ?? cur.aiScore), 0) /
    (students.filter(s => s.submitted).length || 1)
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-between">
      
      {/* 배틀스터디 에듀 전용 상단 헤더 (다이렉트 시연 내비게이션 포함) */}
      <EduHeader activeTab="TEACHER" schoolName="청계중학교" />

      <div className="flex-1 bg-slate-100 text-slate-900 p-4 md:p-8 flex flex-col justify-between">
      
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

            {/* 1) AI 출제 직접 요구 프롬프트 입력창 (출제 의도 맞춤 프롬프트 수정 기능) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  <span>출제 의도 맞춤 프롬프트 수정</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPromptTemplate}
                    className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                    title="기본 템플릿으로 원복"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>기본 템플릿 복원</span>
                  </button>
                  <span className="text-[10px] text-indigo-600 font-bold">선생님 직접 수정 가능</span>
                </div>
              </div>
              <textarea
                value={teacherAiPrompt}
                onChange={(e) => setTeacherAiPrompt(e.target.value)}
                rows={3}
                placeholder="출제 목적, 문항 구성, 서술형 세부 지침 등 선생님의 출제 의도에 맞게 프롬프트를 자유롭게 수정하세요."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium resize-none shadow-inner leading-relaxed"
              />
              {/* 추천 프롬프트 태그 칩 */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold">빠른 추가 태그:</span>
                {[
                  "실생활 활용 연계",
                  "자주 틀리는 함정 보기 포함",
                  "단계별 풀이 유도",
                  "계산 과정 부분점수 배점"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTeacherAiPrompt(prev => prev ? `${prev}\n[조건] ${tag}` : `[조건] ${tag}`)}
                    className="px-2 py-0.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-md text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 2) 교사 직접 설정: 1차 자동 채점 기준표 (감점 기준표) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>교사 직접 설정 채점 기준 (루브릭 및 감점 기준)</span>
                </label>
                <span className="text-[10px] text-emerald-600 font-bold">감점 항목 기준표</span>
              </div>
              <textarea
                value={assessmentRubricCriteria}
                onChange={(e) => setAssessmentRubricCriteria(e.target.value)}
                rows={3}
                placeholder="각 문항별 배점, 필수 포함 공식, 감점 폭(예: 부호 오류 -15점, 중근 누락 -15점 등)을 직접 설정하세요."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium resize-none shadow-inner leading-relaxed"
              />
              <p className="text-[10px] text-slate-500 leading-tight">
                * 위 기준에 따라 AI가 학생 답안 제출 시 감점 기준, 오류 줄, AI 검토 의견을 산출합니다.
              </p>
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
                    <span>수행평가 문항 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>수행평가 문항 자동 출제 및 생성</span>
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

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isEditingThis = editingQuestionId === q.id;

                  if (isEditingThis && editFormData) {
                    return (
                      <div key={q.id} className="p-4 bg-indigo-50/70 border-2 border-indigo-400 rounded-2xl space-y-3 shadow-md">
                        <div className="flex items-center justify-between gap-2 border-b border-indigo-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-700 text-white text-[10px] font-black">
                              {idx + 1}번 문항 직접 수정 중
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700">인라인 편집 모드</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEditQuestion}
                              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditQuestion(q.id)}
                              className="px-3 py-1 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>수정 완료</span>
                            </button>
                          </div>
                        </div>

                        {/* Type, Points, Difficulty Edit */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">문항 유형</label>
                            <select
                              value={editFormData.type}
                              onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as "객관식" | "서술형 풀이" })}
                              className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800"
                            >
                              <option value="객관식">객관식</option>
                              <option value="서술형 풀이">서술형 풀이</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">배점 (점수)</label>
                            <input
                              type="number"
                              min={5}
                              max={100}
                              value={editFormData.points}
                              onChange={(e) => setEditFormData({ ...editFormData, points: parseInt(e.target.value) || 0 })}
                              className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">난이도</label>
                            <select
                              value={editFormData.difficulty}
                              onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value as "하" | "중" | "상" })}
                              className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800"
                            >
                              <option value="하">하</option>
                              <option value="중">중</option>
                              <option value="상">상</option>
                            </select>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">문제 지문</label>
                          <textarea
                            rows={2}
                            value={editFormData.question}
                            onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                            className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                            placeholder="문제를 입력하세요"
                          />
                        </div>

                        {/* Multiple Choice Options (If applicable) */}
                        {editFormData.type === "객관식" && (
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">보기 옵션 (1~4번)</label>
                            <div className="grid grid-cols-2 gap-2">
                              {editFormData.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                  <span className="text-[10px] font-black text-slate-400">{optIdx + 1}.</span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const nextOpts = [...editFormData.options];
                                      nextOpts[optIdx] = e.target.value;
                                      setEditFormData({ ...editFormData, options: nextOpts });
                                    }}
                                    className="w-full text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
                                    placeholder={`보기 ${optIdx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Correct Answer & Solution */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">정답</label>
                            <input
                              type="text"
                              value={editFormData.correctAnswer}
                              onChange={(e) => setEditFormData({ ...editFormData, correctAnswer: e.target.value })}
                              className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900"
                              placeholder="정답 내용"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">채점 기준 및 해설</label>
                            <input
                              type="text"
                              value={editFormData.solution}
                              onChange={(e) => setEditFormData({ ...editFormData, solution: e.target.value })}
                              className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1.5 text-xs text-slate-700"
                              placeholder="채점 기준 / 모범 해설"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-slate-300 transition-colors">
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400">
                            난이도: {q.difficulty}
                          </span>
                          {/* 3번 요구사항: 문항 옆 펜 버튼으로 인라인 직접 수정 */}
                          <button
                            type="button"
                            onClick={() => handleStartEditQuestion(q)}
                            title="문항 직접 수정"
                            className="p-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2 py-0.5"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-500" />
                            <span>문항 수정</span>
                          </button>
                        </div>
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
                  );
                })}
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

              {/* 🖥️ 빔프로젝터 / 칠판 전체화면 투사 버튼 */}
              <button
                type="button"
                onClick={() => setShowProjectorModal(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-900 to-slate-900 hover:from-indigo-800 hover:to-slate-800 border border-indigo-500/40 text-indigo-200 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>🖥️ 교실 칠판 / 빔프로젝터 전체화면 투사 모드 (대형 QR 포함)</span>
              </button>
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
                  이름, 학년, 반, 번호별 검색 및 필터링이 가능하며, 1차 자동 채점 결과를 검토하고 최종 점수를 확정합니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 text-[11px] font-black">
                확정 {confirmedCount}명
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-[11px] font-black">
                가채점 {pendingCount}명
              </span>
              {needsReviewCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus(filterStatus === "NEEDS_REVIEW" ? "ALL" : "NEEDS_REVIEW")}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                    filterStatus === "NEEDS_REVIEW"
                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                      : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>확인 필요 {needsReviewCount}명</span>
                </button>
              )}
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-extrabold text-[11px]">
                표시: {filteredStudents.length}명
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
                <option value="PENDING">가채점 완료 (교사 확정 대기)</option>
                <option value="NEEDS_REVIEW">교사 확인 필요 (풀이 비약/모호)</option>
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
                  <th className="py-3.5 px-4 text-center">AI 감점 검수 요약</th>
                  <th className="py-3.5 px-4 text-center">선생님 채점 점수</th>
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
                      {/* AI 감점 검수 요약 (가채점 점수 완전 배제) */}
                      <td className="py-3.5 px-4 text-center">
                        {student.isNeedsReview ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-md text-[11px] font-bold inline-flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            풀이 비약 감지
                          </span>
                        ) : student.submitted ? (
                          <span className="text-slate-700 font-medium text-[11px] block truncate max-w-[200px] mx-auto" title={student.aiSummary}>
                            {student.aiSummary.split(".")[0] || "감점 검수 완료"}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      {/* 선생님 채점 점수 (단일 점수 체계) */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {student.isConfirmed ? (
                          <span className="text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 font-black">
                            {student.teacherScore}점
                          </span>
                        ) : student.submitted ? (
                          <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            미채점 (대기)
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      {/* 평가 상태 배지 */}
                      <td className="py-3.5 px-4 text-center">
                        {student.isConfirmed ? (
                          <span className="px-2.5 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            교사 채점 완료
                          </span>
                        ) : student.isNeedsReview ? (
                          <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3 text-white" />
                            교사 확인 필요
                          </span>
                        ) : student.submitted ? (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            검수 완료 (채점 대기)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold">
                            미응시
                          </span>
                        )}
                      </td>
                      {/* 채점 및 조정 버튼 (2차 채점 필요 대상 눈에 띄게 차별화) */}
                      <td className="py-3.5 px-4 text-right">
                        {student.submitted ? (
                          student.isConfirmed ? (
                            <button
                              onClick={() => handleOpenReviewModal(student)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>점수 재조정</span>
                            </button>
                          ) : student.isNeedsReview ? (
                            <button
                              onClick={() => handleOpenReviewModal(student)}
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm ring-2 ring-amber-200 cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                              <span>풀이 확인 및 채점</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReviewModal(student)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm ring-2 ring-indigo-200 cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-indigo-200" />
                              <span>2차 채점하기</span>
                            </button>
                          )
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

      {/* Step 4: 2차 평가 상세 모달 (AI 감점 검수 지원 -> 교사 단일 채점 및 확정) */}
      <AnimatePresence>
        {selectedStudentForReview && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-[1520px] h-[94vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Top Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    AI 감점 검수 지원 · 교사 단일 평가 체계
                  </span>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <span className="text-sm text-slate-500 font-semibold hidden sm:inline">
                    {selectedStudentForReview.grade}학년 {selectedStudentForReview.classNum}반 {selectedStudentForReview.studentNum}번
                  </span>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStudentForReview.name} 학생 답안 검수 및 채점
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudentForReview(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-base cursor-pointer transition-colors"
                  title="닫기"
                >
                  ✕
                </button>
              </div>

              {/* Main Content Area: Left (Questions & AI Analysis) + Right (Grading & Confirmation Panel) */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden min-h-0 bg-slate-50/50">
                
                {/* Left Column (8 cols): Questions & Deduction Inspection */}
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-slate-700" />
                        <span>문항별 학생 답안 및 AI 감점 항목 검수</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        AI가 검수한 미충족 감점 기준과 오류 답안 위치를 대조하여 확인하세요.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500">
                        총 {tempAnswers.length}문항 중{" "}
                        <strong className="text-rose-700">
                          감점 {selectedStudentForReview.answers.filter(a => a.pointsEarned < a.maxPoints).length}문항
                        </strong>
                      </span>
                      <label className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        showOnlyDeductions
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}>
                        <input
                          type="checkbox"
                          checked={showOnlyDeductions}
                          onChange={(e) => setShowOnlyDeductions(e.target.checked)}
                          className="w-3.5 h-3.5 rounded cursor-pointer"
                        />
                        <span>감점 문항만 보기</span>
                      </label>
                    </div>
                  </div>

                  {/* Scrollable Questions List */}
                  <div className="flex-1 overflow-y-auto space-y-4 pt-3.5 pr-2">
                    {showOnlyDeductions && selectedStudentForReview.answers.every(a => a.pointsEarned >= a.maxPoints) && (
                      <div className="text-center text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl py-8">
                        AI가 감지한 감점 문항이 없습니다. 전 문항 기준 충족.
                      </div>
                    )}
                    {[...tempAnswers]
                      .sort((a, b) => {
                        // 감점(오답) 문항을 상단에, 동일 그룹 내에서는 문항 번호순
                        const origA = selectedStudentForReview.answers.find(o => o.qNum === a.qNum);
                        const origB = selectedStudentForReview.answers.find(o => o.qNum === b.qNum);
                        const defA = origA && origA.pointsEarned < origA.maxPoints ? 0 : 1;
                        const defB = origB && origB.pointsEarned < origB.maxPoints ? 0 : 1;
                        return defA - defB || a.qNum - b.qNum;
                      })
                      .filter((ans) => {
                        if (!showOnlyDeductions) return true;
                        const orig = selectedStudentForReview.answers.find(o => o.qNum === ans.qNum);
                        return !!orig && orig.pointsEarned < orig.maxPoints;
                      })
                      .map((ans) => {
                      // 원래 AI 가채점 시 감점이 있었던 문항인지 고정 판별 (체크 해제 후에도 체크박스 영구 유지)
                      const originalAns = selectedStudentForReview?.answers.find(a => a.qNum === ans.qNum);
                      const hasAiDeduction = originalAns ? originalAns.pointsEarned < originalAns.maxPoints : false;
                      const originalDeductionPoints = originalAns ? originalAns.maxPoints - originalAns.pointsEarned : 0;
                      const isAiActive = appliedAiQuestions[ans.qNum] ?? true;
                      const isFullScore = ans.pointsEarned === ans.maxPoints;
                      const deducted = ans.maxPoints - ans.pointsEarned;

                      return (
                        <div 
                          key={ans.qNum}
                          className={`p-4 bg-white border rounded-xl space-y-3 transition-all ${
                            ans.isAmbiguous
                              ? "border-amber-300 ring-2 ring-amber-100"
                              : "border-slate-200"
                          }`}
                        >
                          {/* 문항 헤더 & AI 감점 적용/철회 체크박스 (AI 감점 문항만 고정 노출하여 재체크 가능!) */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
                                {ans.qNum}번
                              </span>
                              <span className="text-sm font-bold text-slate-800">{ans.title}</span>
                              {ans.isAmbiguous && (
                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  풀이 비약 감지
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {/* AI 감점 문항이면 체크박스 영구 노출 (체크 해제 후에도 재체크 가능) */}
                              {!hasAiDeduction ? (
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                  기준 충족 (만점)
                                </span>
                              ) : (
                                <label className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shadow-xs ${
                                  isAiActive
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                                    : "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200"
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isAiActive}
                                    onChange={() => handleToggleAiForQuestion(ans.qNum)}
                                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                                  />
                                  <span>
                                    {isAiActive 
                                      ? `AI 감점 적용 (-${originalDeductionPoints}점 반영)` 
                                      : "AI 감점 철회 (만점 복원됨 - 클릭 시 재적용)"}
                                  </span>
                                </label>
                              )}

                              <span className="text-xs text-slate-500 font-semibold">
                                배점: {ans.maxPoints}점
                              </span>
                            </div>
                          </div>

                          {/* 학생 손글씨 원본 (필기 -> 디지털 변환 텍스트의 근거 자료) */}
                          {ans.handwritingImage && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500">학생 손글씨 원본</span>
                                <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                  학생 변환 결과 확인 완료{ans.confirmedAt ? ` (${ans.confirmedAt} 제출)` : ""}
                                </span>
                              </div>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ans.handwritingImage}
                                alt={`${ans.qNum}번 문항 학생 손글씨 원본`}
                                className="w-full max-w-xl rounded border border-slate-200 bg-white"
                              />
                              <p className="text-[10px] text-slate-500">
                                아래 &apos;학생 제출 답안&apos;은 위 필기를 디지털 텍스트로 변환한 결과이며, 학생이 확인 후 제출했습니다.
                              </p>
                            </div>
                          )}

                          {/* 학생 답안 vs 기준 모범 답안 2열 나란한 비교 (오류 줄 붉은 물결 밑줄 시각화) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500">학생 제출 답안</span>
                                {hasAiDeduction && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    isAiActive 
                                      ? "text-rose-700 bg-rose-50 border-rose-200" 
                                      : "text-amber-800 bg-amber-50 border-amber-200"
                                  }`}>
                                    {isAiActive ? "오류 감지 줄 하이라이트" : "교사 감점 철회 (만점 복원)"}
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-slate-900 bg-white p-2.5 rounded border border-slate-200 break-all leading-relaxed space-y-1">
                                {ans.studentAnswer.includes("|") ? (
                                  ans.studentAnswer.split("|").map((line, idx) => {
                                    const isErrorLine = hasAiDeduction && (line.includes("3행") || line.includes("3 ± 4") || (ans.errorLine && ans.errorLine.includes(line.trim().slice(0, 5))));

                                    return (
                                      <div 
                                        key={idx}
                                        className={`transition-all ${
                                          isErrorLine 
                                            ? isAiActive
                                              ? "bg-rose-50/90 text-rose-950 font-bold px-2 py-1 rounded border border-rose-200 my-0.5"
                                              : "bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 opacity-70"
                                            : "text-slate-800"
                                        }`}
                                      >
                                        <span className={isErrorLine && isAiActive ? "underline decoration-rose-500 decoration-wavy decoration-2" : ""}>
                                          {line.trim()}
                                        </span>
                                        {isErrorLine && (
                                          <span className={`ml-2 inline-block px-1.5 py-0.2 text-[9px] font-bold rounded ${
                                            isAiActive ? "bg-rose-500 text-white" : "bg-slate-400 text-white"
                                          }`}>
                                            {isAiActive ? "AI 감지 오류 줄" : "교사 감점 철회"}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="font-semibold">{ans.studentAnswer}</div>
                                )}
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-500">기준 모범 답안</span>
                              <div className="font-mono text-slate-700 bg-white p-2.5 rounded border border-slate-200 break-all leading-relaxed">
                                {ans.correctAnswer}
                              </div>
                            </div>
                          </div>

                          {/* AI 감점 항목 검수 분석 리포트 */}
                          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                                AI 감점 검수 분석
                              </span>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                !hasAiDeduction
                                  ? "bg-slate-200 text-slate-700" 
                                  : !isAiActive
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {!hasAiDeduction 
                                  ? "기준 전원 충족" 
                                  : !isAiActive
                                  ? "감점 철회 (만점)"
                                  : `감점 폭: -${originalDeductionPoints}점`}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {/* 1. 미충족 표시 (감점 기준) - 정답인 경우 차분한 슬레이트, 감점 시에만 경고색 */}
                              <div className={`p-2.5 rounded border transition-colors ${
                                !(appliedAiQuestions[ans.qNum] ?? true)
                                  ? "bg-slate-50 border-slate-200 opacity-60"
                                  : isFullScore
                                  ? "bg-white border-slate-200"
                                  : "bg-white border-rose-200"
                              }`}>
                                <span className="font-bold text-slate-500 block text-[10px] mb-0.5">
                                  미충족 감점 기준
                                </span>
                                {!(appliedAiQuestions[ans.qNum] ?? true) ? (
                                  <p className="text-slate-600 font-medium">
                                    교사 재량으로 AI 감점 미적용 (원안 인정)
                                  </p>
                                ) : isFullScore ? (
                                  <p className="text-slate-600 font-medium">
                                    감점 항목 없음 (기준 전원 충족)
                                  </p>
                                ) : (
                                  <p className="text-rose-700 font-bold">
                                    {ans.deductionCriteria || "감점 기준 미충족"}
                                  </p>
                                )}
                              </div>

                              {/* 2. 오류가 있는 답안 줄 */}
                              <div className={`p-2.5 rounded border transition-colors ${
                                !(appliedAiQuestions[ans.qNum] ?? true)
                                  ? "bg-slate-50 border-slate-200 opacity-60"
                                  : "bg-white border-slate-200"
                              }`}>
                                <span className="font-bold text-slate-500 block text-[10px] mb-0.5">
                                  오류 답안 위치 및 식
                                </span>
                                <p className={`font-mono text-[11px] break-all ${
                                  isFullScore || !(appliedAiQuestions[ans.qNum] ?? true)
                                    ? "text-slate-500" 
                                    : "text-slate-800 font-semibold"
                                }`}>
                                  {ans.errorLine || "오류 위치 없음"}
                                </p>
                              </div>
                            </div>

                            {/* 3. AI 검토 의견 */}
                            <div className="bg-white p-2.5 rounded border border-slate-200">
                              <span className="font-bold text-slate-500 block text-[10px] mb-0.5">
                                AI 검토 소견
                              </span>
                              <p className="text-slate-700 leading-relaxed font-medium">
                                {ans.aiReviewOpinion || ans.aiAssessment}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column (4 cols): Scoring & Final Confirmation */}
                <div className="lg:col-span-4 flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-y-auto justify-between space-y-4">
                  
                  <div className="space-y-4">
                    {/* [예외 확인 플래그] 풀이 비약 감지 시 안내 배너 */}
                    {selectedStudentForReview.isNeedsReview && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                              교사 확인 필요
                            </span>
                            <span className="text-xs font-bold text-amber-950">
                              {selectedStudentForReview.reviewReason || "풀이 비약 감지"}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900 leading-relaxed">
                            중간 유도식 생략이 감지되었습니다. 최종 배점 및 감점 여부를 선생님께서 직접 결정해주세요.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI 종합 소견 및 일괄 적용 마스터 체크박스 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-slate-600" />
                          AI 감점 검수 적용 설정
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-slate-300 px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs">
                          <input
                            type="checkbox"
                            checked={Object.values(appliedAiQuestions).some(v => v)}
                            onChange={handleToggleAllAi}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <span>{Object.values(appliedAiQuestions).some(v => v) ? "AI 감점 항목 일괄 적용 중" : "AI 감점 일괄 철회 (전원 만점)"}</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
                        {selectedStudentForReview.aiSummary}
                      </p>
                    </div>

                    {/* 문항별 점수 배점 스텝퍼 컨트롤러 */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-slate-700" />
                        <span>문항별 배점 입력 (총 100점)</span>
                      </h4>

                      <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {tempAnswers.map((ans) => (
                          <div key={ans.qNum} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-800">
                              {ans.qNum}번 ({ans.title.slice(0, 10)}...)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestionScore(ans.qNum, -1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={ans.maxPoints}
                                value={ans.pointsEarned}
                                onChange={(e) => handleSetQuestionScoreDirect(ans.qNum, e.target.value)}
                                className="w-10 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-300 rounded py-0.5 text-slate-900 focus:outline-none focus:border-slate-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateQuestionScore(ans.qNum, 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                +
                              </button>
                              <span className="text-[11px] text-slate-400 font-semibold">
                                / {ans.maxPoints}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 최종 합산 총점 표시 */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block">선생님 최종 확정 점수</span>
                        <span className="text-xs text-slate-300">문항별 점수 자동 합산</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xl font-black text-white">
                          {tempTeacherScore}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/ 100점</span>
                      </div>
                    </div>

                    {/* 교사 평가 의견 / 피드백 */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        교사 평가 총평 / 감점 사유 (선택)
                      </label>
                      <textarea
                        value={tempFeedback}
                        onChange={(e) => setTempFeedback(e.target.value)}
                        placeholder="예: 서술형 단계별 유도 공식이 논리적이므로 부분점수 상향 조정함."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* 확정 버튼 영역 */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedStudentForReview(null)}
                      className="w-1/3 py-3 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer text-center"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveTeacherEvaluation}
                      className="w-2/3 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>최종 점수 확정 및 채점 완료</span>
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 🖥️ 교실 빔프로젝터 / 칠판 전체화면 투사 모달 */}
        {showProjectorModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 md:p-12 text-center text-white space-y-8 shadow-2xl relative overflow-hidden"
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                      교실 프로젝터 / 칠판 투사 전용 화면
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                      청계중 3학년 수학 수행평가 입장 안내
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProjectorModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Main PIN & QR 2-Column Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-2">
                {/* Left: Large PIN Code */}
                <div className="p-8 bg-slate-950/80 border border-indigo-500/30 rounded-3xl space-y-4 shadow-inner">
                  <span className="text-sm font-bold text-slate-400 block tracking-wider uppercase">
                    수업시간 1회성 시험 PIN
                  </span>
                  <div className="font-mono text-5xl md:text-6xl font-black tracking-widest text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    {roomCode}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-extrabold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>실시간 학생 응시 가능 상태</span>
                  </div>
                </div>

                {/* Right: QR Code Visual */}
                <div className="p-8 bg-white text-slate-950 rounded-3xl space-y-4 shadow-xl flex flex-col items-center justify-center">
                  <div className="w-48 h-48 bg-slate-100 border-4 border-slate-900 rounded-2xl flex flex-col items-center justify-center p-3 relative">
                    <QrCode className="w-36 h-36 text-slate-900" />
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mt-1">
                      스캔 즉시 학생 시험지 진입
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    스마트폰 카메라로 비추면 바로 응시 페이지로 이동합니다.
                  </p>
                </div>
              </div>

              {/* Instructions & Security Lock Notice */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>보안 및 공정성 수칙 (Session Lock)</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  • 학생은 본인의 [반 / 출석번호 / 이름]을 입력해야 하며, 1인 1기기 세션 락(Session Lock)이 발급되어 대리 응시 및 다중 로그인이 전면 차단됩니다.<br />
                  • 시험 도중 브라우저 화면 이탈 또는 탭 전환 감지 시 0점 경고 및 자동 제출 처리됩니다.
                </p>
              </div>

              {/* Live Real-Time Counter */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-2 border-t border-slate-800">
                <span>실시간 응시 현황: <strong className="text-white font-mono text-sm">{students.filter(s => s.submitted).length} / {students.length}명</strong> 제출 완료</span>
                <button
                  type="button"
                  onClick={() => setShowProjectorModal(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
                >
                  프로젝터 모드 닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </div>
  );
}
