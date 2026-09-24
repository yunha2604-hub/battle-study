"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Lobby from "@/components/Lobby";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function LobbyRoutePage() {
  const router = useRouter();
  const {
    nickname, school, tier, lp, energy,
    setTier, setLp, setEnergy,
    handleStartMatch, handleCreateRoom, handleEnterPin, handleJoinEventRoom
  } = useBattleStudy();

  return (
    <Lobby
      initialTab="ARENA"
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
      onGoToTeacherDashboard={() => router.push("/teacher")}
      onJoinEventRoom={handleJoinEventRoom}
    />
  );
}
