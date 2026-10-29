"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  theme?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}

type Variant = "arena" | "edu";

/**
 * 배틀스터디 공통 로고.
 * - 심볼: 방패 엠블럼 (public/logo/emblem.png, 아레나/에듀 공통)
 * - 워드마크: BATTLE STUDY, 그 위에 서브 라벨(Arena / Edu)을 1/3 크기로 왼쪽 정렬
 */
const EMBLEM_HEIGHT = { sm: 36, md: 48, lg: 84 } as const;

function BaseLogo({
  variant,
  size = "md",
  showText = true,
  theme = "dark",
  className = "",
  onClick,
}: BrandLogoProps & { variant: Variant }) {
  const isLight = theme === "light";
  const emblemH = EMBLEM_HEIGHT[size];
  // 워드마크 대문자 높이가 심볼 높이의 약 1/4이 되도록 글자 크기를 계산
  const wordSize = Math.round(emblemH * 0.37);
  // 서브 라벨은 워드마크 높이의 1/3 (너무 작아지는 sm 크기는 최소 7px 보장)
  const labelSize = Math.max(7, Math.round(wordSize / 3));
  const label = variant === "arena" ? "Arena" : "Edu";

  const wordClass = isLight
    ? "text-slate-900"
    : "bg-gradient-to-b from-white to-amber-100 bg-clip-text text-transparent";

  const labelClass =
    variant === "arena"
      ? isLight
        ? "text-amber-600"
        : "text-amber-400"
      : "bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent";

  return (
    <div
      onClick={onClick}
      role={onClick ? "link" : undefined}
      aria-label={`배틀스터디 ${label}`}
      className={`inline-flex items-center select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{ gap: Math.round(emblemH * 0.17) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/emblem.png"
        alt=""
        draggable={false}
        style={{ height: emblemH, width: "auto" }}
      />
      {showText && (
        <div
          className="flex flex-col items-start"
          style={{ fontFamily: "var(--font-brand), sans-serif", lineHeight: 1 }}
        >
          <span
            className={`font-bold ${labelClass}`}
            style={{
              fontSize: labelSize,
              marginBottom: Math.round(wordSize * 0.22),
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </span>
          <span
            className={`font-extrabold whitespace-nowrap ${wordClass}`}
            style={{ fontSize: wordSize, letterSpacing: "0.01em" }}
          >
            BATTLE STUDY
          </span>
        </div>
      )}
    </div>
  );
}

export function ArenaLogo(props: BrandLogoProps) {
  return <BaseLogo variant="arena" {...props} />;
}

export function EduLogo(props: BrandLogoProps) {
  return <BaseLogo variant="edu" {...props} />;
}

export default ArenaLogo;
