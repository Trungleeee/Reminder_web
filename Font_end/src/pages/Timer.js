import { useState, useEffect, useRef, useCallback } from "react";
import "./Timer.css";

/* ─── Helpers ─── */
function fmtMs(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const d = Math.floor((ms % 1000) / 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
}

function fmtPomo(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ─── Web Audio beep ─── */
function playBeep(ctx, type = "finish") {
  if (!ctx) return;
  const freqs  = type === "finish" ? [523, 659, 784, 1047] : [440, 440];
  const delays = type === "finish" ? [0, 0.15, 0.30, 0.45] : [0, 0.25];
  freqs.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = "sine";
    const t = ctx.currentTime + delays[i];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t); osc.stop(t + 0.36);
  });
}

function playTickBeep(ctx) {
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = 880; osc.type = "sine";
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.start(t); osc.stop(t + 0.09);
}

/* ─── Pomodoro config ─── */
const POMO_PRESETS = [
  { label: "25 / 5",  work: 25, rest: 5  },
  { label: "50 / 10", work: 50, rest: 10 },
  { label: "90 / 20", work: 90, rest: 20 },
];

const CIRC = 2 * Math.PI * 88;

function StopwatchTab({ audioCtx, soundOn }) {
  const [running,  setRunning]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [laps,     setLaps]     = useState([]);

  const startRef   = useRef(0);
  const elapsedRef = useRef(0);
  const lapRef     = useRef(0);
  const frameRef   = useRef(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsedRef.current;
      const tick = () => {
        const now = Date.now() - startRef.current;
        elapsedRef.current = now;
        setElapsed(now);
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [running]);

  const toggle = () => setRunning((r) => !r);

  const recordLap = () => {
    if (!running && elapsed === 0) return;
    if (soundOn) playTickBeep(audioCtx.current);
    const lapTime = elapsed - lapRef.current;
    setLaps((prev) => [...prev, { total: elapsed, lap: lapTime }]);
    lapRef.current = elapsed;
  };

  const reset = () => {
    setRunning(false); setElapsed(0);
    elapsedRef.current = 0; lapRef.current = 0; setLaps([]);
  };

  const pct    = (elapsed % 60000) / 60000;
  const offset = CIRC - pct * CIRC;
  const currentLapTime = elapsed - lapRef.current;

  return (
    <div className="sw-panel">
      <div className="sw-left">
        <div className="sw-clock-wrap">
          {/* Outer glow ring when running */}
          {running && <div className="sw-glow-ring" />}

          <svg viewBox="0 0 200 200" className="sw-svg">
            <defs>
              <linearGradient id="swGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#56ab2f"/>
                <stop offset="100%" stopColor="#3a7d44"/>
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="100" cy="100" r="88" fill="none"
              stroke="rgba(58,125,68,0.12)" strokeWidth="10"/>
            {/* Progress */}
            <circle cx="100" cy="100" r="88" fill="none"
              stroke="url(#swGrad)"
              strokeWidth="10"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: running ? "none" : "stroke-dashoffset 0.3s" }}
            />
            {/* Inner frosted disc */}
            <circle cx="100" cy="100" r="72" fill="rgba(255,255,255,0.6)"/>
          </svg>

          <div className="sw-clock-inner">
            <div className={`sw-time${running ? " sw-time--ticking" : ""}`}>{fmtMs(elapsed)}</div>
            {laps.length > 0 && (
              <div className="sw-lap-cur">
                <span className="sw-lap-label">Vòng</span>
                {fmtMs(currentLapTime)}
              </div>
            )}
          </div>
        </div>

        <div className="sw-btns">
          <button className={`sw-btn ${running ? "sw-btn--stop" : "sw-btn--start"}`} onClick={toggle}>
            <span className="sw-btn-icon">{running ? "⏸" : "▶"}</span>
            {running ? "Dừng" : elapsed > 0 ? "Tiếp tục" : "Bắt đầu"}
          </button>
          <button className="sw-btn sw-btn--lap" onClick={recordLap} disabled={!running && elapsed === 0}>
            <span className="sw-btn-icon">🏁</span>Vòng
          </button>
          <button className="sw-btn sw-btn--reset" onClick={reset}>
            <span className="sw-btn-icon">↺</span>Reset
          </button>
        </div>
      </div>

      <div className="sw-right">
        <div className="sw-hist-title">
          Lịch sử bấm giờ
          {laps.length > 0 && <span className="sw-hist-count">{laps.length}</span>}
        </div>
        {laps.length === 0 ? (
          <div className="sw-empty">
            <div className="sw-empty-icon">⏱</div>
            Chưa có dữ liệu.<br/>Nhấn <b>Bắt đầu</b> rồi <b>Vòng</b> để ghi lại.
          </div>
        ) : (
          <div className="sw-hist-list">
            {[...laps].reverse().map((l, i) => {
              const n = laps.length - i;
              const fastest = laps.reduce((a, b) => a.lap < b.lap ? a : b);
              const slowest = laps.reduce((a, b) => a.lap > b.lap ? a : b);
              const isFast  = laps.length > 1 && l.lap === fastest.lap;
              const isSlow  = laps.length > 1 && l.lap === slowest.lap;
              return (
                <div
                  className={`sw-hist-item${isFast ? " sw-hist--fast" : isSlow ? " sw-hist--slow" : ""}`}
                  key={n}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="sw-hist-num">
                    <span className="sw-hist-lap-n">#{n}</span>
                    {isFast && <span className="sw-hist-badge sw-badge--fast">↑ nhanh</span>}
                    {isSlow && <span className="sw-hist-badge sw-badge--slow">↓ chậm</span>}
                  </div>
                  <div className="sw-hist-cols">
                    <div className="sw-hist-time">{fmtMs(l.total)}</div>
                    <div className="sw-hist-diff">+{fmtMs(l.lap)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PomodoroTab({ audioCtx, soundOn }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [phase,     setPhase]     = useState("work");
  const [running,   setRunning]   = useState(false);
  const [remaining, setRemaining] = useState(POMO_PRESETS[0].work * 60 * 1000);
  const [session,   setSession]   = useState(1);
  const [history,   setHistory]   = useState([]);
  const [flash,     setFlash]     = useState(false);

  const preset    = POMO_PRESETS[presetIdx];
  const totalMs   = (phase === "work" ? preset.work : preset.rest) * 60 * 1000;
  const pct       = 1 - remaining / totalMs;
  const offset    = CIRC * (1 - pct);
  const strokeColor = phase === "work" ? "url(#pomoWorkGrad)" : "url(#pomoRestGrad)";

  const endRef   = useRef(null);
  const frameRef = useRef(null);

  const tick = useCallback(() => {
    const left = endRef.current - Date.now();
    if (left <= 0) {
      setRemaining(0);
      setRunning(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
      if (soundOn) playBeep(audioCtx.current, "finish");
      // log work or rest into paired session history
      const finishedAt = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const durationMin = phase === "work" ? preset.work : preset.rest;
      setHistory((prev) => {
        if (phase === "work") {
          // start a new session row with work filled
          return [{ sessionNum: session, workMin: durationMin, restMin: null, workAt: finishedAt, restAt: null }, ...prev.slice(0, 19)];
        } else {
          // fill rest into the most recent session row (first item)
          if (prev.length > 0 && prev[0].restMin === null) {
            const updated = { ...prev[0], restMin: durationMin, restAt: finishedAt };
            return [updated, ...prev.slice(1)];
          }
          // fallback: orphan rest row
          return [{ sessionNum: session, workMin: null, restMin: durationMin, workAt: null, restAt: finishedAt }, ...prev.slice(0, 19)];
        }
      });
      setTimeout(() => {
        setPhase((p) => {
          const next = p === "work" ? "rest" : "work";
          const ms   = (next === "work" ? preset.work : preset.rest) * 60 * 1000;
          setRemaining(ms);
          if (next === "work") setSession((s) => s + 1);
          return next;
        });
      }, 800);
      return;
    }
    setRemaining(left);
    frameRef.current = requestAnimationFrame(tick);
  }, [phase, preset, soundOn]);

  useEffect(() => {
    if (running) {
      endRef.current = Date.now() + remaining;
      frameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frameRef.current);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [running]);

  const toggle = () => {
    if (!running) endRef.current = Date.now() + remaining;
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false); setPhase("work"); setSession(1);
    setRemaining(POMO_PRESETS[presetIdx].work * 60 * 1000);
  };

  const changePreset = (idx) => {
    if (running) return;
    setPresetIdx(idx); setPhase("work"); setSession(1);
    setRemaining(POMO_PRESETS[idx].work * 60 * 1000);
  };

  const skipPhase = () => {
    setRunning(false);
    if (soundOn) playTickBeep(audioCtx.current);
    setPhase((p) => {
      const next = p === "work" ? "rest" : "work";
      const ms   = (next === "work" ? preset.work : preset.rest) * 60 * 1000;
      setRemaining(ms);
      if (next === "work") setSession((s) => s + 1);
      return next;
    });
  };

  /* urgency: last 10% */
  const urgent = remaining / totalMs < 0.1 && running;

  return (
    <div className="sw-panel">
      <div className="sw-left">
        {/* Preset selector */}
        <div className="pomo-presets">
          {POMO_PRESETS.map((p, i) => (
            <button
              key={i}
              className={`pomo-preset-btn${presetIdx === i ? " pomo-preset-btn--active" : ""}`}
              onClick={() => changePreset(i)}
              disabled={running}
            >{p.label}</button>
          ))}
        </div>

        {/* Phase badge */}
        <div className={`pomo-phase-badge pomo-phase--${phase}${running ? " pomo-phase--running" : ""}`}>
          <span className="pomo-phase-dot" />
          {phase === "work" ? "🍅 Tập trung" : "☕ Nghỉ ngơi"}
          <span className="pomo-session-tag">Phiên #{session}</span>
        </div>

        {/* Clock */}
        <div className={`sw-clock-wrap${flash ? " sw-clock--flash" : ""}`}>
          {running && <div className={`sw-glow-ring${phase === "rest" ? " sw-glow-ring--blue" : ""}`} />}
          {urgent  && <div className="sw-urgent-ring" />}

          <svg viewBox="0 0 200 200" className="sw-svg">
            <defs>
              <linearGradient id="pomoWorkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#56ab2f"/>
                <stop offset="100%" stopColor="#3a7d44"/>
              </linearGradient>
              <linearGradient id="pomoRestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="88" fill="none"
              stroke="rgba(58,125,68,0.12)" strokeWidth="10"/>
            <circle cx="100" cy="100" r="88" fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: running ? "none" : "stroke-dashoffset 0.4s" }}
            />
            <circle cx="100" cy="100" r="72" fill="rgba(255,255,255,0.6)"/>
          </svg>

          <div className="sw-clock-inner">
            <div className={`sw-time${phase === "rest" ? " sw-time--rest" : ""}${running ? " sw-time--ticking" : ""}${urgent ? " sw-time--urgent" : ""}`}>
              {fmtPomo(remaining)}
            </div>
            <div className="sw-lap-cur">
              {phase === "work" ? `${preset.work} phút` : `${preset.rest} phút`}
            </div>
            {/* mini progress bar */}
            <div className="pomo-mini-bar">
              <div className="pomo-mini-bar-fill" style={{
                width: `${pct * 100}%`,
                background: phase === "work" ? "#3a7d44" : "#3b82f6"
              }}/>
            </div>
          </div>
        </div>

        <div className="sw-btns">
          <button className={`sw-btn ${running ? "sw-btn--stop" : "sw-btn--start"}`} onClick={toggle}>
            <span className="sw-btn-icon">{running ? "⏸" : "▶"}</span>
            {running ? "Tạm dừng" : remaining === totalMs ? "Bắt đầu" : "Tiếp tục"}
          </button>
          <button className="sw-btn sw-btn--lap" onClick={skipPhase}>
            <span className="sw-btn-icon">⏭</span>Bỏ qua
          </button>
          <button className="sw-btn sw-btn--reset" onClick={reset}>
            <span className="sw-btn-icon">↺</span>Reset
          </button>
        </div>
      </div>

      <div className="sw-right">
        
        {history.length === 0 ? (
          <div className="sw-empty">
            <div className="sw-empty-icon">🍅</div>
            Bắt đầu một phiên Pomodoro để ghi lại.
          </div>
        ) : (
          <div className="sw-hist-list">
            {history.map((h, i) => (
              <div className="pomo-hist-card" key={i} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="pomo-hist-session-label">Phiên #{h.sessionNum}</div>
                <div className="pomo-hist-rows">
                  <div className={`pomo-hist-row pomo-hist-row--work${h.workMin === null ? " pomo-hist-row--empty" : ""}`}>
                    <span className="pomo-hist-row-icon">🍅</span>
                    <span className="pomo-hist-row-label">Tập trung</span>
                    <span className="pomo-hist-row-dur">
                      {h.workMin !== null ? `${h.workMin} phút` : "—"}
                    </span>
                    <span className="pomo-hist-row-at">{h.workAt ?? ""}</span>
                  </div>
                  <div className={`pomo-hist-row pomo-hist-row--rest${h.restMin === null ? " pomo-hist-row--empty" : ""}`}>
                    <span className="pomo-hist-row-icon">☕</span>
                    <span className="pomo-hist-row-label">Nghỉ ngơi</span>
                    <span className="pomo-hist-row-dur">
                      {h.restMin !== null ? `${h.restMin} phút` : <span className="pomo-hist-pending">đang chạy…</span>}
                    </span>
                    <span className="pomo-hist-row-at">{h.restAt ?? ""}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {session > 1 && (
          <div className="pomo-counter">
            <div className="pomo-counter-label">Đã hoàn thành</div>
            <div className="pomo-counter-tomatoes">
              {Array.from({ length: Math.min(session - 1, 12) }).map((_, i) => (
                <span key={i} className="pomo-tomato">🍅</span>
              ))}
              {session - 1 > 12 && <span className="pomo-extra">+{session - 13}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Timer() {
  const [tab,     setTab]     = useState("stopwatch");
  const [soundOn, setSoundOn] = useState(true);
  const audioCtx = useRef(null);

  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const handleTabClick = (t) => { initAudio(); setTab(t); };
  const toggleSound    = () => { initAudio(); setSoundOn((s) => !s); };

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-title-wrap">
          <span className="sw-title-icon">🕐</span>
          <h2 className="sw-title">Bấm giờ</h2>
        </div>
        <div className="sw-header-right">
          <div className="sw-tabs">
            <button
              className={`sw-tab${tab === "stopwatch" ? " sw-tab--active" : ""}`}
              onClick={() => handleTabClick("stopwatch")}
            >⏱ Đồng hồ</button>
            <button
              className={`sw-tab${tab === "pomodoro" ? " sw-tab--active" : ""}`}
              onClick={() => handleTabClick("pomodoro")}
            >🍅 Pomodoro</button>
          </div>
          <button
            className={`sw-sound-btn${soundOn ? " sw-sound-btn--on" : ""}`}
            onClick={toggleSound}
            title={soundOn ? "Tắt âm thanh" : "Bật âm thanh"}
          >{soundOn ? "🔔" : "🔕"}</button>
        </div>
      </div>

      <div className="sw-tab-content" key={tab}>
        {tab === "stopwatch"
          ? <StopwatchTab audioCtx={audioCtx} soundOn={soundOn} />
          : <PomodoroTab  audioCtx={audioCtx} soundOn={soundOn} />
        }
      </div>
    </div>
  );
}