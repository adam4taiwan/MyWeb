'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';
import { TOPICS, TRIGRAMS, EARTHLY_BRANCHES, ORACLE_POEMS, BRANCH_TIMING } from './data';

type Step = 'intro' | 'step1' | 'step2' | 'confirm2' | 'step3' | 'result';

// Topic groups: 8 rows of 8
const TOPIC_GROUPS = [
  { label: '天象・學業', indices: [0,1,2,3,4,5,6,7] },
  { label: '居住・人事', indices: [8,9,10,11,12,13,14,15] },
  { label: '財物・生計', indices: [16,17,18,19,20,21,22,23] },
  { label: '農事・出行', indices: [24,25,26,27,28,29,30,31] },
  { label: '商貿・官事', indices: [32,33,34,35,36,37,38,39] },
  { label: '仕途・婚育', indices: [40,41,42,43,44,45,46,47] },
  { label: '產業・訟事', indices: [48,49,50,51,52,53,54,55] },
  { label: '壽命・家事', indices: [56,57,58,59,60,61,62,63] },
];

// Highlight earthly branches found in a poem text
function highlightBranches(poem: string, drawnBranch: string): React.ReactNode[] {
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < poem.length) {
    const char = poem[i];
    if (branches.includes(char)) {
      const isDrawn = char === drawnBranch;
      parts.push(
        <span
          key={i}
          className={isDrawn
            ? 'font-bold text-amber-200 underline decoration-amber-400 decoration-2 px-0.5'
            : 'text-amber-400/80'}
        >
          {char}
        </span>
      );
    } else {
      parts.push(char);
    }
    i++;
  }
  return parts;
}

function branchInPoem(poem: string, branch: string): boolean {
  return poem.includes(branch);
}

