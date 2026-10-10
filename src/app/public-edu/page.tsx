"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PublicEduDashboard from "@/components/PublicEduDashboard";

export default function PublicEduRoutePage() {
  const router = useRouter();

  return (
    <PublicEduDashboard 
      onGoToExam={() => router.push("/assessment-test?from=public-edu")}
      onExit={() => router.push("/")}
    />
  );
}
