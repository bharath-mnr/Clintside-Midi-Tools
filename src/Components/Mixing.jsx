import { useState, useEffect, useRef } from "react";

const sections = [
  { id: "vision", label: "VISION", icon: "✦" },
  { id: "recording", label: "RECORDING", icon: "⬤" },
  { id: "arrangement", label: "ARRANGEMENT", icon: "▦" },
  { id: "eq", label: "EQ", icon: "〜" },
  { id: "dynamics", label: "DYNAMICS", icon: "◈" },
  { id: "reverb", label: "REVERB & SPACE", icon: "◎" },
  { id: "saturation", label: "SATURATION", icon: "⬡" },
  { id: "stereo", label: "STEREO FIELD", icon: "↔" },
  { id: "automation", label: "AUTOMATION", icon: "⌇" },
  { id: "mastering", label: "MASTERING", icon: "◆" },
  { id: "export", label: "EXPORT", icon: "↑" },
];

const eqBands = [
  { freq: "30Hz", gain: -2, color: "#1a3a5c" },
  { freq: "60Hz", gain: 0, color: "#1a4a5c" },
  { freq: "120Hz", gain: -3, color: "#1a5c4a" },
  { freq: "250Hz", gain: -5, color: "#2a5c1a" },
  { freq: "500Hz", gain: -2, color: "#4a5c1a" },
  { freq: "1kHz", gain: 1, color: "#5c4a1a" },
  { freq: "2kHz", gain: 3, color: "#5c2a1a" },
  { freq: "4kHz", gain: 4, color: "#5c1a2a" },
  { freq: "8kHz", gain: 5, color: "#4a1a5c" },
  { freq: "16kHz", gain: 3, color: "#2a1a5c" },
];

const reverbPresets = [
  { name: "Cathedral Hall", rt60: "4.2s", pre: "35ms", size: 92, mix: 22, color: "#4af0b4" },
  { name: "Warm Room", rt60: "1.8s", pre: "18ms", size: 55, mix: 15, color: "#f0b44a" },
  { name: "Studio Live", rt60: "0.9s", pre: "8ms", size: 35, mix: 12, color: "#b44af0" },
  { name: "Plate Shimmer", rt60: "2.6s", pre: "0ms", size: 70, mix: 18, color: "#f04a8a" },
];

const exportFormats = [
  {
    platform: "Spotify",
    icon: "🎵",
    format: "WAV 44.1kHz / 16-bit",
    lufs: "-14 LUFS",
    peak: "-1 dBTP",
    bit: "320 kbps OGG",
    color: "#1DB954",
    notes: "Spotify normalizes to -14 LUFS. Don't over-limit."
  },
  {
    platform: "YouTube",
    icon: "▶",
    format: "WAV 48kHz / 24-bit",
    lufs: "-14 LUFS",
    peak: "-1 dBTP",
    bit: "AAC 256 kbps",
    color: "#FF0000",
    notes: "Upload at 48kHz for video sync. YouTube targets -14 LUFS."
  },
  {
    platform: "Apple Music",
    icon: "♪",
    format: "WAV 44.1kHz / 24-bit",
    lufs: "-16 LUFS",
    peak: "-1 dBTP",
    bit: "AAC 256 kbps",
    color: "#FC3C44",
    notes: "Apple uses -16 LUFS. Lossless ALAC preferred."
  },
  {
    platform: "Tidal / Masters",
    icon: "◈",
    format: "WAV 96kHz / 24-bit",
    lufs: "-14 LUFS",
    peak: "-0.5 dBTP",
    bit: "FLAC Lossless",
    color: "#00FECC",
    notes: "HiRes masters. Max transparency, zero limiting artifacts."
  },
];

const flPlugins = [
  { category: "EQ", name: "Parametric EQ 2", role: "Surgical cuts on piano", tip: "Use narrow Q (8–12) for resonance hunting at 200–400Hz. Boost highs with wide shelf above 8kHz." },
  { category: "EQ", name: "Maximus (Low shelf)", role: "Tilt filter for warmth", tip: "Low shelf boost at 80Hz adds body. Cut around 300Hz to remove muddiness." },
  { category: "Compression", name: "Fruity Peak Controller → Vol", role: "Dynamic shaping", tip: "Sidechain to itself: attack 30ms, release 200ms. Ratio 3:1 max — piano needs to breathe." },
  { category: "Compression", name: "Transient Processor", role: "Attack/sustain shaping", tip: "Cut attack slightly to sit in mix. Boost sustain for Gibran-style long decay tail." },
  { category: "Reverb", name: "Fruity Reeverb 2", role: "Room / Hall space", tip: "Use two reverb instances: one tight room (0.8s) and one long hall (4s) on a send." },
  { category: "Reverb", name: "Convolver", role: "IR-based realism", tip: "Load a real concert hall IR. Pre-delay 25–30ms. Mix at 18–22% for Gibran depth." },
  { category: "Saturation", name: "Fruity Blood Overdrive", role: "Subtle harmonic warmth", tip: "Low mix (5–10%). Add even harmonics for vintage warmth without distortion." },
  { category: "Saturation", name: "Hardcore (tape sim)", role: "Tape saturation emulation", tip: "Emulate tape with slight compression + high freq rolloff. Adds analog warmth." },
  { category: "Stereo", name: "Fruity Stereo Enhancer", role: "Width control", tip: "Stereo width 60–80% on piano. Never widen bass below 150Hz — mono it." },
  { category: "Stereo", name: "Fruity Multiband Compressor", role: "Mid/Side mastering", tip: "M/S mode: compress mid more than side for focused center." },
  { category: "Mastering", name: "Maximus", role: "Multiband master limiter", tip: "3-band master: Sub tight, Mid gentle, High transparent. Output gain -0.3 dBTP." },
  { category: "Mastering", name: "Parametric EQ 2 (master)", role: "Mastering EQ", tip: "Final high-shelf +1.5dB at 12kHz for air. Low-pass at 20kHz removes ultrasonic aliasing." },
];

