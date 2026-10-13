"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, School, Search, Zap, User, Sparkles, Calculator, BookOpen, 
  ChevronRight, ChevronDown, ArrowLeft, LogIn, Building2,
  ShieldCheck, MapPin, Compass, AlertTriangle, Users, CheckCircle2, 
  Lock, Copy, Check, Radio, Clock, ShieldAlert, Sparkle
} from "lucide-react";
import GlobalHeader from "./GlobalHeader";

interface LandingPageProps {
  onJoin: (nickname: string, school: string) => void;
  onGoToTeacherDashboard?: () => void;
  onStudentDirectEntry?: (targetMenu: "LOBBY" | "BATTLE" | "SHADOW_RAID" | "ANALYTICS") => void;
}

const MIDDLE_SCHOOLS = [
  "청계중학교",
  "대청중학교",
  "휘문중학교",
  "신반포중학교",
  "도곡중학교",
  "역삼중학교",
  "개원중학교",
  "잠실중학교",
  "서운중학교",
  "목동중학교",
  "양정중학교",
  "신목중학교",
  "압구정중학교",
  "신구중학교",
  "한국디지털미디어고등학교 (디미고)",
  "반송고등학교",
  "세마고등학교"
];

interface MockStudent {
  school: string;
  grade: number;
  classNum: number;
  studentNum: number;
  name: string;
}

const MOCK_EDU_STUDENTS: MockStudent[] = [
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 1, name: "강민재" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 2, name: "김도윤" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 5, name: "이서연" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 7, name: "박윤하" },
  { school: "청계중학교", grade: 3, classNum: 1, studentNum: 12, name: "정예은" },
  { school: "청계중학교", grade: 3, classNum: 2, studentNum: 1, name: "최서준" },
  { school: "청계중학교", grade: 3, classNum: 2, studentNum: 3, name: "조우진" },
  { school: "청계중학교", grade: 3, classNum: 2, studentNum: 4, name: "윤아인" },
  { school: "청계중학교", grade: 3, classNum: 3, studentNum: 1, name: "한수아" },
  { school: "청계중학교", grade: 3, classNum: 3, studentNum: 2, name: "배현우" },
  { school: "청계중학교", grade: 3, classNum: 3, studentNum: 3, name: "송지우" },
];

