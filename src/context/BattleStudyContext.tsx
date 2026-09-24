"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OpponentData } from "@/components/Lobby";
import { Question } from "@/components/BattleArena";
import { 
  StudentAssessmentRow, 
  GeneratedMathQuestion, 
  INITIAL_STUDENTS, 
  DEFAULT_MATH_QUESTIONS 
} from "@/components/TeacherDashboard";

interface BattleStudyContextType {
  // Student Profile
  nickname: string;
  setNickname: (name: string) => void;
  school: string;
  setSchool: (sch: string) => void;
  tier: string;
  setTier: (t: string) => void;
  lp: number;
  setLp: (lp: number) => void;
  energy: number;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;

  // Match & Battle
  opponent: OpponentData | null;
  setOpponent: (opp: OpponentData | null) => void;
  selectedSubject: "국어" | "영어" | "수학" | null;
  setSelectedSubject: (subj: "국어" | "영어" | "수학" | null) => void;
  userFinalHp: number;
  setUserFinalHp: (hp: number) => void;
  opponentFinalHp: number;
  setOpponentFinalHp: (hp: number) => void;
  answersLog: any[];
  setAnswersLog: (log: any[]) => void;
  isFirstMatch: boolean;
  setIsFirstMatch: (b: boolean) => void;
  isStrictAssessment: boolean;
  setIsStrictAssessment: (b: boolean) => void;
  isTeamBattle: boolean;
  setIsTeamBattle: (b: boolean) => void;
  roomPin: string;
  setRoomPin: (pin: string) => void;

  // Shared Teacher / Assessment
  assessmentCode: string;
  setAssessmentCode: React.Dispatch<React.SetStateAction<string>>;
  assessmentStatus: "READY" | "IN_PROGRESS" | "EXPIRED";
  setAssessmentStatus: React.Dispatch<React.SetStateAction<"READY" | "IN_PROGRESS" | "EXPIRED">>;
  studentAssessments: StudentAssessmentRow[];
  setStudentAssessments: React.Dispatch<React.SetStateAction<StudentAssessmentRow[]>>;
  mathQuestions: GeneratedMathQuestion[];
  setMathQuestions: React.Dispatch<React.SetStateAction<GeneratedMathQuestion[]>>;
  isQuestionsConfirmed: boolean;
  setIsQuestionsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  customBattleQuestions: Question[];

  // Navigation & Action Handlers
  handleJoin: (nick: string, sch: string) => void;
  handleStudentDirectEntry: (targetMenu: "LOBBY" | "BATTLE" | "SHADOW_RAID" | "ANALYTICS") => void;
  handleStartMatch: (opponentData: OpponentData, subject: "국어" | "영어" | "수학") => void;
  handleStartCustomBattle: () => void;
  handleCreateRoom: () => void;
  handleJoinEventRoom: () => void;
  handleStartAssessmentMatch: (isStrict: boolean) => void;
  handleFinishMatch: (userHp: number, oppHp: number, log: any[]) => void;
  handleReturnToLobby: (newTier: string, newLp: number) => void;
  handleEnterPin: (pin: string) => void;
}

const BattleStudyContext = createContext<BattleStudyContextType | null>(null);

const DEFAULT_OPPONENT: OpponentData = {
  nickname: "목동수학귀신",
  school: "대청중학교",
  tier: "Gold",
  lp: 45
};

