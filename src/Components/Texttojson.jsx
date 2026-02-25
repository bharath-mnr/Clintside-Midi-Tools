import React, { useState } from 'react';
import { Activity, AlertTriangle, FileText, Copy, CheckCheck } from 'lucide-react';

// ─────────────────────────────────────────────
// ENGINE
// ─────────────────────────────────────────────

function getSubdivisionsPerBar(timeSigStr) {
  const [num, den] = timeSigStr.split('/').map(Number);
  const subs = num * (16 / den);
  if (!Number.isInteger(subs)) throw new Error(`Invalid time signature ${timeSigStr}`);
  return subs;
}

function expandCompression(symbols) {
  const expanded = [];
  for (const sym of symbols) {
    const match = sym.match(/^(.+?)\((\d+)\)$/);
    if (match) {
      for (let i = 0; i < parseInt(match[2]); i++) expanded.push(match[1]);
    } else {
      expanded.push(sym);
    }
  }
  return expanded;
}

function parseSymbol(sym) {
  if (sym === '.') return { type: 'rest' };
  if (sym.startsWith('~')) {
    const c = sym.match(/^~(\d+)$/);
    return { type: 'sustain', sustainCutoff: c ? parseInt(c[1]) : null };
  }
  if (!sym.startsWith('X')) return { type: 'rest' };
  let s = sym.toUpperCase();
  let velocity = 100;
  let durationPercent = null;
  const velMatch = s.match(/^X(\d+)/);
  if (velMatch) {
    velocity = Math.min(127, Math.max(1, parseInt(velMatch[1])));
    s = s.slice(velMatch[0].length);
  } else {
    s = s.slice(1);
  }
  const durMatch = s.match(/E(\d+)/);
  if (durMatch) durationPercent = Math.min(100, Math.max(0, parseInt(durMatch[1])));
  return { type: 'note', velocity, durationPercent };
}

