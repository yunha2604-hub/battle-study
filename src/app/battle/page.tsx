"use client";

import React, { useEffect } from "react";
import BattleArena from "@/components/BattleArena";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function BattleRoutePage() {
  const {
    nickname, school, tier, lp,
    opponent, setOpponent,
    selectedSubject, setSelectedSubject,
    handleFinishMatch,
    isStrictAssessment,
    isTeamBattle,
    customBattleQuestions
  } = useBattleStudy();

  useEffect(() => {
    if (!opponent) {
      setOpponent({
        nickname: "목동수학귀신",
        school: "대청중학교",
        tier: "Gold",
        lp: 45
      });
    }
    if (!selectedSubject) {
      setSelectedSubject("수학");
    }
  }, [opponent, selectedSubject, setOpponent, setSelectedSubject]);

  const activeOpponent = opponent || {
    nickname: "목동수학귀신",
    school: "대청중학교",
    tier: "Gold",
    lp: 45
  };
  const activeSubject = selectedSubject || "수학";

  return (
    <BattleArena
      userProfile={{ nickname, school, tier, lp }}
      opponent={activeOpponent}
      subject={activeSubject}
      onFinishMatch={handleFinishMatch}
      isStrictAssessment={isStrictAssessment}
      isTeamBattle={isTeamBattle}
      customQuestions={isStrictAssessment ? customBattleQuestions : undefined}
    />
  );
}