const mixingTechniques = [
  {
    title: "The Gibran Frequency Carve",
    icon: "〜",
    color: "#4af0b4",
    steps: [
      "High-pass filter at 40–60Hz: Piano doesn't need sub bass — it just adds mud.",
      "Cut 200–350Hz by 2–4dB with medium Q: This is the 'boxiness' zone. Removing it makes piano sound expensive.",
      "Gentle boost at 3–5kHz: Brings out key attack, the 'character' of the performance.",
      "Air shelf +2dB at 12–16kHz: Adds the crystalline shimmer Gibran is known for.",
      "Notch any resonant frequency: Play sustained notes and sweep to find harsh ringing. Kill it with a narrow Q notch."
    ]
  },
  {
    title: "Dynamic Layering Technique",
    icon: "◈",
    color: "#f0b44a",
    steps: [
      "Layer two piano samples: one bright (close mic) + one warm (room mic). Blend for depth.",
      "Automate volume: Soft passages 60–70% velocity, climaxes 100%. This IS Gibran's emotional arc.",
      "Parallel compression: Send to a crushed bus (ratio 10:1, fast attack) mixed at 15–20%. Adds glue without killing dynamics.",
      "Use Transient Processor: Reduce attack 3–5ms so each note sits inside the reverb tail more naturally.",
      "Ghost layer: A very quiet bell or pad 12–14dB lower adds harmonic shimmer subconsciously."
    ]
  },
  {
    title: "Spatial Depth (3D Piano Sound)",
    icon: "◎",
    color: "#b44af0",
    steps: [
      "Pre-delay on reverb: 20–35ms simulates the brain's 'distance' perception. This is the #1 secret.",
      "Two reverb sends: Short room (0.8s RT60) at 12% + Cathedral hall (3.8s) at 8%. Depth without wash.",
      "Mono bass, stereo mids: Low frequencies of piano in mono. Use multiband stereo tool.",
      "EQ your reverb: Cut reverb below 250Hz. Muddy reverb ruins everything. Also cut 1–3kHz.",
      "Modulated reverb: Add very slow chorus (0.3Hz, 8 cents) to hall reverb tail for organic shimmer."
    ]
  },
  {
    title: "Harmonic Saturation Chain",
    icon: "⬡",
    color: "#f04a8a",
    steps: [
      "Tape saturation first: Run piano through subtle tape emulation at 1–3% mix. Smooths transients.",
      "Tube harmonics: Add even-order harmonics with a tube emulator. Warmth without grit.",
      "Exciter at 8–12kHz: Adds synthesized high-frequency shimmer. Use sparingly — 10% max.",
      "Parallel saturation: Print a fully saturated version, blend at 20%. Keeps transient detail.",
      "Never saturate on master first pass — always in the channel strip. Master saturation is last."
    ]
  },
];

const masteringChain = [
  { step: 1, tool: "Reference Track", desc: "Import a Gibran Alcocer track as reference. Match perceived loudness before processing anything.", color: "#4af0b4" },
  { step: 2, tool: "Master EQ (Surgical)", desc: "Cut problematic frequencies inherited from mix. Use spectrum analyzer. Small moves: ±1.5dB max.", color: "#f0b44a" },
  { step: 3, tool: "Master EQ (Tonal)", desc: "Tilt EQ for overall brightness/warmth balance. High shelf +1dB at 10kHz. Low shelf -0.5dB at 100Hz.", color: "#b44af0" },
  { step: 4, tool: "Multiband Compression", desc: "Gentle glue compression. 3 bands: Sub (1.5:1), Mid (2:1), High (1.2:1). Slow attack, medium release.", color: "#f04a8a" },
  { step: 5, tool: "Stereo Width (M/S)", desc: "Mid/Side processing. Compress mid channel slightly. Widen sides at 500Hz+. Mono check!", color: "#4af0e0" },
  { step: 6, tool: "Harmonic Excitement", desc: "Subtle saturation on full master. Tape sim at 5% mix. Adds analog warmth and coherence.", color: "#f0e04a" },
  { step: 7, tool: "Limiting (True Peak)", desc: "Transparent limiter: -0.3 to -1 dBTP ceiling. Gain reduction max 2–3dB. Preserve piano dynamics!", color: "#f07a4a" },
  { step: 8, tool: "LUFS Metering", desc: "Measure integrated LUFS. Target -14 LUFS for streaming. Never exceed -9 LUFS (kills piano dynamics).", color: "#4a8af0" },
];