// Slot reel component (used for trigram only)
function SlotReel({
  items,
  spinning,
  currentIndex,
  itemHeight = 72,
}: {
  items: string[];
  spinning: boolean;
  currentIndex: number;
  itemHeight?: number;
}) {
  const visibleCount = 5;
  const halfVisible = Math.floor(visibleCount / 2);

  const displayItems = Array.from({ length: visibleCount }, (_, i) => {
    const offset = i - halfVisible;
    const idx = ((currentIndex + offset) % items.length + items.length) % items.length;
    return { item: items[idx], offset };
  });

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: itemHeight * visibleCount }}
    >
      <div className="absolute inset-x-0 top-0 h-16 z-10 bg-gradient-to-b from-[#0d0800] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-[#0d0800] to-transparent pointer-events-none" />
      <div
        className="absolute inset-x-0 z-20 pointer-events-none border-y border-amber-500/50"
        style={{
          top: itemHeight * halfVisible,
          height: itemHeight,
          background: 'rgba(200,164,74,0.08)',
          boxShadow: '0 0 20px rgba(200,164,74,0.15) inset',
        }}
      />
      <div className="flex flex-col transition-none" style={{ willChange: 'transform' }}>
        {displayItems.map(({ item, offset }, i) => {
          const isCenter = offset === 0;
          const dist = Math.abs(offset);
          return (
            <div
              key={i}
              className="flex items-center justify-center font-bold transition-all duration-100"
              style={{
                height: itemHeight,
                fontSize: isCenter ? '2rem' : dist === 1 ? '1.4rem' : '1rem',
                color: isCenter ? '#f0d080' : dist === 1 ? 'rgba(200,164,74,0.6)' : 'rgba(200,164,74,0.25)',
                letterSpacing: '0.1em',
                textShadow: isCenter ? '0 0 20px rgba(200,164,74,0.8)' : 'none',
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
      {spinning && (
        <div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 20%, rgba(200,164,74,0.03) 50%, transparent 80%)',
            animation: 'shimmer 0.3s linear infinite',
          }}
        />
      )}
    </div>
  );
}

export default function DivinationPage() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || 'zh-TW';

  const [step, setStep] = useState<Step>('intro');
  const [entered, setEntered] = useState(false);
  const [topicIndex, setTopicIndex] = useState<number | null>(null);
  const [trigramIndex, setTrigramIndex] = useState(0);
  const [branchStr, setBranchStr] = useState('');
  const [branchDisplayIndex, setBranchDisplayIndex] = useState(0);

  // Reel 2 - spinning state
  const reel2Ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const [reel2Current, setReel2Current] = useState(0);
  const [reel2Spinning, setReel2Spinning] = useState(false);
  const reel2SpeedRef = useRef(60);
  const reel2StoppingRef = useRef(false);

  // Branch animation
  const branchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [branchSpinning, setBranchSpinning] = useState(false);

  // Scroll to top and trigger entry animation
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSelectTopic = (idx: number) => {
    setTopicIndex(idx);
  };

  const confirmTopic = () => {
    startReel2();
  };

  // Start reel 2
  const startReel2 = useCallback(() => {
    setStep('step2');
    setReel2Spinning(true);
    reel2SpeedRef.current = 60;
    reel2StoppingRef.current = false;

    const tick = () => {
      if (reel2StoppingRef.current) return;
      setReel2Current(prev => (prev + 1) % TRIGRAMS.length);
      reel2Ref.current = setTimeout(tick, reel2SpeedRef.current);
    };
    reel2Ref.current = setTimeout(tick, reel2SpeedRef.current);
  }, []);

  // Stop reel 2
  const stopReel2 = useCallback(() => {
    if (reel2StoppingRef.current) return;
    reel2StoppingRef.current = true;
    if (reel2Ref.current) clearTimeout(reel2Ref.current);

    let speed = 80;
    const finalTarget = Math.floor(Math.random() * TRIGRAMS.length);

    const decel = () => {
      speed = Math.min(speed * 1.4, 500);
      setReel2Current(prev => (prev + 1) % TRIGRAMS.length);
      if (speed < 500) {
        setTimeout(decel, speed);
      } else {
        setReel2Current(finalTarget);
        setTrigramIndex(finalTarget);
        setReel2Spinning(false);
        setTimeout(() => setStep('confirm2'), 300);
      }
    };
    decel();
  }, []);

  // Start branch draw (auto)
  const startBranchDraw = useCallback(() => {
    setStep('step3');
    setBranchSpinning(true);
    let count = 0;
    const totalCycles = 20 + Math.floor(Math.random() * 15);
    const finalIdx = Math.floor(Math.random() * EARTHLY_BRANCHES.length);

    const tick = () => {
      count++;
      setBranchDisplayIndex(prev => (prev + 1) % EARTHLY_BRANCHES.length);
      if (count < totalCycles) {
        const delay = count < totalCycles * 0.5 ? 80 : count < totalCycles * 0.8 ? 150 : 280;
        branchRef.current = setTimeout(tick, delay);
      } else {
        setBranchDisplayIndex(finalIdx);
        setBranchStr(EARTHLY_BRANCHES[finalIdx]);
        setBranchSpinning(false);
        setTimeout(() => setStep('result'), 800);
      }
    };
    branchRef.current = setTimeout(tick, 80);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reel2Ref.current) clearTimeout(reel2Ref.current);
      if (branchRef.current) clearTimeout(branchRef.current);
    };
  }, []);

  // Compute oracle result
  const getOracleResult = () => {
    if (topicIndex === null) return null;
    const topic = TOPICS[topicIndex];
    const trigramNum = TRIGRAMS[trigramIndex].num;

    // Each oracle number applies the cycle permutation f once to (group, pos):
    // cycle: 1->6->7->4->5->3->8->2->1
    const f = [0, 6, 1, 8, 5, 3, 7, 4, 2]; // 1-indexed; f[0] unused
    const applyF = (x: number, n: number) => {
      let v = x;
      for (let i = 0; i < n; i++) v = f[v];
      return v;
    };
    const group = Math.floor(topicIndex / 8) + 1;
    const pos = (topicIndex % 8) + 1;
    const n = trigramNum - 1;
    const code = `${trigramNum}${applyF(group, n)}${applyF(pos, n)}`;

    const oracle = ORACLE_POEMS[code];
    return { topic, trigram: TRIGRAMS[trigramIndex], code, oracle };
  };

  // Reset everything
  const reset = () => {
    if (reel2Ref.current) clearTimeout(reel2Ref.current);
    if (branchRef.current) clearTimeout(branchRef.current);
    setStep('intro');
    setTopicIndex(null);
    setReel2Current(0);
    setBranchDisplayIndex(0);
    setBranchStr('');
    setReel2Spinning(false);
    setBranchSpinning(false);
    reel2StoppingRef.current = false;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0800' }}>
      <Header />

      <main className="flex-grow relative overflow-hidden">
        {/* Background atmospheric elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(160,80,0,0.15) 0%, transparent 70%)' }}
          />
          <div className="absolute left-[15%] top-0 w-px h-screen opacity-10"
            style={{ background: 'linear-gradient(to bottom, #c8a44a, transparent)', animation: 'float 6s ease-in-out infinite' }} />
          <div className="absolute right-[15%] top-0 w-px h-screen opacity-10"
            style={{ background: 'linear-gradient(to bottom, #c8a44a, transparent)', animation: 'float 8s ease-in-out infinite reverse' }} />
        </div>

        <div
          className="relative z-10 max-w-lg mx-auto px-4 py-12 flex flex-col items-center"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >

          {/* ── INTRO ── */}
          {step === 'intro' && (
            <div className="w-full flex flex-col items-center text-center">
              <div className="mb-2 text-amber-500/60 tracking-[0.5em] text-xs uppercase">
                玉洞子 · 先天占卜
              </div>
              <div className="text-amber-600/40 text-2xl tracking-widest mb-4">
                ◈─────────◈
              </div>
              <h1
                className="text-5xl font-bold mb-3 leading-tight"
                style={{
                  color: '#f0d080',
                  textShadow: '0 0 40px rgba(200,164,74,0.6), 0 0 80px rgba(200,164,74,0.2)',
                  letterSpacing: '0.15em',
                }}
              >
                祖師顯靈
              </h1>
              <h2
                className="text-3xl font-bold mb-8"
                style={{
                  color: '#d4a050',
                  textShadow: '0 0 20px rgba(200,164,74,0.4)',
                  letterSpacing: '0.2em',
                }}
              >
                有求必應
              </h2>
              <div className="text-amber-600/40 text-2xl tracking-widest mb-8">
                ◈─────────◈
              </div>
              <p className="text-amber-200/60 text-sm leading-loose mb-8 max-w-xs">
                以卦問事，自古靈驗，<br />
                有求必應，誠心一問，<br />
                天機自現。
              </p>

              {!isAuthenticated ? (
                <div className="w-full flex flex-col gap-4 items-center">
                  <div
                    className="w-full p-6 rounded-lg text-center"
                    style={{
                      background: 'linear-gradient(135deg, #1a0d00 0%, #2a1500 100%)',
                      border: '1px solid rgba(200,164,74,0.4)',
                      boxShadow: '0 0 30px rgba(200,164,74,0.15)',
                    }}
                  >
                    <div className="text-amber-400 text-lg font-bold mb-2" style={{ letterSpacing: '0.1em' }}>
                      加入會員
                    </div>
                    <div className="text-amber-200/70 text-sm mb-4">
                      免費為您占卜一次
                    </div>
                    <Link
                      href={`/${locale}/login?redirect=/divination`}
                      className="inline-block px-8 py-3 rounded font-bold text-[#0d0800] text-sm tracking-widest transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #c8a44a 0%, #f0d080 50%, #c8a44a 100%)',
                        boxShadow: '0 0 20px rgba(200,164,74,0.4)',
                      }}
                    >
                      立即免費加入
                    </Link>
                  </div>
                  <div className="text-amber-600/40 text-xs">
                    已有帳號？
                    <Link href={`/${locale}/login?redirect=/divination`} className="text-amber-500/60 underline ml-1">
                      登入後占卜
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setStep('step1')}
                  className="px-12 py-4 rounded font-bold text-[#0d0800] text-lg tracking-widest transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #c8a44a 0%, #f0d080 50%, #c8a44a 100%)',
                    boxShadow: '0 0 30px rgba(200,164,74,0.5)',
                    letterSpacing: '0.2em',
                  }}
                >
                  叩問天機
                </button>
              )}

              <div className="mt-10 text-amber-700/40 text-xs leading-relaxed text-center">
                選問事類別 → 定卦數 → 天抽地支 → 顯示卦詩
              </div>
            </div>
          )}

          {/* ── STEP 1: 問事類別（手動選擇）── */}
          {step === 'step1' && (
            <div className="w-full flex flex-col items-center">
              <StepHeader step={1} title="選擇問事類別" desc="心中默想所問之事，點選對應類別" />

              <div className="w-full mt-4 space-y-3">
                {TOPIC_GROUPS.map((group, gi) => (
                  <div key={gi}>
                    <div className="text-amber-700/50 text-xs tracking-widest mb-1.5 pl-1">{group.label}</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {group.indices.map(idx => {
                        const topic = TOPICS[idx];
                        const isSelected = topicIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectTopic(idx)}
                            className="py-2 rounded text-xs font-bold tracking-wider transition-all active:scale-95"
                            style={{
                              background: isSelected
                                ? 'linear-gradient(135deg, #c8a44a 0%, #f0d080 100%)'
                                : 'rgba(200,164,74,0.06)',
                              border: isSelected
                                ? '1px solid #f0d080'
                                : '1px solid rgba(200,164,74,0.2)',
                              color: isSelected ? '#0d0800' : 'rgba(200,164,74,0.8)',
                              boxShadow: isSelected ? '0 0 12px rgba(200,164,74,0.4)' : 'none',
                            }}
                          >
                            {topic.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirm bar */}
              <div className="sticky bottom-4 mt-6 w-full flex flex-col items-center gap-3">
                {topicIndex !== null && (
                  <div
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg"
                    style={{
                      background: 'rgba(200,164,74,0.12)',
                      border: '1px solid rgba(200,164,74,0.4)',
                    }}
                  >
                    <span className="text-amber-300 text-sm">
                      已選：<span className="font-bold text-amber-100">{TOPICS[topicIndex].name}</span>
                    </span>
                    <span className="text-amber-600/60 text-xs">{TOPICS[topicIndex].desc}</span>
                  </div>
                )}
                <GoldButton
                  onClick={confirmTopic}
                  label="確定，起卦"
                  disabled={topicIndex === null}
                />
                <TextButton onClick={reset} label="返回" />
              </div>
            </div>
          )}

          {/* ── STEP 2: 八卦占數（隨機轉盤）── */}
          {(step === 'step2' || step === 'confirm2') && (
            <div className="w-full flex flex-col items-center">
              <StepHeader step={2} title="天定卦數" desc="心中默想一個數字，點擊「定！」停輪" />

              {topicIndex !== null && (
                <div className="mb-4 text-amber-600/50 text-xs tracking-widest">
                  問事：{TOPICS[topicIndex].name}
                </div>
              )}

              <div
                className="w-72 my-6 rounded-xl overflow-hidden"
                style={{
                  background: '#0d0800',
                  border: '2px solid rgba(200,164,74,0.5)',
                  boxShadow: '0 0 40px rgba(200,164,74,0.2), inset 0 0 20px rgba(0,0,0,0.5)',
                }}
              >
                <SlotReel
                  items={TRIGRAMS.map(t => `${t.name}${t.num} ${t.element}`)}
                  spinning={reel2Spinning}
                  currentIndex={reel2Current}
                />
              </div>

              {step === 'confirm2' && (
                <div className="mb-4 text-amber-300/70 text-sm text-center">
                  {TRIGRAMS[trigramIndex].direction}方 · {TRIGRAMS[trigramIndex].element}卦
                </div>
              )}

              {step === 'step2' && (
                <GoldButton onClick={stopReel2} label="定！" />
              )}
              {step === 'confirm2' && (
                <div className="flex flex-col items-center gap-3">
                  <ConfirmBadge label={`占數：${TRIGRAMS[trigramIndex].name} ${TRIGRAMS[trigramIndex].num}`} />
                  <GoldButton onClick={startBranchDraw} label="確定，天抽地支" />
                  <TextButton onClick={() => { setStep('step2'); startReel2(); }} label="重新選擇" />
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: 地支抽取 ── */}
          {step === 'step3' && (
            <div className="w-full flex flex-col items-center">
              <StepHeader step={3} title="天抽地支" desc="祖師代為抽取，靜候天機..." />

              <div className="my-10 relative flex items-center justify-center">
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 220, height: 220,
                    background: 'radial-gradient(circle, rgba(200,164,74,0.1) 0%, transparent 70%)',
                    border: '1px solid rgba(200,164,74,0.2)',
                    animation: 'spin 8s linear infinite',
                  }}
                />
                <div
                  className="relative rounded-full flex flex-col items-center justify-center"
                  style={{
                    width: 160, height: 160,
                    background: 'radial-gradient(circle, #1a0d00 0%, #0d0800 100%)',
                    border: '2px solid rgba(200,164,74,0.6)',
                    boxShadow: '0 0 40px rgba(200,164,74,0.3), inset 0 0 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    className="font-bold"
                    style={{
                      fontSize: '4rem', color: '#f0d080',
                      textShadow: '0 0 30px rgba(200,164,74,0.9)',
                      lineHeight: 1,
                      transition: branchSpinning ? 'none' : 'all 0.5s ease',
                    }}
                  >
                    {EARTHLY_BRANCHES[branchDisplayIndex]}
                  </div>
                  <div className="text-amber-600/60 text-xs mt-1">地支</div>
                </div>
              </div>

              <p className="text-amber-600/50 text-sm animate-pulse">祖師降乩中...</p>
            </div>
          )}

          {/* ── RESULT ── */}
          {step === 'result' && (() => {
            const result = getOracleResult();
            if (!result) return null;
            const { topic, trigram, code, oracle } = result;
            const hasOraclePoem = !!oracle;
            const branchFound = hasOraclePoem && branchInPoem(oracle.poem, branchStr);

            return (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="text-amber-500/60 text-xs tracking-[0.3em] mb-4">
                  先天占卜・占卜結果
                </div>

                <div className="flex gap-3 mb-6 flex-wrap justify-center">
                  <Badge color="amber" label={`問：${topic.name}`} />
                  <Badge color="red" label={`卦：${trigram.name}${trigram.num}`} />
                  <Badge color="gold" label={`地支：${branchStr}`} />
                </div>

                <div
                  className="w-full rounded-xl p-6 mb-6"
                  style={{
                    background: 'linear-gradient(160deg, #1a0d00 0%, #120900 100%)',
                    border: '1px solid rgba(200,164,74,0.4)',
                    boxShadow: '0 0 50px rgba(200,164,74,0.15)',
                  }}
                >
                  <div className="text-center mb-5">
                    <div className="text-amber-600/40 text-xs tracking-widest mb-1">卦碼 {code}</div>
                    <div
                      className="text-3xl font-bold"
                      style={{ color: '#f0d080', textShadow: '0 0 20px rgba(200,164,74,0.6)', letterSpacing: '0.2em' }}
                    >
                      {hasOraclePoem ? `${oracle.hexagram}卦` : `卦碼 ${code}`}
                    </div>
                  </div>

                  <div className="text-amber-600/30 text-center text-lg tracking-widest mb-5">
                    ──── ◈ ────
                  </div>

                  {hasOraclePoem ? (
                    <div className="space-y-3">
                      {oracle.poem.split(',').map((line, i) => (
                        <p
                          key={i}
                          className="text-center text-lg leading-loose tracking-wider"
                          style={{ color: '#e8c870', fontFamily: 'serif' }}
                        >
                          {highlightBranches(line.replace('.',''), branchStr)}
                          {i < oracle.poem.split(',').length - 1 ? '，' : '。'}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-amber-600/50 text-sm text-center">
                      此卦詩尚待收錄，請再請示祖師。
                    </p>
                  )}
                </div>

                <div
                  className="w-full rounded-xl p-5 mb-6"
                  style={{
                    background: branchFound
                      ? 'linear-gradient(135deg, #1a1000 0%, #2a1800 100%)'
                      : 'linear-gradient(135deg, #100a00 0%, #180e00 100%)',
                    border: branchFound
                      ? '1px solid rgba(200,164,74,0.5)'
                      : '1px solid rgba(200,164,74,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold" style={{ color: '#f0d080', textShadow: '0 0 15px rgba(200,164,74,0.8)' }}>
                      {branchStr}
                    </span>
                    <div>
                      <div className="text-amber-400 text-sm font-bold">地支時機</div>
                      <div className="text-amber-700/60 text-xs">{BRANCH_TIMING[branchStr]}</div>
                    </div>
                  </div>
                  {hasOraclePoem && (
                    branchFound ? (
                      <div className="text-amber-200/80 text-sm leading-relaxed border-t border-amber-800/30 pt-3">
                        <span className="text-amber-400 font-bold">應時有應：</span>
                        詩中見「{branchStr}」，祖師示意此支所對應之時期，
                        正是此事應驗之時機，宜把握。
                      </div>
                    ) : (
                      <div className="text-amber-600/50 text-sm leading-relaxed border-t border-amber-900/20 pt-3">
                        <span className="text-amber-700/60 font-bold">時機待機：</span>
                        詩中未見「{branchStr}」，示意此支所對應時期尚非最佳時機，
                        宜靜觀其變，待時而動。
                      </div>
                    )
                  )}
                </div>

                <div className="text-amber-700/40 text-xs text-center mb-8 leading-relaxed">
                  本次問卜：{topic.desc}<br />
                  卦數：{trigram.element}（{trigram.direction}方）占數第 {trigram.num}
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <GoldButton onClick={reset} label="再問一卦" />
                  <TextButton
                    onClick={() => window.location.href = `/${locale}/consultation`}
                    label="欲深入鑑定，預約諮詢"
                  />
                </div>

                <p className="text-amber-900/40 text-xs text-center mt-8 leading-loose max-w-xs">
                  占卜僅供參考，如遇人生重大決策，
                  建議與命理師深入鑑定。
                </p>
              </div>
            );
          })()}
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateX(0) scaleX(1); opacity: 0.08; }
          50% { transform: translateX(3px) scaleX(1.5); opacity: 0.15; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { opacity: 0; transform: translateY(-100%); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}

// Sub-components

function StepHeader({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="text-center mb-2">
      <div className="text-amber-600/50 text-xs tracking-widest mb-1">
        第{['一','二','三'][step-1]}步
      </div>
      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: '#f0d080', letterSpacing: '0.15em', textShadow: '0 0 15px rgba(200,164,74,0.5)' }}
      >
        {title}
      </h2>
      <p className="text-amber-600/50 text-sm">{desc}</p>
    </div>
  );
}

function GoldButton({ onClick, label, disabled = false }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-10 py-3 rounded font-bold text-[#0d0800] tracking-widest transition-all hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: 'linear-gradient(135deg, #c8a44a 0%, #f0d080 50%, #c8a44a 100%)',
        boxShadow: disabled ? 'none' : '0 0 25px rgba(200,164,74,0.4)',
        letterSpacing: '0.2em',
      }}
    >
      {label}
    </button>
  );
}

function TextButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-amber-700/50 text-sm underline hover:text-amber-600/70 transition-colors"
    >
      {label}
    </button>
  );
}

function ConfirmBadge({ label }: { label: string }) {
  return (
    <div
      className="px-6 py-2 rounded-full text-sm font-bold tracking-wider"
      style={{
        background: 'rgba(200,164,74,0.1)',
        border: '1px solid rgba(200,164,74,0.4)',
        color: '#f0d080',
      }}
    >
      {label}
    </div>
  );
}

function Badge({ color, label }: { color: 'amber' | 'red' | 'gold'; label: string }) {
  const styles = {
    amber: { bg: 'rgba(180,100,20,0.2)', border: 'rgba(180,100,20,0.4)', color: '#d4a050' },
    red: { bg: 'rgba(160,40,10,0.2)', border: 'rgba(160,40,10,0.4)', color: '#e07050' },
    gold: { bg: 'rgba(200,164,74,0.15)', border: 'rgba(200,164,74,0.5)', color: '#f0d080' },
  }[color];

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color }}
    >
      {label}
    </span>
  );
}
