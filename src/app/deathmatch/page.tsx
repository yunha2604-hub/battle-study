"use client";

import React from "react";
import SchoolDeathmatchArena from "@/components/SchoolDeathmatchArena";
import { useBattleStudy } from "@/context/BattleStudyContext";

export default function DeathmatchRoutePage() {
  const { nickname, school } = useBattleStudy();

  return (
    <SchoolDeathmatchArena
      userNickname={nickname || "대치동불주먹"}
      userSchool={school || "청계중학교"}
    />
  );
}