export default function Mixing() {
  const [activeSection, setActiveSection] = useState("vision");
  const [activePreset, setActivePreset] = useState(0);
  const [eqValues, setEqValues] = useState(eqBands.map(b => b.gain));
  const [animatedKeys, setAnimatedKeys] = useState([]);
  const [visibleCards, setVisibleCards] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      const keys = [0,2,4,5,7,9,11].map(k => k + Math.floor(Math.random() * 2) * 12);
      setAnimatedKeys(keys.slice(0, 3 + Math.floor(Math.random() * 3)));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleCards(prev => ({ ...prev, [entry.target.dataset.id]: true }));
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll("[data-id]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection]);

  const pianoKeys = Array.from({ length: 24 }, (_, i) => {
    const noteInOctave = i % 12;
    const isBlack = [1,3,6,8,10].includes(noteInOctave);
    return { index: i, isBlack, active: animatedKeys.includes(i) };
  });

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const EQVisualizer = () => {
    const w = 500, h = 120;
    const points = eqValues.map((gain, i) => {
      const x = (i / (eqValues.length - 1)) * w;
      const y = h / 2 - (gain / 12) * (h / 2);
      return `${x},${y}`;
    });
    const path = `M${points.join(" L")}`;
    const fill = `M0,${h} L${points.join(" L")} L${w},${h} Z`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="1" y2="0">
            {eqBands.map((b, i) => (
              <stop key={i} offset={`${(i / (eqBands.length - 1)) * 100}%`} stopColor={b.color} stopOpacity="0.6" />
            ))}
          </linearGradient>
        </defs>
        <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="#4af0b430" strokeWidth="1" strokeDasharray="4,4" />
        <path d={fill} fill="url(#eqGrad)" opacity="0.3" />
        <path d={path} fill="none" stroke="#4af0b4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {eqValues.map((gain, i) => {
          const x = (i / (eqValues.length - 1)) * w;
          const y = h / 2 - (gain / 12) * (h / 2);
          return (
            <circle key={i} cx={x} cy={y} r="4" fill="#4af0b4" stroke="#0a1628" strokeWidth="1.5"
              className="cursor-pointer hover:r-6 transition-all"
              onMouseDown={(e) => {
                const startY = e.clientY, startGain = gain;
                const onMove = (me) => {
                  const delta = (startY - me.clientY) / 5;
                  setEqValues(prev => prev.map((v, idx) => idx === i ? Math.max(-12, Math.min(12, startGain + delta)) : v));
                };
                const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            />
          );
        })}
      </svg>
    );
  };

  const VUMeter = ({ label, value, color }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-mono" style={{ color, fontSize: "10px" }}>{label}</div>
      <div className="relative w-4 rounded-sm overflow-hidden" style={{ height: "80px", background: "#0a1628", border: "1px solid #1a2a4a" }}>
        <div className="absolute bottom-0 w-full rounded-sm transition-all duration-100"
          style={{ height: `${value}%`, background: `linear-gradient(to top, ${color}, ${color}88)` }} />
        {[80, 60, 40, 20].map(tick => (
          <div key={tick} className="absolute w-full" style={{ bottom: `${tick}%`, borderTop: "1px solid #ffffff15" }} />
        ))}
      </div>
      <div className="text-xs font-mono" style={{ color: "#4a6a9a", fontSize: "9px" }}>{Math.round(value - 100)}dB</div>
    </div>
  );

  const [vuLevels, setVuLevels] = useState([72, 68, 75, 65, 70, 62]);
  useEffect(() => {
    const iv = setInterval(() => {
      setVuLevels(prev => prev.map(v => Math.max(50, Math.min(92, v + (Math.random() - 0.5) * 8))));
    }, 150);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: "#060c1a", fontFamily: "'Courier New', monospace" }}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(6,12,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1a2a4a" }}>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {["#f04a4a","#f0b44a","#4af0b4"].map((c,i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-sm font-bold tracking-widest" style={{ color: "#4af0b4", letterSpacing: "0.3em" }}>
            PIANO MIX STUDIO
          </span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#0a1628", color: "#4a6a9a", border: "1px solid #1a2a4a" }}>
            FL STUDIO PRO
          </span>
        </div>
        <div className="flex items-center gap-2">
          {vuLevels.map((v, i) => (
            <VUMeter key={i} label={["L","R","M","S","A","B"][i]} value={v} color={["#4af0b4","#4af0b4","#f0b44a","#f0b44a","#b44af0","#b44af0"][i]} />
          ))}
        </div>
      </header>

      {/* Animated Piano Keys */}
      <div className="fixed top-14 left-0 right-0 z-30 overflow-hidden" style={{ height: "48px", borderBottom: "1px solid #1a2a4a" }}>
        <div className="flex h-full relative" style={{ background: "#030810" }}>
          {pianoKeys.map((key) => (
            <div key={key.index} className="transition-all duration-200"
              style={{
                width: key.isBlack ? "20px" : "32px",
                height: key.isBlack ? "28px" : "44px",
                marginLeft: key.isBlack ? "-10px" : "1px",
                marginRight: key.isBlack ? "-10px" : "0",
                zIndex: key.isBlack ? 2 : 1,
                background: key.isBlack
                  ? (key.active ? "#4af0b4" : "#0a0f1a")
                  : (key.active ? "#4af0b488" : "#e8e8f0"),
                border: "1px solid",
                borderColor: key.isBlack ? (key.active ? "#4af0b4" : "#1a2a4a") : "#9090a0",
                borderRadius: "0 0 3px 3px",
                boxShadow: key.active ? `0 0 12px ${key.isBlack ? "#4af0b4" : "#4af0b488"}` : "none",
                transition: "all 0.15s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Side Nav */}
      <nav className="fixed left-0 top-28 bottom-0 z-40 flex flex-col gap-1 p-2 overflow-y-auto"
        style={{ width: "160px", background: "rgba(6,12,26,0.95)", borderRight: "1px solid #1a2a4a" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            className="flex items-center gap-2 px-3 py-2 rounded text-left transition-all duration-200 hover:scale-105"
            style={{
              background: activeSection === s.id ? "#0a1f0a" : "transparent",
              color: activeSection === s.id ? "#4af0b4" : "#4a6a9a",
              border: activeSection === s.id ? "1px solid #4af0b430" : "1px solid transparent",
              fontSize: "11px", letterSpacing: "0.05em",
            }}>
            <span style={{ fontSize: "14px" }}>{s.icon}</span>
            <span className="font-bold">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="pt-28 pl-40 pr-4 pb-16">

        {/* VISION */}
        <section id="vision" className="min-h-screen flex flex-col justify-center px-8 py-16">
          <div className="max-w-4xl">
            <div className="text-xs tracking-widest mb-4" style={{ color: "#4a6a9a" }}>// REFERENCE ARTIST</div>
            <h1 className="text-5xl font-black mb-2 leading-tight" style={{
              color: "#4af0b4",
              textShadow: "0 0 40px #4af0b430",
              letterSpacing: "-0.02em"
            }}>
              GIBRAN ALCOCER
            </h1>
            <h2 className="text-2xl mb-8 font-light" style={{ color: "#7090b0" }}>
              Complete Piano Mixing & Mastering Guide
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "GENRE", value: "Neoclassical / Minimal Piano" },
                { label: "KEY FEEL", value: "Intimate · Melancholic · Cinematic" },
                { label: "LOUDNESS", value: "-14 LUFS Integrated" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded" style={{ background: "#0a1628", border: "1px solid #1a2a4a" }}>
                  <div className="text-xs mb-1 tracking-widest" style={{ color: "#4a6a9a" }}>{item.label}</div>
                  <div className="text-sm font-bold" style={{ color: "#c0d8f0" }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-lg" style={{ background: "#0a1628", border: "1px solid #4af0b420" }}>
              <div className="text-xs mb-3 tracking-widest" style={{ color: "#4af0b4" }}>// THE SOUND VISION</div>
              <p className="text-sm leading-relaxed" style={{ color: "#7090b0" }}>
                Gibran Alcocer's sound is defined by <span style={{ color: "#c0d8f0" }}>extreme intimacy</span> — you hear the room, the pedal noise, the breath of the instrument.
                The mix is <span style={{ color: "#c0d8f0" }}>never over-processed</span>. Every technique here serves one goal:{" "}
                <span style={{ color: "#4af0b4" }}>make the piano sound like it's being played in the room with the listener.</span>{" "}
                Deep reverb tails, transparent compression, and precise EQ carving are the pillars.
                This guide walks you through FL Studio from first note to Spotify-ready master.
              </p>
            </div>

            {/* Signal flow diagram */}
            <div className="mt-8 p-4 rounded-lg overflow-x-auto" style={{ background: "#050c18", border: "1px solid #1a2a4a" }}>
              <div className="text-xs mb-3 tracking-widest" style={{ color: "#4a6a9a" }}>// SIGNAL FLOW</div>
              <div className="flex items-center gap-1 flex-wrap">
                {["PIANO SAMPLE", "→", "HPF 60Hz", "→", "EQ CARVE", "→", "SATURATION", "→", "COMP", "→", "REVERB SEND", "→", "STEREO WIDTH", "→", "MASTER BUS", "→", "LIMIT", "→", "EXPORT"].map((s, i) => (
                  <div key={i} className={s === "→" ? "" : "px-2 py-1 rounded text-xs font-mono"}
                    style={s === "→" ? { color: "#4a6a9a", fontSize: "12px" } : {
                      background: "#0a1628", border: "1px solid #1a2a4a",
                      color: i % 2 === 0 ? "#4af0b4" : "#b44af0",
                      fontSize: "10px", whiteSpace: "nowrap"
                    }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RECORDING */}
        <section id="recording" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 01</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#f0b44a" }}>RECORDING & SAMPLE PREP</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "MIDI Velocity Layers", desc: "Use a sample library with minimum 4 velocity layers (pp, mp, mf, ff). Spitfire LABS, Keyscape, or Native Instruments Una Corda. In FL, map velocity sensitivity to expression.", icon: "🎹", color: "#f0b44a" },
              { title: "Pedal & Release Noise", desc: "Enable pedal noise and key release samples in your VST. This is crucial for Gibran's sound — the organic imperfections define the realism.", icon: "🦶", color: "#4af0b4" },
              { title: "Round Robin Samples", desc: "Disable sample repetition. Use round-robin (3–6 variations per note). Repeated identical samples instantly sound fake in sparse piano music.", icon: "🔄", color: "#b44af0" },
              { title: "Sample Rate: 48kHz/24-bit", desc: "Record and work at 48kHz / 24-bit minimum in FL Studio. Higher headroom, cleaner signal chain. Export at 44.1kHz only for final delivery.", icon: "📡", color: "#f04a8a" },
              { title: "MIDI Humanization", desc: "In Piano Roll: slight timing drift ±5ms on notes, vary velocity ±8 points. Use Ctrl+A → Select All → right-click timing for micro-humanization.", icon: "🎵", color: "#4af0e0" },
              { title: "Sustain Pedal Curves", desc: "Draw sustain CC64 as a smooth curve, not a hard on/off square. Real pianists half-pedal. FL Studio: use Envelope/LFO tool for CC64 curves.", icon: "〜", color: "#f0e04a" },
            ].map((item, i) => (
              <div key={i} data-id={`rec-${i}`} className="p-4 rounded-lg transition-all duration-500"
                style={{
                  background: "#0a1628", border: `1px solid ${item.color}30`,
                  opacity: visibleCards[`rec-${i}`] ? 1 : 0,
                  transform: visibleCards[`rec-${i}`] ? "translateY(0)" : "translateY(20px)",
                }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold mb-1 tracking-widest" style={{ color: item.color }}>{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "#6080a0" }}>{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ARRANGEMENT */}
        <section id="arrangement" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 02</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#4af0b4" }}>ARRANGEMENT & DYNAMICS</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "INTRO", db: "-18 dBFS", color: "#4a6a9a", width: "30%" },
              { label: "BUILD", db: "-12 dBFS", color: "#4af0b4", width: "55%" },
              { label: "CLIMAX", db: "-6 dBFS", color: "#f0b44a", width: "85%" },
              { label: "RELEASE", db: "-10 dBFS", color: "#b44af0", width: "65%" },
              { label: "OUTRO", db: "-16 dBFS", color: "#4a8af0", width: "40%" },
              { label: "FADE", db: "-∞ dBFS", color: "#4a6a9a", width: "15%" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded" style={{ background: "#0a1628", border: "1px solid #1a2a4a" }}>
                <div className="text-xs font-bold mb-2" style={{ color: s.color }}>{s.label}</div>
                <div className="h-1.5 rounded-full mb-1" style={{ background: "#1a2a4a" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: s.width, background: s.color }} />
                </div>
                <div className="text-xs font-mono" style={{ color: "#4a6a9a" }}>{s.db}</div>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-lg" style={{ background: "#0a1628", border: "1px solid #4af0b420" }}>
            <div className="text-xs mb-3 tracking-widest" style={{ color: "#4af0b4" }}>// FL STUDIO AUTOMATION TIPS</div>
            <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: "#6080a0" }}>
              <div>• Volume automation: Draw with <span style={{ color: "#c0d8f0" }}>tension curves</span> (hold Ctrl while drawing), not straight lines. Natural breath.</div>
              <div>• Use <span style={{ color: "#c0d8f0" }}>Pattern Blocks</span> for section dynamics — each section has its own automation clip.</div>
              <div>• Reverb mix automation: Open reverb on climax, pull back on sparse sections to <span style={{ color: "#c0d8f0" }}>maintain intimacy</span>.</div>
              <div>• Tempo automation: Slow rubato feeling — automate BPM ±2–3 BPM during emotional peaks.</div>
            </div>
          </div>
        </section>

        {/* EQ */}
        <section id="eq" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 03</div>
          <h2 className="text-3xl font-black mb-4" style={{ color: "#f04a8a" }}>EQ — FREQUENCY SCULPTING</h2>
          <p className="text-xs mb-6" style={{ color: "#4a6a9a" }}>Drag the EQ points to adjust gain. Reference: Gibran Alcocer frequency curve.</p>

          <div className="p-4 rounded-lg mb-6" style={{ background: "#0a1628", border: "1px solid #f04a8a30" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs tracking-widest" style={{ color: "#f04a8a" }}>// PARAMETRIC EQ 2 — PIANO CHANNEL</div>
              <div className="text-xs font-mono" style={{ color: "#4a6a9a" }}>drag nodes to adjust</div>
            </div>
            <EQVisualizer />
            <div className="flex justify-between mt-1">
              {eqBands.map((b, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-mono" style={{ color: eqValues[i] >= 0 ? "#4af0b4" : "#f04a8a", fontSize: "9px" }}>
                    {eqValues[i] >= 0 ? "+" : ""}{eqValues[i].toFixed(1)}
                  </div>
                  <div className="text-xs font-mono" style={{ color: "#4a6a9a", fontSize: "9px" }}>{b.freq}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { freq: "40–80Hz", action: "HIGH-PASS FILTER", why: "Remove sub rumble and low-end mud. Piano has no useful information here. Use 18 or 24dB/oct slope.", color: "#f04a8a" },
              { freq: "200–350Hz", action: "CUT 2–4dB", why: "The 'boxy' zone. This range makes piano sound cheap and demo-ish. Use medium Q (2.5). Trust the cut.", color: "#f0b44a" },
              { freq: "3–5kHz", action: "BOOST 1.5–3dB", why: "Key attack and presence. This is where the 'wood and felt' character lives. Wide bell (Q 1.5).", color: "#4af0b4" },
              { freq: "8–16kHz", action: "SHELF +2dB", why: "Air and shimmer. High shelf with gentle slope. This is Gibran's crystalline high end. Never overdo.", color: "#b44af0" },
              { freq: "Resonances", action: "NARROW NOTCH", why: "Sweep slowly while sustaining a note. Find the offensive resonance. Kill with Q 8–12, narrow notch.", color: "#4af0e0" },
              { freq: "400–800Hz", action: "GENTLE DIP", why: "Optional warmth control. Small cut here can clean up honkiness in midrange piano registers.", color: "#f0e04a" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded" style={{ background: "#080f20", border: `1px solid ${item.color}25` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: `${item.color}20`, color: item.color }}>{item.freq}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.action}</span>
                </div>
                <p className="text-xs" style={{ color: "#5070a0" }}>{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DYNAMICS */}
        <section id="dynamics" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 04</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#f0b44a" }}>DYNAMICS — COMPRESSION</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                name: "Main Compressor",
                params: [
                  { label: "Threshold", value: "-18 dB", desc: "Only catches peaks, not body" },
                  { label: "Ratio", value: "2.5:1", desc: "Gentle — preserves piano dynamics" },
                  { label: "Attack", value: "30–50ms", desc: "Let transient through fully" },
                  { label: "Release", value: "150–250ms", desc: "Breathes with the decay" },
                  { label: "Knee", value: "Soft (6dB)", desc: "Transparent onset" },
                  { label: "GR", value: "2–4 dB max", desc: "Never kill the dynamics!" },
                ],
                color: "#f0b44a", note: "Primary dynamics control. Gentle glue only."
              },
              {
                name: "Parallel Comp Bus",
                params: [
                  { label: "Threshold", value: "-30 dB", desc: "Crushes everything" },
                  { label: "Ratio", value: "10:1", desc: "Heavy limiting" },
                  { label: "Attack", value: "5ms", desc: "Fast, grabs transients" },
                  { label: "Release", value: "80ms", desc: "Punchy" },
                  { label: "Mix Blend", value: "15–20%", desc: "The magic sauce amount" },
                  { label: "EQ Post", value: "Cut 200Hz", desc: "Remove muddiness from crush" },
                ],
                color: "#b44af0", note: "Blend with dry signal. Adds density without killing peaks."
              },
              {
                name: "Transient Shaping",
                params: [
                  { label: "Attack", value: "-3 to -5ms", desc: "Slight attack reduction" },
                  { label: "Sustain", value: "+2 to +4ms", desc: "Extend natural decay" },
                  { label: "Output", value: "0 dB", desc: "Neutral output" },
                  { label: "Sensitivity", value: "Medium", desc: "Catches all notes" },
                  { label: "Lookahead", value: "2ms", desc: "Prevent clicks" },
                  { label: "Use On", value: "Bright layers", desc: "Softens harsh samples" },
                ],
                color: "#4af0b4", note: "Shapes the envelope character without frequency changes."
              },
            ].map((comp, i) => (
              <div key={i} className="p-4 rounded-lg" style={{ background: "#0a1628", border: `1px solid ${comp.color}30` }}>
                <div className="text-xs font-bold mb-3 tracking-widest" style={{ color: comp.color }}>{comp.name}</div>
                {comp.params.map((p, j) => (
                  <div key={j} className="flex justify-between items-start mb-2 pb-2" style={{ borderBottom: "1px solid #0f1e38" }}>
                    <div>
                      <div className="text-xs font-bold" style={{ color: "#8090b0" }}>{p.label}</div>
                      <div className="text-xs" style={{ color: "#4a6a9a", fontSize: "10px" }}>{p.desc}</div>
                    </div>
                    <div className="text-xs font-mono font-bold" style={{ color: comp.color }}>{p.value}</div>
                  </div>
                ))}
                <div className="mt-2 p-2 rounded text-xs" style={{ background: `${comp.color}10`, color: comp.color, fontSize: "10px" }}>
                  {comp.note}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REVERB */}
        <section id="reverb" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 05</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#4af0b4" }}>REVERB & SPATIAL DEPTH</h2>

          <div className="flex gap-3 mb-6 flex-wrap">
            {reverbPresets.map((p, i) => (
              <button key={i} onClick={() => setActivePreset(i)}
                className="px-4 py-2 rounded text-xs font-bold tracking-widest transition-all"
                style={{
                  background: activePreset === i ? `${p.color}20` : "#0a1628",
                  color: activePreset === i ? p.color : "#4a6a9a",
                  border: `1px solid ${activePreset === i ? p.color : "#1a2a4a"}`,
                }}>
                {p.name}
              </button>
            ))}
          </div>

          {(() => {
            const p = reverbPresets[activePreset];
            return (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-1 p-4 rounded-lg" style={{ background: "#0a1628", border: `1px solid ${p.color}30` }}>
                  <div className="text-xs font-bold mb-4 tracking-widest" style={{ color: p.color }}>{p.name.toUpperCase()}</div>
                  {[
                    { label: "RT60 / Decay", value: p.rt60 },
                    { label: "Pre-Delay", value: p.pre },
                    { label: "Room Size", value: `${p.size}%` },
                    { label: "Wet Mix", value: `${p.mix}%` },
                  ].map((param, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#6080a0" }}>{param.label}</span>
                        <span className="text-xs font-mono font-bold" style={{ color: p.color }}>{param.value}</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: "#1a2a4a" }}>
                        <div className="h-full rounded-full" style={{
                          width: param.label === "RT60 / Decay" ? `${(parseFloat(p.rt60) / 5) * 100}%` :
                            param.label === "Pre-Delay" ? `${(parseInt(p.pre) / 40) * 100}%` :
                            `${param.label === "Room Size" ? p.size : p.mix}%`,
                          background: p.color
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-span-2 p-4 rounded-lg" style={{ background: "#0a1628", border: `1px solid #1a2a4a` }}>
                  <div className="text-xs font-bold mb-4 tracking-widest" style={{ color: "#4a6a9a" }}>// REVERB ARCHITECTURE</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Pre-Delay Purpose", value: "Separates dry signal from reverb. Creates 'distance' perception. Critical for clarity in Gibran-style mixes." },
                      { label: "Reverb EQ", value: "Always EQ the reverb return: HPF at 200Hz, cut 1–3kHz, gentle LPF at 10kHz. Reverb should support, not fight." },
                      { label: "Dual Reverb Setup", value: "Short room (0.8s, 12%) for body. Long hall (3.8s, 8%) on a send for depth. Sum in bus. This layering = pro depth." },
                      { label: "Modulation", value: "Add subtle chorus to hall reverb (0.2Hz, 10 cents). Makes decay organic and alive. Without it, reverb sounds digital." },
                    ].map((tip, i) => (
                      <div key={i} className="p-3 rounded" style={{ background: "#060e1a", border: "1px solid #1a2a4a" }}>
                        <div className="font-bold mb-1" style={{ color: p.color }}>{tip.label}</div>
                        <div style={{ color: "#5070a0" }}>{tip.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* SATURATION */}
        <section id="saturation" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 06</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#f04a8a" }}>SATURATION & HARMONIC WARMTH</h2>
          <div className="grid grid-cols-2 gap-6">
            {mixingTechniques.filter(t => t.title.includes("Harmonic") || t.title.includes("Gibran")).map((tech, i) => (
              <div key={i} className="p-5 rounded-lg" style={{ background: "#0a1628", border: `1px solid ${tech.color}25` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{tech.icon}</span>
                  <h3 className="text-sm font-bold tracking-wider" style={{ color: tech.color }}>{tech.title}</h3>
                </div>
                <div className="space-y-2">
                  {tech.steps.map((step, j) => (
                    <div key={j} className="flex gap-2 text-xs">
                      <span className="font-mono font-bold flex-shrink-0" style={{ color: tech.color }}>0{j + 1}</span>
                      <span style={{ color: "#6080a0" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STEREO */}
        <section id="stereo" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 07</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#b44af0" }}>STEREO FIELD & IMAGING</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg col-span-1" style={{ background: "#0a1628", border: "1px solid #b44af030" }}>
              <div className="text-xs font-bold mb-4 tracking-widest" style={{ color: "#b44af0" }}>// STEREO VECTORSCOPE</div>
              <div className="relative mx-auto" style={{ width: "120px", height: "120px" }}>
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#1a2a4a" strokeWidth="1" />
                  <line x1="50" y1="2" x2="50" y2="98" stroke="#1a2a4a" strokeWidth="0.5" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="#1a2a4a" strokeWidth="0.5" />
                  <line x1="10" y1="90" x2="90" y2="10" stroke="#4af0b420" strokeWidth="1" />
                  {Array.from({ length: 40 }, (_, i) => {
                    const angle = (i / 40) * Math.PI * 2;
                    const r = 15 + Math.sin(i * 2.3) * 20;
                    const x = 50 + Math.cos(angle) * r;
                    const y = 50 + Math.sin(angle) * r;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill="#b44af0" opacity={0.3 + Math.sin(i) * 0.3} />;
                  })}
                  <text x="50" y="8" textAnchor="middle" fill="#4a6a9a" fontSize="6">M</text>
                  <text x="94" y="52" textAnchor="middle" fill="#4a6a9a" fontSize="6">S</text>
                </svg>
              </div>
              <div className="mt-3 text-xs text-center" style={{ color: "#4a6a9a" }}>Good correlation ↑<br />Avoid negative values</div>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {[
                { title: "MONO BASS", range: "Below 150Hz", rule: "Piano bass registers should be mono or near-mono. Wide low end causes phase issues and sounds muddy on mono systems.", color: "#4af0b4" },
                { title: "STEREO MIDS", range: "150Hz – 5kHz", rule: "The musical body of the piano. Use 60–80% stereo width. This is where the grand piano width comes from — left to right.", color: "#f0b44a" },
                { title: "WIDE HIGHS", range: "5kHz – 20kHz", rule: "Maximum width on harmonics and air. The shimmer and overtones fill the stereo field. Use stereo enhancer/exciter here.", color: "#b44af0" },
                { title: "M/S PROCESSING", range: "Full spectrum", rule: "Mid channel: slight EQ and compression. Side channel: gentle high-shelf boost. Keeps center focused, widens edges.", color: "#f04a8a" },
                { title: "MONO CHECK", range: "Full mix", rule: "Always check in mono. If piano disappears, phase cancellation. Fix by mono-ing bass or using a correlation meter to hunt problems.", color: "#4af0e0" },
                { title: "HAAS EFFECT", range: "Delay < 35ms", rule: "Haas widening: delay one side 15–25ms for stereo illusion without reverb. Use FL Fruity Delay for this on reverb sends.", color: "#f0e04a" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded" style={{ background: "#080f20", border: `1px solid ${item.color}20` }}>
                  <div className="text-xs font-bold mb-1" style={{ color: item.color }}>{item.title}</div>
                  <div className="text-xs mb-1 font-mono" style={{ color: "#4a6a9a" }}>{item.range}</div>
                  <div className="text-xs" style={{ color: "#5070a0" }}>{item.rule}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AUTOMATION */}
        <section id="automation" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 08</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#4af0e0" }}>AUTOMATION & FL STUDIO PLUGINS</h2>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a2a4a" }}>
                  {["PLUGIN", "CATEGORY", "ROLE", "PRO TIP"].map(h => (
                    <th key={h} className="text-left pb-3 pr-6 tracking-widest font-bold" style={{ color: "#4a6a9a" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flPlugins.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #0f1e38" }}>
                    <td className="py-3 pr-6 font-bold font-mono" style={{ color: ["#4af0b4","#f0b44a","#b44af0","#f04a8a"][["EQ","Compression","Reverb","Saturation","Stereo","Mastering"].indexOf(p.category) % 4] }}>
                      {p.name}
                    </td>
                    <td className="py-3 pr-6">
                      <span className="px-2 py-0.5 rounded text-xs" style={{ background: "#0a1628", color: "#6080a0", border: "1px solid #1a2a4a" }}>{p.category}</span>
                    </td>
                    <td className="py-3 pr-6" style={{ color: "#6080a0" }}>{p.role}</td>
                    <td className="py-3" style={{ color: "#4a7090", maxWidth: "200px" }}>{p.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mixingTechniques.filter(t => t.title.includes("Dynamic") || t.title.includes("Spatial")).map((tech, i) => (
              <div key={i} className="p-5 rounded-lg" style={{ background: "#0a1628", border: `1px solid ${tech.color}25` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{tech.icon}</span>
                  <h3 className="text-sm font-bold tracking-wider" style={{ color: tech.color }}>{tech.title}</h3>
                </div>
                <div className="space-y-2">
                  {tech.steps.map((step, j) => (
                    <div key={j} className="flex gap-2 text-xs">
                      <span className="font-mono font-bold flex-shrink-0" style={{ color: tech.color }}>0{j + 1}</span>
                      <span style={{ color: "#6080a0" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MASTERING */}
        <section id="mastering" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 09</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#f0b44a" }}>MASTERING CHAIN</h2>
          <div className="space-y-3">
            {masteringChain.map((step, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg items-start" style={{ background: "#0a1628", border: `1px solid ${step.color}20` }}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}` }}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold tracking-widest" style={{ color: step.color }}>{step.tool}</span>
                    {i < masteringChain.length - 1 && (
                      <div className="h-px flex-1" style={{ background: `${step.color}20` }} />
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "#5070a0" }}>{step.desc}</p>
                </div>
                {i < masteringChain.length - 1 && (
                  <div className="text-xs font-mono" style={{ color: "#1a2a4a" }}>→</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {[
              { label: "LUFS Target", value: "-14 LUFS", sub: "Integrated", color: "#4af0b4" },
              { label: "True Peak", value: "-1 dBTP", sub: "Maximum", color: "#f0b44a" },
              { label: "Dynamic Range", value: "DR 12+", sub: "Preserve it", color: "#b44af0" },
              { label: "Compression GR", value: "2–3 dB", sub: "Master limit", color: "#f04a8a" },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded text-center" style={{ background: "#080f20", border: `1px solid ${m.color}30` }}>
                <div className="text-xs mb-1" style={{ color: "#4a6a9a" }}>{m.label}</div>
                <div className="text-2xl font-black font-mono" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs" style={{ color: "#4a6a9a" }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPORT */}
        <section id="export" className="py-16 px-8">
          <div className="text-xs tracking-widest mb-2" style={{ color: "#4a6a9a" }}>// 10</div>
          <h2 className="text-3xl font-black mb-8" style={{ color: "#4af0b4" }}>EXPORT SETTINGS</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {exportFormats.map((fmt, i) => (
              <div key={i} className="p-5 rounded-lg" style={{ background: "#0a1628", border: `2px solid ${fmt.color}30` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{fmt.icon}</span>
                  <div>
                    <div className="text-sm font-black tracking-widest" style={{ color: fmt.color }}>{fmt.platform}</div>
                    <div className="text-xs font-mono" style={{ color: "#4a6a9a" }}>{fmt.format}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Target", value: fmt.lufs },
                    { label: "True Peak", value: fmt.peak },
                    { label: "Delivery", value: fmt.bit },
                  ].map((p, j) => (
                    <div key={j} className="p-2 rounded text-center" style={{ background: "#060e1a" }}>
                      <div className="text-xs" style={{ color: "#4a6a9a", fontSize: "9px" }}>{p.label}</div>
                      <div className="text-xs font-mono font-bold" style={{ color: fmt.color }}>{p.value}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs p-2 rounded" style={{ background: `${fmt.color}10`, color: fmt.color, border: `1px solid ${fmt.color}20` }}>
                  {fmt.notes}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-lg" style={{ background: "#0a1628", border: "1px solid #4af0b420" }}>
            <div className="text-xs font-bold mb-4 tracking-widest" style={{ color: "#4af0b4" }}>// FL STUDIO EXPORT SETTINGS (File → Export → Wave File)</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              {[
                { label: "Mode", value: "Rendered stems or Full Song" },
                { label: "Resampling", value: "64-point sinc (best quality)" },
                { label: "Bit Depth", value: "32-bit float (internal), 24-bit output" },
                { label: "Sample Rate", value: "48000 Hz (for video), 44100 Hz (music only)" },
                { label: "Dithering", value: "Triangular dithering when downsampling" },
                { label: "Split mixer tracks", value: "YES for stem exports" },
                { label: "Leave remainder", value: "YES — capture reverb tails" },
                { label: "Trim silence", value: "NO — keep the decay" },
                { label: "Enable FX chains", value: "YES — render with all processing" },
              ].map((setting, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span style={{ color: "#4af0b4" }}>›</span>
                  <div>
                    <div className="font-bold" style={{ color: "#8090b0" }}>{setting.label}</div>
                    <div style={{ color: "#5070a0" }}>{setting.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final message */}
          <div className="mt-8 p-6 rounded-lg text-center" style={{ background: "linear-gradient(135deg, #0a1628, #060e1a)", border: "1px solid #4af0b430" }}>
            <div className="text-3xl mb-3">✦</div>
            <h3 className="text-lg font-black mb-2" style={{ color: "#4af0b4" }}>The Gibran Philosophy</h3>
            <p className="text-xs max-w-lg mx-auto" style={{ color: "#5070a0", lineHeight: "1.8" }}>
              The best Gibran Alcocer mixes sound <span style={{ color: "#c0d8f0" }}>barely touched</span>.
              The processing is invisible. Every technique here is in service of <span style={{ color: "#c0d8f0" }}>revealing</span> the piano,
              not transforming it. Less is always more. When in doubt, bypass everything and ask: does it still sound beautiful?
              If yes — you're done. <span style={{ color: "#4af0b4" }}>Trust the performance.</span>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}