export default function LandingPage({ onJoin, onGoToTeacherDashboard, onStudentDirectEntry }: LandingPageProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // 🏛️ 배틀스터디 에듀 (공교육 모드) 전용 모달 상태
  // ==========================================
  const [showEduModal, setShowEduModal] = useState(false);
  const [eduTab, setEduTab] = useState<"STUDENT" | "TEACHER">("STUDENT");
  
  // 학생 모드 입력 상태
  const [eduSchool, setEduSchool] = useState("청계중학교");
  const [eduGrade, setEduGrade] = useState("3");
  const [eduClass, setEduClass] = useState("1");
  const [eduStudentNum, setEduStudentNum] = useState("7");
  const [eduName, setEduName] = useState("박윤하");
  const [eduSchoolCode, setEduSchoolCode] = useState("CHK-2026");
  const [isAutoFilled, setIsAutoFilled] = useState(true);

  // 교사 모드 입력 상태
  const [teacherSchool, setTeacherSchool] = useState("청계중학교");
  const [teacherId, setTeacherId] = useState("teacher_math");
  const [teacherPw, setTeacherPw] = useState("123456");

  // 반/번호 변경 시 Mock DB 자동완성 핸들러
  const handleStudentClassNumChange = (newClass: string, newNum: string) => {
    setEduClass(newClass);
    setEduStudentNum(newNum);
    const matched = MOCK_EDU_STUDENTS.find(
      (s) => s.school === eduSchool && s.grade === Number(eduGrade) && s.classNum === Number(newClass) && s.studentNum === Number(newNum)
    );
    if (matched) {
      setEduName(matched.name);
      setIsAutoFilled(true);
    } else {
      setIsAutoFilled(false);
    }
  };

  // ==========================================
  // 🛡️ 학교 인증 온보딩 모달 (카카오 로그인 및 Route A / Route B)
  // ==========================================
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState<1 | 2 | 3 | 4>(1); // 1: CI인증, 2: 학교선택, 3: 분기(A/B), 4: 90일Lock
  const [verifyNickname, setVerifyNickname] = useState("대치동불주먹");
  const [verifySchool, setVerifySchool] = useState("청계중학교");
  const [verifyRoute, setVerifyRoute] = useState<"A" | "B">("A"); // Route A: GPS, Route B: 친구 2명 보증
  
  // Route A (GPS) 상태
  const [gpsSimState, setGpsSimState] = useState<"IDLE" | "SCANNING" | "SUCCESS" | "MOCK_DETECTED" | "OUT_OF_RANGE">("IDLE");
  const [gpsDistance, setGpsDistance] = useState(35); // meters
  
  // Route B (친구 2명 보증) 상태
  const [friend1Accepted, setFriend1Accepted] = useState(false);
  const [friend2Accepted, setFriend2Accepted] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // 핸들러: 카카오 인증 모달 열기
  const handleOpenKakaoVerification = () => {
    setShowVerificationModal(true);
    setVerifyStep(1);
    setGpsSimState("IDLE");
    setFriend1Accepted(false);
    setFriend2Accepted(false);
    setIsCopiedLink(false);
  };

  // 핸들러: GPS 스캔 시뮬레이션
  const handleStartGpsScan = (scenario: "NORMAL" | "MOCK" | "OUT_OF_RANGE" = "NORMAL") => {
    setGpsSimState("SCANNING");
    setTimeout(() => {
      if (scenario === "MOCK") {
        setGpsSimState("MOCK_DETECTED");
      } else if (scenario === "OUT_OF_RANGE") {
        setGpsDistance(420);
        setGpsSimState("OUT_OF_RANGE");
      } else {
        setGpsDistance(35);
        setGpsSimState("SUCCESS");
      }
    }, 1100);
  };

  // 핸들러: 최종 학교 확정 및 아레나 입장
  const handleCompleteVerification = () => {
    setShowVerificationModal(false);
    onJoin(verifyNickname.trim() || "학생", verifySchool);
  };

  const filteredSchools = useMemo(() => {
    if (schoolInput.trim() === "") return [];
    return MIDDLE_SCHOOLS.filter((school) =>
      school.toLowerCase().includes(schoolInput.toLowerCase())
    );
  }, [schoolInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요!");
      return;
    }
    if (!schoolInput.trim()) {
      setError("학교를 선택해주세요!");
      return;
    }
    if (!MIDDLE_SCHOOLS.includes(schoolInput)) {
      setError("올바른 학교명을 리스트에서 선택해주세요!");
      return;
    }
    setError("");
    onJoin(nickname.trim(), schoolInput.trim());
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 font-sans">
      
      {/* Global Header */}
      <GlobalHeader activeTab="LOGIN" onGoToTeacher={onGoToTeacherDashboard} />

      {/* Background Particles / Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 text-cyan-400"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-1/4 text-purple-400"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      </div>

      {/* 🏛️ 좌측 상단: 배틀스터디 에듀 (공교육 모드) 독립 진입 버튼 */}
      <div className="absolute top-20 left-4 md:left-8 z-30">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => setShowEduModal(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-black shadow-xl shadow-indigo-950/40 backdrop-blur-md cursor-pointer transition-all group"
        >
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-indigo-400 font-bold tracking-wider uppercase">학교 학사 / 수행평가</span>
            <span className="block text-sm font-black text-white">🏛️ 배틀스터디 에듀</span>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform ml-1" />
        </motion.button>
      </div>

      {/* Main Container: 배틀스터디 아레나 공식 학교 인증 & 진입 온보딩 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-xl px-6 py-8 mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-6"
        >
          {/* Logo / Header (배틀스터디 아레나 게임 전용) */}
          <div className="text-center pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
              <Swords className="w-3.5 h-3.5" />
              <span>실시간 1:1 퀴즈 배틀 아레나</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-md font-sans">
              배틀스터디 아레나
            </h1>
            <p className="text-xs font-semibold tracking-widest text-cyan-400 mt-1 uppercase">
              Battle Study Arena
            </p>
            <p className="text-slate-400 text-xs mt-2">
              학교의 명예를 걸고 맞붙는 1대1 실시간 퀴즈 대전
            </p>
          </div>

          {/* Stepper Indicator (1. 본인인증 ➔ 2. 학교선택 ➔ 3. 인증분기 ➔ 4. 소속 Lock) */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-black pt-1">
            {[
              { num: 1, label: "본인인증" },
              { num: 2, label: "학교선택" },
              { num: 3, label: "인증분기" },
              { num: 4, label: "소속 Lock" },
            ].map((s) => (
              <div
                key={s.num}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  verifyStep === s.num
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-extrabold shadow-sm shadow-cyan-500/20"
                    : verifyStep > s.num
                    ? "bg-slate-800/80 border-slate-700 text-emerald-400"
                    : "bg-slate-950/60 border-slate-800 text-slate-500"
                }`}
              >
                <span>{verifyStep > s.num ? "✓" : `${s.num}.`} {s.label}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: 카카오 간편 로그인/가입 (1인 1계정 CI 검증) */}
          {verifyStep === 1 && (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-black">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  <span>카카오 본인인증(CI) 연동 및 1인 1계정 체계</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  전화번호 및 카카오 CI 연동을 통해 중복 가입 및 어뷰징을 원천 차단합니다.
                </p>
                <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded-lg border border-yellow-500/20">
                  • 연계 식별 CI: <span className="text-yellow-300">8a9f4c***2b19e</span> (유효)<br />
                  • 휴대전화: <span className="text-yellow-300">010-****-5821</span> (인증 완료)
                </div>
              </div>

              <div className="text-left space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  아레나에서 사용할 닉네임
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={verifyNickname}
                    onChange={(e) => setVerifyNickname(e.target.value)}
                    placeholder="예: 대치동불주먹"
                    maxLength={12}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 font-bold text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVerifyStep(2)}
                className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FDD800] text-black font-extrabold rounded-xl py-3.5 transition-all cursor-pointer shadow-lg shadow-yellow-500/20 group hover:scale-[1.01]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.2 4.4 6.5l-1.1 4c-.1.3.2.6.5.4l4.8-3.2c.4.1.9.1 1.4.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/></svg>
                <span>카카오 계정으로 계속하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: 학교 검색 및 선택 (목표 소속 학교 지정) */}
          {verifyStep === 2 && (
            <div className="space-y-4 pt-1 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  목표 소속 중학교 선택
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={verifySchool}
                    onChange={(e) => setVerifySchool(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 font-bold text-sm cursor-pointer"
                  >
                    {MIDDLE_SCHOOLS.map((sch) => (
                      <option key={sch} value={sch} className="bg-slate-900 text-white">
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-indigo-200">
                  <Lock className="w-3.5 h-3.5" /> 90일 소속 학교 고정 (Anti-Abuse 정책)
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  인증 통과 시 90일간 타 학교로 이적이 불가하며, 개인 랭킹 점수가 <strong>[{verifySchool}]</strong>의 공식 학교 대항전 포인트로 누적됩니다.
                </p>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setVerifyStep(1)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => setVerifyStep(3)}
                  className="w-2/3 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>다음: 학교 인증 방식 선택</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 인증 방식 분기 (<Route A: GPS> vs <Route B: 친구 2명 보증>) */}
          {verifyStep === 3 && (
            <div className="space-y-4 pt-1 text-left">
              {/* Route Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setVerifyRoute("A");
                    setGpsSimState("IDLE");
                  }}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                    verifyRoute === "A"
                      ? "bg-gradient-to-r from-cyan-900/80 to-blue-900/80 border border-cyan-500/60 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Route A
                    </span>
                    <span className="text-[9px] bg-cyan-500/30 text-cyan-300 font-bold px-1.5 py-0.5 rounded">
                      현장 즉시인증
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-200">GPS 현장 인증</p>
                  <p className="text-[10px] text-cyan-300/80 mt-0.5">반경 150m · 보증권 2회 부여</p>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyRoute("B")}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                    verifyRoute === "B"
                      ? "bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/60 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" /> Route B
                    </span>
                    <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1.5 py-0.5 rounded">
                      원격 보증
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-200">친구 2명 보증</p>
                  <p className="text-[10px] text-purple-300/80 mt-0.5">재학생 추천 · 보증권 유보</p>
                </button>
              </div>

              {/* ROUTE A: GPS 현장 인증 화면 */}
              {verifyRoute === "A" && (
                <div className="p-4 bg-slate-950 border border-cyan-500/20 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>[{verifySchool}] 정문 반경 150m 측정</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">GPS Engine</span>
                  </div>

                  {/* 시연 인터랙션 버튼 세트 */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      🎮 시연/심사용 GPS 시나리오 테스트:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartGpsScan("NORMAL")}
                        className="py-1.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-lg text-[10px] font-bold text-emerald-300 transition-colors cursor-pointer text-center"
                      >
                        1. 정상 통과 (35m)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartGpsScan("MOCK")}
                        className="py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 rounded-lg text-[10px] font-bold text-rose-300 transition-colors cursor-pointer text-center"
                      >
                        2. Mock GPS 감지
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartGpsScan("OUT_OF_RANGE")}
                        className="py-1.5 px-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-[10px] font-bold text-amber-300 transition-colors cursor-pointer text-center"
                      >
                        3. 150m 초과 (420m)
                      </button>
                    </div>
                  </div>

                  {/* GPS 시뮬레이션 상태 디스플레이 */}
                  {gpsSimState === "SCANNING" && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-cyan-300 font-bold">위성 삼각측량 및 모의 위치(Mock) 무결성 검사 중...</p>
                    </div>
                  )}

                  {gpsSimState === "SUCCESS" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl space-y-1"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>학교 현장 반경 35m 이내 감지 (검증 통과)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        • Mock GPS 미감지 (정상 단말기)<br />
                        • 특권: <strong>풀 권한 + 타인 보증 자격(2회 Voucher)</strong> 부여!
                      </p>
                    </motion.div>
                  )}

                  {gpsSimState === "MOCK_DETECTED" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-500/15 border border-rose-500/50 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-black">
                        <ShieldAlert className="w-4 h-4" />
                        <span>경고: Mock GPS(가짜 모의 위치 앱) 감지됨</span>
                      </div>
                      <p className="text-[11px] text-rose-200 leading-relaxed">
                        비정상 모의 위치 앱이 감지되어 현장 인증이 차단되었습니다. 허위 인증 시도는 영구 제재 대상입니다.
                      </p>
                    </motion.div>
                  )}

                  {gpsSimState === "OUT_OF_RANGE" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-500/15 border border-amber-500/50 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
                        <AlertTriangle className="w-4 h-4" />
                        <span>인증 실패: 학교 반경 150m 외부 (현재 420m)</span>
                      </div>
                      <p className="text-[11px] text-amber-200 leading-relaxed">
                        현재 학교 현장에 위치하지 않습니다. 원격 인증을 위해 <strong>[Route B: 친구 2명 보증]</strong>으로 전환하세요.
                      </p>
                      <button
                        type="button"
                        onClick={() => setVerifyRoute("B")}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-black transition-colors cursor-pointer"
                      >
                        👉 Route B (친구 2명 보증)로 전환하기
                      </button>
                    </motion.div>
                  )}

                  {gpsSimState === "IDLE" && (
                    <button
                      type="button"
                      onClick={() => handleStartGpsScan("NORMAL")}
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>현재 위치로 학교 현장 GPS 측정 시작</span>
                    </button>
                  )}
                </div>
              )}

              {/* ROUTE B: 친구 2명 보증 화면 */}
              {verifyRoute === "B" && (
                <div className="p-4 bg-slate-950 border border-purple-500/20 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>재학생 2명 보증 네트워크 (신뢰 기반)</span>
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold">2인 서명 필수</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 truncate">
                      https://battle.study/verify?ref=chk_7429
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCopiedLink(true);
                        setTimeout(() => setIsCopiedLink(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopiedLink ? "복사됨!" : "링크 복사"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      friend1Accepted ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}>
                      <div className="text-xs font-bold">
                        <span>친구 1: 김민수 (청계중 3학년 기인증자)</span>
                        <span className="block text-[10px] text-slate-400">보증 쿼터 잔여 2회 확인</span>
                      </div>
                      {friend1Accepted ? (
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 수락 완료
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFriend1Accepted(true)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg cursor-pointer"
                        >
                          수락 시뮬레이션
                        </button>
                      )}
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      friend2Accepted ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}>
                      <div className="text-xs font-bold">
                        <span>친구 2: 이서연 (청계중 3학년 기인증자)</span>
                        <span className="block text-[10px] text-slate-400">친구 1과 다른 사용자 확인</span>
                      </div>
                      {friend2Accepted ? (
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 수락 완료
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setFriend2Accepted(true)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg cursor-pointer"
                        >
                          수락 시뮬레이션
                        </button>
                      )}
                    </div>
                  </div>

                  {friend1Accepted && friend2Accepted && (
                    <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[11px] text-purple-300">
                      ✨ <strong>보증 검증 완료</strong>: 풀 권한이 부여됩니다. (어뷰징 방지 보안 정책상 <strong>타인 보증 자격은 유보</strong>됩니다.)
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 Navigation */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setVerifyStep(2)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={
                    verifyRoute === "A"
                      ? gpsSimState !== "SUCCESS"
                      : !(friend1Accepted && friend2Accepted)
                  }
                  onClick={() => setVerifyStep(4)}
                  className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>검증 완료: 소속 확정 (Lock)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 소속 학교 확정 (Lock) 완료 카드 */}
          {verifyStep === 4 && (
            <div className="space-y-4 pt-1">
              <div className="p-5 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-3xl text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 text-indigo-300 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    Official Student Verification
                  </span>
                  <h4 className="text-xl font-black text-white mt-1.5">
                    [{verifySchool}] 소속 확정 완료
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    닉네임: <strong className="text-cyan-400 font-bold">{verifyNickname}</strong> • 90일 소속 락 적용
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>인증 방식:</span>
                    <strong className="text-white font-bold">
                      {verifyRoute === "A" ? "Route A (GPS 현장 35m 인증)" : "Route B (친구 2명 보증)"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>소속 락(Lock) 기간:</span>
                    <strong className="text-amber-400 font-mono font-bold">2026.04.13 ~ 2026.07.12 (90일)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>학교 대항전 참여 자격:</span>
                    <strong className="text-emerald-400 font-bold">정식 국가공인 자격 부여 ✓</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>타인 보증 권한(Voucher):</span>
                    <strong className={verifyRoute === "A" ? "text-cyan-400 font-bold" : "text-slate-500 font-bold"}>
                      {verifyRoute === "A" ? "2회 부여 (GPS 인증자 특권)" : "유보 (부정 방지 정책)"}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteVerification}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>배틀스터디 아레나 메인 로비 입장하기</span>
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 group-hover:animate-bounce" />
              </button>
            </div>
          )}

          {/* Quick Direct Bypass for Demo Judge (심사위원 빠른 체험) */}
          <div className="pt-2 border-t border-slate-800/60 text-center">
            <button
              type="button"
              onClick={() => onJoin("대치동불주먹", "청계중학교")}
              className="text-[11px] text-slate-500 hover:text-slate-300 font-bold underline transition-colors cursor-pointer"
            >
              ⏱️ 심사위원 1초 빠른 체험 (청계중 대치동불주먹으로 바로 입장)
            </button>
          </div>
        </motion.div>
      </div>

      {/* 🏛️ 배틀스터디 에듀 (공교육 모드) 전용 로그인 모달 */}
      <AnimatePresence>
        {showEduModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative text-left space-y-5 text-white"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        공교육 전용
                      </span>
                      <h3 className="text-lg font-black text-white">
                        배틀스터디 에듀
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      학교 학사 연계 및 수학 수행평가 관리 시스템
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Student vs Teacher Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEduTab("STUDENT")}
                  className={`py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    eduTab === "STUDENT"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>🎓 학생 모드 로그인</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEduTab("TEACHER")}
                  className={`py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    eduTab === "TEACHER"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>👩‍🏫 교사 모드 로그인</span>
                </button>
              </div>

              {/* TAB 1: 학생 모드 Form */}
              {eduTab === "STUDENT" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">소속 학교</label>
                    <select
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                    >
                      {MIDDLE_SCHOOLS.map((sch) => (
                        <option key={sch} value={sch} className="bg-slate-900 text-white">
                          {sch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">학년</label>
                      <select
                        value={eduGrade}
                        onChange={(e) => setEduGrade(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="3">3학년</option>
                        <option value="2">2학년</option>
                        <option value="1">1학년</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">학급 (반)</label>
                      <select
                        value={eduClass}
                        onChange={(e) => handleStudentClassNumChange(e.target.value, eduStudentNum)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="1">1반</option>
                        <option value="2">2반</option>
                        <option value="3">3반</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">출석 번호</label>
                      <select
                        value={eduStudentNum}
                        onChange={(e) => handleStudentClassNumChange(eduClass, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium font-mono"
                      >
                        {[1, 2, 3, 4, 5, 7, 8, 12, 15, 20, 25, 30].map((num) => (
                          <option key={num} value={String(num)}>
                            {num}번
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 font-bold">학생 이름</label>
                      {isAutoFilled && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          ✨ 학적부 DB 자동 매칭 완료
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={eduName}
                      onChange={(e) => {
                        setEduName(e.target.value);
                        setIsAutoFilled(false);
                      }}
                      placeholder="예: 박윤하"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">학교 인증 코드</label>
                    <input
                      type="text"
                      value={eduSchoolCode}
                      onChange={(e) => setEduSchoolCode(e.target.value)}
                      placeholder="예: CHK-2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium font-mono uppercase"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEduModal(false)}
                      className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEduModal(false);
                        router.push("/public-edu");
                      }}
                      className="w-2/3 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                    >
                      <span>배틀스터디 에듀 학생 포털 입장</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: 교사 모드 Form */}
              {eduTab === "TEACHER" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">소속 학교</label>
                    <select
                      value={teacherSchool}
                      onChange={(e) => setTeacherSchool(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                    >
                      <option value="청계중학교">청계중학교 (수학과 전용)</option>
                      <option value="대청중학교">대청중학교</option>
                      <option value="휘문중학교">휘문중학교</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">교원 인증 ID</label>
                    <input
                      type="text"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      placeholder="교원 ID"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">비밀번호</label>
                    <input
                      type="password"
                      value={teacherPw}
                      onChange={(e) => setTeacherPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium font-mono"
                    />
                  </div>

                  {/* Demo Information Notice */}
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-[11px] leading-relaxed">
                    💡 <strong>데모 시연 안내</strong>: 청계중학교 3학년 수학과 전용 교사용 계정으로 자동 세팅되어 있습니다. 바로 입장하시면 AI 수행평가 출제 및 2단계 채점 대시보드를 확인하실 수 있습니다.
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEduModal(false)}
                      className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEduModal(false);
                        if (onGoToTeacherDashboard) {
                          onGoToTeacherDashboard();
                        } else {
                          router.push("/teacher");
                        }
                      }}
                      className="w-2/3 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5"
                    >
                      <span>배틀스터디 에듀 교사 대시보드 입장</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