class TextToJsonEngine {
  static convert(text) {
    const lines = text.trim().split('\n');
    let tempo = 120, timeSigStr = '4/4', key = 'C';

    for (const line of lines) {
      const t = line.trim();
      const tm = t.match(/^Tempo:\s*(\d+)/i);
      if (tm) { tempo = parseInt(tm[1]); continue; }
      const ts = t.match(/^TimeSig:\s*(\d+\/\d+)/i);
      if (ts) { timeSigStr = ts[1]; continue; }
      const km = t.match(/^Key:\s*([A-G][#b]?[m]?)/i);
      if (km) { key = km[1]; continue; }
    }

    const subdivisionsPerBar = getSubdivisionsPerBar(timeSigStr);
    const rawBars = [];
    let currentBar = null;

    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      const barMatch = t.match(/^Bar:\s*(\d+)$/i);
      if (barMatch) {
        currentBar = { barNumber: parseInt(barMatch[1]), pitches: new Map() };
        rawBars.push(currentBar);
        continue;
      }
      if (!currentBar) continue;
      const noteLineMatch = t.match(/^([A-G][#b]?-?\d+):\s*(.+)$/i);
      if (!noteLineMatch) continue;
      const pitch = noteLineMatch[1];
      const symbols = noteLineMatch[2].trim().split(/\s+/).filter(Boolean);
      const expanded = expandCompression(symbols);
      if (expanded.length !== subdivisionsPerBar) {
        throw new Error(`Bar ${currentBar.barNumber} ${pitch}: expected ${subdivisionsPerBar} subdivisions, got ${expanded.length}`);
      }
      currentBar.pitches.set(pitch, expanded);
    }

    const activeNotes = new Map();
    const resolvedNotes = [];
    const totalBars = rawBars.length;

    for (let bi = 0; bi < totalBars; bi++) {
      const bar = rawBars[bi];
      const barAbsOffset = bi * subdivisionsPerBar;
      const allPitches = new Set([...bar.pitches.keys(), ...activeNotes.keys()]);

      for (const pitch of allPitches) {
        const symbols = bar.pitches.get(pitch);
        if (!symbols) {
          if (activeNotes.has(pitch)) {
            const active = activeNotes.get(pitch);
            resolvedNotes.push({ pitch, startBarNumber: active.startBarNumber, startSub: active.startSub, durationSubdivisions: barAbsOffset - active.startAbsSub, velocity: active.velocity });
            activeNotes.delete(pitch);
          }
          continue;
        }

        let active = activeNotes.get(pitch) || null;
        for (let s = 0; s < symbols.length; s++) {
          const parsed = parseSymbol(symbols[s]);
          if (parsed.type === 'rest') {
            if (active) {
              resolvedNotes.push({ pitch, startBarNumber: active.startBarNumber, startSub: active.startSub, durationSubdivisions: barAbsOffset + s - active.startAbsSub, velocity: active.velocity });
              activeNotes.delete(pitch); active = null;
            }
          } else if (parsed.type === 'sustain') {
            if (active && parsed.sustainCutoff !== null) {
              resolvedNotes.push({ pitch, startBarNumber: active.startBarNumber, startSub: active.startSub, durationSubdivisions: barAbsOffset + s - active.startAbsSub, velocity: active.velocity });
              activeNotes.delete(pitch); active = null;
            }
          } else if (parsed.type === 'note') {
            if (active) {
              resolvedNotes.push({ pitch, startBarNumber: active.startBarNumber, startSub: active.startSub, durationSubdivisions: barAbsOffset + s - active.startAbsSub, velocity: active.velocity });
              activeNotes.delete(pitch); active = null;
            }
            if (parsed.durationPercent !== null) {
              resolvedNotes.push({ pitch, startBarNumber: bar.barNumber, startSub: s % subdivisionsPerBar, durationSubdivisions: 1, velocity: parsed.velocity });
            } else {
              active = { startBarNumber: bar.barNumber, startSub: s % subdivisionsPerBar, startAbsSub: barAbsOffset + s, velocity: parsed.velocity };
              activeNotes.set(pitch, active);
            }
          }
        }
      }
    }

    for (const [pitch, active] of activeNotes.entries()) {
      const endAbsSub = totalBars * subdivisionsPerBar;
      const duration = endAbsSub - active.startAbsSub;
      if (duration > 0) resolvedNotes.push({ pitch, startBarNumber: active.startBarNumber, startSub: active.startSub, durationSubdivisions: duration, velocity: active.velocity });
    }

    const barsMap = new Map();
    for (const bar of rawBars) barsMap.set(bar.barNumber, { bar_number: bar.barNumber, notes: [] });
    for (const note of resolvedNotes) {
      if (!barsMap.has(note.startBarNumber)) barsMap.set(note.startBarNumber, { bar_number: note.startBarNumber, notes: [] });
      barsMap.get(note.startBarNumber).notes.push({ pitch: note.pitch, start_subdivision: note.startSub, duration_subdivisions: note.durationSubdivisions, velocity: note.velocity });
    }

    return { tempo, time_signature: timeSigStr, key, bars: Array.from(barsMap.values()).sort((a, b) => a.bar_number - b.bar_number) };
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const DEFAULT_INPUT = `Tempo: 85
TimeSig: 4/4
Key: Dm

Bar: 1
D2: X40 ~(15)
A4: .(8) X75 ~(7)

Bar: 2
D2: ~(16)
A4: ~(16)

Bar: 3
D2: ~(16)
A4: .(4) X90 ~(11)`;

export default function TextToJson() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);

  const handleConvert = () => {
    setIsProcessing(true);
    setErrors([]);
    setOutput('');
    setStats(null);
    setTimeout(() => {
      try {
        const json = TextToJsonEngine.convert(input);
        setOutput(JSON.stringify(json, null, 2));
        const totalNotes = json.bars.reduce((acc, b) => acc + b.notes.length, 0);
        setStats({ bars: json.bars.length, notes: totalNotes, tempo: json.tempo, key: json.key, timeSig: json.time_signature });
      } catch (err) {
        setErrors([err.message || 'Conversion failed']);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 md:p-6 flex flex-col">

      {/* Header */}
      <div className="text-center mb-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
          Text → JSON Converter
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          Convert your MIDI text notation into Generation JSON for RAG knowledge base
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">your text format</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">generation json</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">pinecone rag</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

        {/* LEFT — Input */}
        <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-emerald-500/20 shadow-xl">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-400" />
            MIDI Text Input
          </h2>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            placeholder={`Tempo: 120\nTimeSig: 4/4\nKey: C\n\nBar: 1\nC4: X .(15)\nE4: .(4) X .(11)`}
            className="flex-1 w-full min-h-64 md:min-h-96 bg-black/60 border border-slate-700 rounded-xl p-4 text-gray-100 font-mono resize-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/40 shadow-inner text-sm md:text-base leading-relaxed tracking-wide transition-all"
          />

          <button
            onClick={handleConvert}
            disabled={isProcessing || !input.trim()}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Converting...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Convert to JSON
              </>
            )}
          </button>
        </div>

        {/* RIGHT — Output + Status */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-blue-500/20 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400 font-mono">{'{ }'}</span>
                JSON Output
              </h2>
              {output && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${copied ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'}`}
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="JSON output will appear here..."
              className="flex-1 w-full min-h-64 md:min-h-80 bg-black/60 border border-slate-700 rounded-xl p-4 text-gray-100 font-mono resize-none text-xs md:text-sm leading-relaxed shadow-inner focus:outline-none"
            />
          </div>

          {/* Status */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 shadow-xl">
            {errors.length > 0 ? (
              <div>
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Errors
                </h4>
                <ul className="text-red-300 text-xs space-y-1">
                  {errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            ) : stats ? (
              <div>
                <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4" /> Conversion Complete
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Bars',    value: stats.bars },
                    { label: 'Notes',   value: stats.notes },
                    { label: 'Tempo',   value: stats.tempo },
                    { label: 'Key',     value: stats.key },
                    { label: 'TimeSig', value: stats.timeSig },
                  ].map(s => (
                    <div key={s.label} className="bg-black/30 rounded-lg p-2 text-center border border-slate-700/50">
                      <div className="text-white font-bold text-sm">{s.value}</div>
                      <div className="text-slate-500 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Activity className="w-4 h-4 text-slate-500" />
                Enter your MIDI text notation and click Convert to JSON
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}