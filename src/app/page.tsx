"use client";

import React, { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Lobby, { OpponentData } from "@/components/Lobby";
import BattleArena from "@/components/BattleArena";
import ResultPage from "@/components/ResultPage";
import CustomRoomWaiting from "@/components/CustomRoomWaiting";
import TeacherDashboard, { 
  StudentAssessmentRow, 
  GeneratedMathQuestion, 
  INITIAL_STUDENTS, 
  DEFAULT_MATH_QUESTIONS 
} from "@/components/TeacherDashboard";
import { Question } from "@/components/BattleArena";

export default function Home() {
  const [view, setView] = useState<"LOGIN" | "LOBBY" | "BATTLE" | "RESULT" | "CUSTOM_ROOM_WAITING" | "TEACHER_DASHBOARD">("LOGIN");

  // User profile
  const [nickname, setNickname] = useState("");
  const [school, setSchool] = useState("");
  const [tier, setTier] = useState("Silver");
  const [lp, setLp] = useState(85);
  const [energy, setEnergy] = useState(3); // Default energy: 3, Max: 5

  // Match data
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<"국어" | "영어" | "수학" | null>(null);
  const [userFinalHp, setUserFinalHp] = useState(100);
  const [opponentFinalHp, setOpponentFinalHp] = useState(100);
  const [answersLog, setAnswersLog] = useState<any[]>([]);
  const [isFirstMatch, setIsFirstMatch] = useState(false);

  // Custom Room & Assessment mode states
  const [roomPin, setRoomPin] = useState("1A2B3C");
  const [isStrictAssessment, setIsStrictAssessment] = useState(false);
  const [isTeamBattle, setIsTeamBattle] = useState(false);

  // --- End-to-End Shared Assessment State ---
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
    setIsFirstMatch(true); // Trigger frictionless first match
    
    // Generate immediate rival opponent details
    const rivalSchool = sch === "청계중학교" ? "대청중학교" : "청계중학교";
    const firstOpponent: OpponentData = {
      nickname: "목동수학귀신",
      school: rivalSchool,
      tier: "Gold",
      lp: 45
    };
    
    setOpponent(firstOpponent);
    setSelectedSubject("영어"); // First onboarding match is in English
    setIsStrictAssessment(false);
    setIsTeamBattle(false);
    setView("BATTLE");
  };

  const handleStartMatch = (opponentData: OpponentData, subject: "국어" | "영어" | "수학") => {
    setOpponent(opponentData);
    setSelectedSubject(subject);
    setEnergy((prev) => Math.max(0, prev - 1)); // Deduct 1 energy
    setIsStrictAssessment(false);
    setIsTeamBattle(false);
    setView("BATTLE");
  };

  const handleCreateRoom = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPin(pin);
    setIsTeamBattle(false);
    setView("CUSTOM_ROOM_WAITING");
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
    setView("CUSTOM_ROOM_WAITING");
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
    setSelectedSubject(isTeamBattle ? "수학" : "영어"); // Event team battle matches run in Math!
    setIsStrictAssessment(false);
    setView("BATTLE");
  };

  const handleJoinEventRoom = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pin = "";
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPin(pin);
    setIsTeamBattle(true);
    setView("CUSTOM_ROOM_WAITING");
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
    setSelectedSubject("수학"); // Assessment runs Math test for math assessment dashboard
    setIsStrictAssessment(isStrict);
    setIsTeamBattle(false);
    setView("BATTLE");
  };

  const handleFinishMatch = (userHp: number, oppHp: number, log: any[]) => {
    setUserFinalHp(userHp);
    setOpponentFinalHp(oppHp);
    setAnswersLog(log);

    // If this was an assessment match, automatically add/update the student's submission in teacher's table!
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
          teacherScore: null, // Pending teacher 2nd confirmation!
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

    setView("RESULT");
  };

  const handleReturnToLobby = (newTier: string, newLp: number) => {
    setTier(newTier);
    setLp(newLp);
    setSelectedSubject(null);
    setIsFirstMatch(false); // Reset first match flag once they return to lobby
    setView("LOBBY");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {view === "LOGIN" && (
        <LandingPage 
          onJoin={handleJoin} 
          onGoToTeacherDashboard={() => setView("TEACHER_DASHBOARD")}
        />
      )}
      {view === "LOBBY" && (
        <Lobby
          nickname={nickname}
          school={school}
          tier={tier}
          lp={lp}
          energy={energy}
          setTier={setTier}
          setLp={setLp}
          setEnergy={setEnergy}
          onStartMatch={handleStartMatch}
          onCreateRoom={handleCreateRoom}
          onEnterPin={handleEnterPin}
          onGoToTeacherDashboard={() => setView("TEACHER_DASHBOARD")}
          onJoinEventRoom={handleJoinEventRoom}
        />
      )}
      {view === "CUSTOM_ROOM_WAITING" && (
        <CustomRoomWaiting
          roomPin={roomPin}
          hostName={nickname || "대치동불주먹"}
          hostSchool={school || "청계중학교"}
          isTeamBattle={isTeamBattle}
          onStartBattle={handleStartCustomBattle}
          onBackToLobby={() => setView("LOBBY")}
        />
      )}
      {view === "TEACHER_DASHBOARD" && (
        <TeacherDashboard
          onStartAssessmentMatch={handleStartAssessmentMatch}
          onExit={() => setView(nickname ? "LOBBY" : "LOGIN")}
          roomCode={assessmentCode}
          setRoomCode={setAssessmentCode}
          codeStatus={assessmentStatus}
          setCodeStatus={setAssessmentStatus}
          students={studentAssessments}
          setStudents={setStudentAssessments}
          questions={mathQuestions}
          setQuestions={setMathQuestions}
          isQuestionsConfirmed={isQuestionsConfirmed}
          setIsQuestionsConfirmed={setIsQuestionsConfirmed}
        />
      )}
      {view === "BATTLE" && opponent && selectedSubject && (
        <BattleArena
          userProfile={{ nickname, school, tier, lp }}
          opponent={opponent}
          subject={selectedSubject}
          onFinishMatch={handleFinishMatch}
          isStrictAssessment={isStrictAssessment}
          isTeamBattle={isTeamBattle}
          customQuestions={isStrictAssessment ? customBattleQuestions : undefined}
        />
      )}
      {view === "RESULT" && opponent && (
        <ResultPage
          userProfile={{ nickname, school, tier, lp }}
          opponent={opponent}
          userFinalHp={userFinalHp}
          opponentFinalHp={opponentFinalHp}
          answersLog={answersLog}
          isFirstMatch={isFirstMatch}
          onReturnToLobby={handleReturnToLobby}
          isStrictAssessment={isStrictAssessment}
          onGoToTeacherDashboard={() => setView("TEACHER_DASHBOARD")}
        />
      )}
    </div>
  );
}
