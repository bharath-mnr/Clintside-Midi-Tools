import React, { useState } from 'react';
import { Activity, AlertTriangle, Copy, CheckCheck, Download } from 'lucide-react';

// ─────────────────────────────────────────────
// ENGINE
// ─────────────────────────────────────────────

function getSubdivisionsPerBar(timeSigStr) {
  const [num, den] = timeSigStr.split('/').map(Number);
  const subs = num * (16 / den);
  if (!Number.isInteger(subs)) throw new Error(`Invalid time signature ${timeSigStr}`);
  return subs;
}

function compressPattern(slots) {
  const compressed = [];
  let i = 0;
  while (i < slots.length) {
    const current = slots[i];
    let count = 1;
    while (i + count < slots.length && slots[i + count] === current) count++;
    if (count >= 3) {
      compressed.push(`${current}(${count})`);
    } else {
      for (let j = 0; j < count; j++) compressed.push(current);
    }
    i += count;
  }
  return compressed;
}

function pitchToMidi(pitch) {
  const noteMap = { 'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11 };
  const match = pitch.match(/^([A-G][#b]?)(-?\d+)$/i);
  if (!match) return 0;
  const noteName = match[1].toUpperCase();
  const octave = parseInt(match[2]);
  return (octave + 1) * 12 + (noteMap[noteName] ?? 0);
}

class JsonToTextEngine {
  static convert(json) {
    const { tempo, time_signature, key, bars } = json;
    if (!bars || bars.length === 0) throw new Error('No bars found in JSON');

    const subdivisionsPerBar = getSubdivisionsPerBar(time_signature);
    const globalNotes = [];

    for (const bar of bars) {
      if (!bar.notes) continue;
      const barOffset = (bar.bar_number - 1) * subdivisionsPerBar;
      for (const note of bar.notes) {
        const startAbs = barOffset + (note.start_subdivision || 0);
        const endAbs = startAbs + (note.duration_subdivisions || 1);
        const velocity = Math.min(127, Math.max(1, note.velocity || 100));
        globalNotes.push({ pitch: note.pitch, startAbs, endAbs, velocity });
      }
    }

    const maxBarDeclared = Math.max(...bars.map(b => b.bar_number));
    const maxSubFromNotes = globalNotes.length > 0 ? Math.max(...globalNotes.map(n => n.endAbs)) : 0;
    const totalBars = Math.max(maxBarDeclared, Math.ceil(maxSubFromNotes / subdivisionsPerBar));

    const barOutputs = [];

    for (let barNum = 1; barNum <= totalBars; barNum++) {
      const barStartAbs = (barNum - 1) * subdivisionsPerBar;
      const barEndAbs = barNum * subdivisionsPerBar;
      const activeNotes = globalNotes.filter(n => n.startAbs < barEndAbs && n.endAbs > barStartAbs);
      const pitchSlots = new Map();

      for (const note of activeNotes) {
        if (!pitchSlots.has(note.pitch)) pitchSlots.set(note.pitch, new Array(subdivisionsPerBar).fill('.'));
        const slots = pitchSlots.get(note.pitch);
        const localStart = Math.max(note.startAbs - barStartAbs, 0);
        const localEnd   = Math.min(note.endAbs   - barStartAbs, subdivisionsPerBar);
        for (let s = localStart; s < localEnd; s++) {
          if (s === localStart) {
            if (note.startAbs >= barStartAbs) {
              slots[s] = note.velocity === 100 ? 'X' : `X${note.velocity}`;
            } else {
              slots[s] = '~';
            }
          } else {
            slots[s] = '~';
          }
        }
      }
      barOutputs.push({ barNum, pitchSlots });
    }

    let output = `Tempo: ${tempo}\nTimeSig: ${time_signature}\nKey: ${key}`;

    for (const { barNum, pitchSlots } of barOutputs) {
      output += `\n\nBar: ${barNum}`;
      if (pitchSlots.size === 0) continue;
      const sortedPitches = Array.from(pitchSlots.keys()).sort((a, b) => pitchToMidi(a) - pitchToMidi(b));
      for (const pitch of sortedPitches) {
        const slots = pitchSlots.get(pitch);
        if (slots.length !== subdivisionsPerBar) throw new Error(`Internal error: Bar ${barNum} ${pitch} has wrong slot count`);
        const compressed = compressPattern(slots);
        output += `\n${pitch}: ${compressed.join(' ')}`;
      }
    }

    return output.trim();
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const DEFAULT_INPUT = JSON.stringify({
  tempo: 85,
  time_signature: "4/4",
  key: "Dm",
  bars: [
    {
      bar_number: 1,
      notes: [
        { pitch: "D2", start_subdivision: 0,  duration_subdivisions: 48, velocity: 40 },
        { pitch: "A4", start_subdivision: 8,  duration_subdivisions: 8,  velocity: 75 },
        { pitch: "F4", start_subdivision: 4,  duration_subdivisions: 4,  velocity: 65 }
      ]
    },
    {
      bar_number: 3,
      notes: [
        { pitch: "A4", start_subdivision: 4, duration_subdivisions: 12, velocity: 90 }
      ]
    }
  ]
}, null, 2);

export default function JsonToText() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [jsonValid, setJsonValid] = useState(true);

  const handleInputChange = (val) => {
    setInput(val);
    try { JSON.parse(val); setJsonValid(true); } catch { setJsonValid(false); }
  };

  const handleConvert = () => {
    setIsProcessing(true);
    setErrors([]);
    setOutput('');
    setStats(null);
    setTimeout(() => {
      try {
        const json = JSON.parse(input);
        const text = JsonToTextEngine.convert(json);
        setOutput(text);

        // Count stats
        const lines = text.split('\n');
        const noteLines = lines.filter(l => l.match(/^[A-G]/));
        const barLines  = lines.filter(l => l.startsWith('Bar:'));
        setStats({ bars: barLines.length, lines: noteLines.length, tempo: json.tempo, key: json.key, timeSig: json.time_signature });
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
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
          JSON → Text Converter
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          Convert LLM Generation JSON into your exact MIDI text format
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">llm json output</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-mono">your text format</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">midi file</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

        {/* LEFT — JSON Input */}
        <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono">{'{ }'}</span>
              Generation JSON Input
            </h2>
            {/* JSON valid indicator */}
            <span className={`text-xs px-2 py-1 rounded-full font-mono border ${input.trim() ? (jsonValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400') : 'bg-slate-700/30 border-slate-600/20 text-slate-500'}`}>
              {input.trim() ? (jsonValid ? '✓ valid json' : '✗ invalid json') : 'empty'}
            </span>
          </div>

          <textarea
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            spellCheck={false}
            placeholder='{ "tempo": 120, "time_signature": "4/4", "key": "C", "bars": [...] }'
            className={`flex-1 w-full min-h-64 md:min-h-96 bg-black/60 border rounded-xl p-4 text-gray-100 font-mono resize-none focus:ring-2 shadow-inner text-xs md:text-sm leading-relaxed tracking-wide transition-all ${
              !input.trim() || jsonValid
                ? 'border-slate-700 focus:ring-purple-500/50 focus:border-purple-500/40'
                : 'border-red-500/40 focus:ring-red-500/30'
            }`}
          />

          <button
            onClick={handleConvert}
            disabled={isProcessing || !input.trim() || !jsonValid}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                Convert to Text
              </>
            )}
          </button>
        </div>

        {/* RIGHT — Text Output + Status */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-pink-500/20 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-pink-400 font-mono text-base">♩</span>
                MIDI Text Output
              </h2>
              {output && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${copied ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20'}`}
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              )}
            </div>

            <textarea
              value={output}
              readOnly
              placeholder="Your exact MIDI text notation will appear here..."
              className="flex-1 w-full min-h-64 md:min-h-80 bg-black/60 border border-slate-700 rounded-xl p-4 text-gray-100 font-mono resize-none text-sm md:text-base leading-relaxed shadow-inner focus:outline-none tracking-wide"
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
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4" /> Conversion Complete — Ready for MIDI converter
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Bars',      value: stats.bars },
                    { label: 'NoteLines', value: stats.lines },
                    { label: 'Tempo',     value: stats.tempo },
                    { label: 'Key',       value: stats.key },
                    { label: 'TimeSig',   value: stats.timeSig },
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
                Paste your Generation JSON and click Convert to Text
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}