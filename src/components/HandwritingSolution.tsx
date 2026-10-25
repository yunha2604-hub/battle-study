"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eraser, Undo2, PenLine, RotateCcw, Check, Loader2, Lock } from "lucide-react";

export interface HandwritingSegment {
  text: string;
  flagged?: boolean;
}

export interface HandwritingEntry {
  image: string; // PNG/SVG data URL of the handwriting
  status: "writing" | "converted";
  segments: HandwritingSegment[];
  attempt: number; // number of conversions performed so far
  acknowledged: boolean; // student acknowledged the amber "확인 필요" token
}

export const EMPTY_HANDWRITING: HandwritingEntry = {
  image: "",
  status: "writing",
  segments: [],
  attempt: 0,
  acknowledged: false,
};

export const segmentsToText = (segments: HandwritingSegment[]) =>
  segments.map((s) => s.text).join("");

export const entryHasUnresolvedFlag = (entry?: HandwritingEntry) =>
  !!entry &&
  entry.status === "converted" &&
  !entry.acknowledged &&
  entry.segments.some((s) => s.flagged);

// 사용자가 제공한 실제 손글씨 예시 이미지 ((x-3)^2 = 0, x = 3). 정적 배포 시 basePath를 반영한다.
export const SAMPLE_SOLUTION_IMAGE = `${
  process.env.NODE_ENV === "development" ? "" : "/battle-study"
}/handwriting/sample-solution.png`;
export const SAMPLE_SOLUTION_TEXT = "(x - 3)² = 0\nx = 3";

/** Wraps text into SVG lines that look like a handwritten solution (used for samples/seeds). */
export function makeSampleHandwritingImage(text: string): string {
  const rawLines = text.split("|").flatMap((part) => {
    const trimmed = part.trim();
    const out: string[] = [];
    for (let i = 0; i < trimmed.length; i += 30) out.push(trimmed.slice(i, i + 30));
    return out.length ? out : [""];
  });
  const lines = rawLines.slice(0, 5);
  const height = 40 + lines.length * 44;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const body = lines
    .map(
      (l, i) =>
        `<text x="${18 + (i % 2) * 4}" y="${44 + i * 44}" transform="rotate(${i % 2 ? -0.6 : 0.5} 20 ${
          44 + i * 44
        })" font-family="'Nanum Pen Script','Segoe Print','Comic Sans MS',cursive" font-size="27" fill="#1e293b">${esc(l)}</text>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${height}" viewBox="0 0 640 ${height}"><rect width="640" height="${height}" fill="#ffffff"/>${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Builds a converted entry from a preset text (mock OCR result). */
export function buildConvertedEntry(
  image: string,
  presetText: string,
  attempt: number,
  acknowledged = false
): HandwritingEntry {
  const flagIdx = attempt === 0 ? presetText.indexOf("²") : -1;
  const segments: HandwritingSegment[] =
    flagIdx >= 0
      ? [
          { text: presetText.slice(0, flagIdx) },
          { text: "²", flagged: true }, // 지수 2가 맞는지 확인이 필요한 글자 (수식은 그대로 표시)
          { text: presetText.slice(flagIdx + 1) },
        ]
      : [{ text: presetText }];
  return { image, status: "converted", segments, attempt: attempt + 1, acknowledged };
}

interface HandwritingSolutionProps {
  entry?: HandwritingEntry;
  presetText: string;
  onChange: (entry: HandwritingEntry) => void;
}

const CANVAS_W = 640;
const CANVAS_H = 220;

export default function HandwritingSolution({ entry, presetText, onChange }: HandwritingSolutionProps) {
  const current = entry ?? EMPTY_HANDWRITING;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);
  const hasInkRef = useRef(!!current.image);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");

  const fillWhite = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  };

  // Initialise / restore the canvas whenever we return to the writing state
  useEffect(() => {
    if (current.status !== "writing") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    fillWhite(ctx);
    historyRef.current = [current.image];
    hasInkRef.current = !!current.image;
    if (current.image) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
      img.src = current.image;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.status]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = pos(e);
    setError("");
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastRef.current) return;
    const p = pos(e);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    hasInkRef.current = true;
  };

  const persist = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = hasInkRef.current ? canvas.toDataURL("image/png") : "";
    historyRef.current.push(image);
    onChange({ ...current, image, status: "writing" });
  };

  const handleUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    persist();
  };

  const handleClear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    fillWhite(ctx);
    hasInkRef.current = false;
    historyRef.current = [""];
    setError("");
    onChange({ ...current, image: "", status: "writing" });
  };

  const handleUndo = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || historyRef.current.length <= 1) {
      handleClear();
      return;
    }
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    fillWhite(ctx);
    hasInkRef.current = !!prev;
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
      img.src = prev;
    }
    onChange({ ...current, image: prev, status: "writing" });
  };

  const handleConvert = () => {
    if (!hasInkRef.current || !canvasRef.current) {
      setError("필기 내용이 없습니다. 풀이 과정을 먼저 작성해 주세요.");
      return;
    }
    const image = canvasRef.current.toDataURL("image/png");
    const attempt = current.attempt;
    setError("");
    setConverting(true);
    window.setTimeout(() => {
      onChange(buildConvertedEntry(image, presetText, attempt));
      setConverting(false);
    }, 1500);
  };

  const handleRewrite = () => {
    onChange({ ...current, status: "writing", segments: [], acknowledged: false });
  };

  const hasFlag = current.segments.some((s) => s.flagged);

  if (current.status === "converted") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500">원본 필기</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image}
              alt="학생 필기 원본"
              className="w-full rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              디지털 변환 텍스트 (직접 수정 불가)
            </p>
            <div className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 leading-relaxed whitespace-pre-line select-text">
              {current.segments.map((s, i) =>
                s.flagged ? (
                  <mark
                    key={i}
                    title="확인 필요: 원본 필기와 일치하는지 확인하세요"
                    className="bg-amber-200 text-amber-950 px-0.5 rounded font-bold"
                  >
                    {s.text}
                  </mark>
                ) : (
                  <span key={i}>{s.text}</span>
                )
              )}
            </div>
          </div>
        </div>

        {hasFlag && !current.acknowledged && (
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-[11px] text-amber-900 flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              황색으로 표시된 글자가 원본 필기와 다르게 변환되었을 수 있습니다. 확인하거나 다시 써 주세요.
            </span>
            <button
              type="button"
              onClick={() => onChange({ ...current, acknowledged: true })}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              변환 내용 확인했습니다
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            최종 제출 전까지는 [다시 쓰기]로 수정할 수 있고, 최종 제출 후에는 수정할 수 없습니다.
          </span>
          <button
            type="button"
            onClick={handleRewrite}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            다시 쓰기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border border-slate-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          className="w-full block cursor-crosshair touch-none"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        />
        {converting && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2 text-slate-700">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-bold">필기를 디지털 텍스트로 변환하는 중...</span>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={converting}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Undo2 className="w-3 h-3" />
            되돌리기
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={converting}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Eraser className="w-3 h-3" />
            전체 지우기
          </button>
        </div>
        <button
          type="button"
          onClick={handleConvert}
          disabled={converting}
          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <PenLine className="w-3.5 h-3.5" />
          필기 제출 (텍스트로 변환)
        </button>
      </div>
    </div>
  );
}
