"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AssessmentExamView from "@/components/AssessmentExamView";
import { useBattleStudy } from "@/context/BattleStudyContext";

function AssessmentTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const isFromPublicEdu = fromParam === "public-edu";
  const isFromStudent = fromParam === "student" || isFromPublicEdu;

  const {
    mathQuestions,
    assessmentCode,
    handleFinishAssessmentTest
  } = useBattleStudy();

  const handleExit = () => {
    if (isFromPublicEdu) {
      router.push("/public-edu");
    } else if (fromParam === "student") {
      router.push("/lobby");
    } else {
      router.push("/teacher");
    }
  };

  return (
    <AssessmentExamView
      questions={mathQuestions}
      assessmentCode={assessmentCode}
      onFinishExam={handleFinishAssessmentTest}
      onExit={handleExit}
      mode={isFromStudent ? "STUDENT_EXAM" : "TEACHER_TEST"}
      isFromPublicEdu={isFromPublicEdu}
    />
  );
}

export default function AssessmentTestRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">수행평가 시험지 로딩 중...</div>}>
      <AssessmentTestContent />
    </Suspense>
  );
}
