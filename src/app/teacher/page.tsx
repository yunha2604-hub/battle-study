"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TeacherDashboard from "@/components/TeacherDashboard";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function TeacherRoutePage() {
  const router = useRouter();
  const {
    assessmentCode, setAssessmentCode,
    assessmentStatus, setAssessmentStatus,
    studentAssessments, setStudentAssessments,
    mathQuestions, setMathQuestions,
    isQuestionsConfirmed, setIsQuestionsConfirmed,
    handleStartAssessmentMatch
  } = useBattleStudy();

  return (
    <TeacherDashboard
      onStartAssessmentMatch={handleStartAssessmentMatch}
      onExit={() => router.push("/lobby")}
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
  );
}
