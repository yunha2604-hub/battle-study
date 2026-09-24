"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CustomRoomWaiting from "@/components/CustomRoomWaiting";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function CustomRoomRoutePage() {
  const router = useRouter();
  const {
    roomPin, nickname, school, isTeamBattle,
    handleStartCustomBattle
  } = useBattleStudy();

  return (
    <CustomRoomWaiting
      roomPin={roomPin}
      hostName={nickname || "슈크림먹은빵"}
      hostSchool={school || "청계중학교"}
      isTeamBattle={isTeamBattle}
      onStartBattle={handleStartCustomBattle}
      onBackToLobby={() => router.push("/lobby")}
    />
  );
}
