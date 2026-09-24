"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ResultPage from "@/components/ResultPage";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function ResultRoutePage() {
  const router = useRouter();
  const {
    nickname, school, tier, lp,
    opponent,
    userFinalHp, opponentFinalHp,
    answersLog, isFirstMatch,
    handleReturnToLobby,
    isStrictAssessment
  } = useBattleStudy();

  const activeOpponent = opponent || {
    nickname: "목동수학귀신",
    school: "대청중학교",
    tier: "Gold",
    lp: 45
  };

  return (
    <ResultPage
      userProfile={{ nickname, school, tier, lp }}
      opponent={activeOpponent}
      userFinalHp={userFinalHp}
      opponentFinalHp={opponentFinalHp}
      answersLog={answersLog}
      isFirstMatch={isFirstMatch}
      onReturnToLobby={handleReturnToLobby}
      isStrictAssessment={isStrictAssessment}
      onGoToTeacherDashboard={() => router.push("/teacher")}
    />
  );
}
