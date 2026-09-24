"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function Home() {
  const router = useRouter();
  const { handleJoin, handleStudentDirectEntry } = useBattleStudy();

  return (
    <LandingPage 
      onJoin={handleJoin} 
      onGoToTeacherDashboard={() => router.push("/teacher")}
      onStudentDirectEntry={handleStudentDirectEntry}
    />
  );
}
