"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AssessmentExamView from "@/components/AssessmentExamView";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function AssessmentTestRoutePage() {
  const router = useRouter();
  const {
    mathQuestions,
    assessmentCode,
    handleFinishAssessmentTest
  } = useBattleStudy();

  return (
    <AssessmentExamView
      questions={mathQuestions}
      assessmentCode={assessmentCode}
      onFinishExam={handleFinishAssessmentTest}
      onExit={() => router.push("/teacher")}
      mode="TEACHER_TEST"
    />
  );
}