export function BattleStudyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // User Profile (Defaults to Student Mode: 슈크림먹은빵 · 청계중학교)
  const [nickname, setNickname] = useState<string>("슈크림먹은빵");
  const [school, setSchool] = useState<string>("청계중학교");
  const [tier, setTier] = useState<string>("Silver");
  const [lp, setLp] = useState<number>(85);
  const [energy, setEnergy] = useState<number>(3);

  // Match State
  const [opponent, setOpponent] = useState<OpponentData | null>(DEFAULT_OPPONENT);
  const [selectedSubject, setSelectedSubject] = useState<"국어" | "영어" | "수학" | null>("수학");
  const [userFinalHp, setUserFinalHp] = useState<number>(100);
  const [opponentFinalHp, setOpponentFinalHp] = useState<number>(100);
  const [answersLog, setAnswersLog] = useState<any[]>([]);
  const [isFirstMatch, setIsFirstMatch] = useState<boolean>(false);

  // Custom Room & Assessment mode states
  const [roomPin, setRoomPin] = useState<string>("1A2B3C");
  const [isStrictAssessment, setIsStrictAssessment] = useState<boolean>(false);
  const [isTeamBattle, setIsTeamBattle] = useState<boolean>(false);

  // Shared Teacher / Assessment State
  const [assessmentCode, setAssessmentCode] = useState<string>("MTH-7429");
  const [assessmentStatus, setAssessmentStatus] = useState<"READY" | "IN_PROGRESS" | "EXPIRED">("IN_PROGRESS");
  const [studentAssessments, setStudentAssessments] = useState<StudentAssessmentRow[]>(INITIAL_STUDENTS);
  const [mathQuestions, setMathQuestions] = useState<GeneratedMathQuestion[]>(DEFAULT_MATH_QUESTIONS);
  const [isQuestionsConfirmed, setIsQuestionsConfirmed] = useState<boolean>(true);

  // Convert teacher confirmed math questions to BattleArena question format
  const customBattleQuestions: Question[] = mathQuestions.map((q) => {
    const defaultOptions = q.options && q.options.length > 0
      ? q.options
      : [q.correctAnswer, "x = -3", "x = ±3", "x = 0"];
    const ansIdx = defaultOptions.indexOf(q.correctAnswer) >= 0 ? defaultOptions.indexOf(q.correctAnswer) : 0;
    return {
      id: q.id,
      category: `수학 (${q.standardCode})`,
      question: q.question,
      options: defaultOptions,
      answerIndex: ansIdx,
      explanation: q.solution,
      timeLimit: 30
    };
  });

  const handleJoin = (nick: string, sch: string) => {
    setNickname(nick);
    setSchool(sch);
    setIsFirstMatch(true);

    const rivalSchool = sch === "청계중학교" ? "대청중학교" : "청계중학교";
    const firstOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };

    setOpponent(firstOpponent);
    setSelectedSubject("영어");
    setIsStrictAssessment(false);
    setIsTeamBattle(false);
    router.push("/battle");
  };

  const handleStudentDirectEntry = (targetMenu: "LOBBY" | "BATTLE" | "SHADOW_RAID" | "ANALYTICS") => {
    setNickname("슈크림먹은빵");
    setSchool("청계중학교");
    setTier("Silver");
    setLp(85);
    setEnergy(3);
    setIsFirstMatch(false);
    setIsStrictAssessment(false);
    setIsTeamBattle(false);

    if (targetMenu === "BATTLE") {
      setOpponent(DEFAULT_OPPONENT);
      setSelectedSubject("수학");
      router.push("/battle");
    } else if (targetMenu === "SHADOW_RAID") {
      router.push("/shadow-raid");
    } else if (targetMenu === "ANALYTICS") {
      router.push("/analytics");
    } else {
      router.push("/lobby");
    }
  };

  const handleStartMatch = (opponentData: OpponentData, subject: "국어" | "영어" | "수학") => {
    setOpponent(opponentData);
    setSelectedSubject(subject);
    setEnergy((prev) => Math.max(0, prev - 1));
    setIsStrictAssessment(false);
    setIsTeamBattle(false);
    router.push("/battle");
  };

  const handleCreateRoom = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPin(pin);
    setIsTeamBattle(false);
    router.push("/custom-room");
  };

  const handleEnterPin = (pin: string) => {
    const cleanPin = pin.trim().toUpperCase();
    const isTeacherCode = cleanPin === assessmentCode.toUpperCase() || 
      cleanPin.replace("-", "") === assessmentCode.replace("-", "").toUpperCase();

    if (isTeacherCode) {
      if (assessmentStatus === "EXPIRED") {
        alert("🛑 [시험 종료] 이 일회성 시험 코드는 시험이 종료되어 만료되었습니다. (재사용 불가)");
        return;
      }
      alert(`📝 [수행평가 시험 접속]\n단원: I. 실수와 그 연산 (${mathQuestions.length}문항)\n코드: ${assessmentCode}\n수행평가 아레나로 이동합니다!`);
      handleStartAssessmentMatch(true);
      return;
    }

    setRoomPin(pin);
    setIsTeamBattle(false);
    router.push("/custom-room");
  };

  const handleStartCustomBattle = () => {
    const rivalSchool = school === "동탄고등학교" ? "반송고등학교" : "동탄고등학교";
    const customOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };
    setOpponent(customOpponent);
    setSelectedSubject(isTeamBattle ? "수학" : "영어");
    setIsStrictAssessment(false);
    router.push("/battle");
  };

  const handleJoinEventRoom = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPin(pin);
    setIsTeamBattle(true);
    router.push("/custom-room");
  };

  const handleStartAssessmentMatch = (isStrict: boolean) => {
    const rivalSchool = school === "청계중학교" ? "대청중학교" : "청계중학교";
    const testOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };
    setOpponent(testOpponent);
    setSelectedSubject("수학");
    setIsStrictAssessment(isStrict);
    setIsTeamBattle(false);
    router.push("/battle");
  };

  const handleFinishMatch = (userHp: number, oppHp: number, log: any[]) => {
    setUserFinalHp(userHp);
    setOpponentFinalHp(oppHp);
    setAnswersLog(log);

    if (isStrictAssessment) {
      const studentName = nickname || "대치동불주먹";
      const correctCount = log.filter((item: any) => item.isCorrect).length;
      const totalCount = log.length || 1;
      const calculatedAiScore = Math.round((correctCount / totalCount) * 100);
      const currentTime = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

      setStudentAssessments((prev) => {
        const existingIdx = prev.findIndex((s) => s.name === studentName);
        const newRecord: StudentAssessmentRow = {
          id: `std-sub-${Date.now()}`,
          grade: 3,
          classNum: 1,
          studentNum: 7,
          name: studentName,
          submitted: true,
          submittedAt: currentTime,
          aiScore: calculatedAiScore,
          teacherScore: null,
          isConfirmed: false,
          aiSummary: `객관식 정답률 ${calculatedAiScore}%. AI 1차 자동 채점 완료. 선생님 2차 최종 점수 확정 대기 중.`,
          answers: log.map((item: any, idx: number) => ({
            qNum: idx + 1,
            title: item.question.category || `${idx + 1}번 문항`,
            studentAnswer: item.question.options ? (item.question.options[item.selectedIndex] || "선택값") : "제출 답안",
            correctAnswer: item.question.options ? (item.question.options[item.question.answerIndex] || "정답") : "정답",
            pointsEarned: item.isCorrect ? Math.round(100 / totalCount) : 0,
            maxPoints: Math.round(100 / totalCount),
            aiAssessment: item.isCorrect ? "정답 (+만점 배점)" : "오답 (풀이과정 재검토 권장)"
          }))
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newRecord;
          return updated;
        }
        return [newRecord, ...prev];
      });
    }

    router.push("/result");
  };

  const handleReturnToLobby = (newTier: string, newLp: number) => {
    setTier(newTier);
    setLp(newLp);
    setSelectedSubject(null);
    setIsFirstMatch(false);
    router.push("/lobby");
  };

  return (
    <BattleStudyContext.Provider
      value={{
        nickname, setNickname,
        school, setSchool,
        tier, setTier,
        lp, setLp,
        energy, setEnergy,
        opponent, setOpponent,
        selectedSubject, setSelectedSubject,
        userFinalHp, setUserFinalHp,
        opponentFinalHp, setOpponentFinalHp,
        answersLog, setAnswersLog,
        isFirstMatch, setIsFirstMatch,
        isStrictAssessment, setIsStrictAssessment,
        isTeamBattle, setIsTeamBattle,
        roomPin, setRoomPin,
        assessmentCode, setAssessmentCode,
        assessmentStatus, setAssessmentStatus,
        studentAssessments, setStudentAssessments,
        mathQuestions, setMathQuestions,
        isQuestionsConfirmed, setIsQuestionsConfirmed,
        customBattleQuestions,
        handleJoin,
        handleStudentDirectEntry,
        handleStartMatch,
        handleStartCustomBattle,
        handleCreateRoom,
        handleJoinEventRoom,
        handleStartAssessmentMatch,
        handleFinishMatch,
        handleReturnToLobby,
        handleEnterPin,
      }}
    >
      {children}
    </BattleStudyContext.Provider>
  );
}

export function useBattleStudy() {
  const context = useContext(BattleStudyContext);
  if (!context) {
    throw new Error("useBattleStudy must be used within a BattleStudyProvider");
  }
  return context;
}
