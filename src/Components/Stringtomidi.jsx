// import React, { useState } from 'react';
// import { Activity, AlertTriangle, Download } from 'lucide-react';

// // ─────────────────────────────────────────────
// // NOTE MAP
// // ─────────────────────────────────────────────
// const noteMap = {
//   'C':0,'C#':1,'DB':1,'D':2,'D#':3,'EB':3,
//   'E':4,'F':5,'F#':6,'GB':6,'G':7,'G#':8,'AB':8,
//   'A':9,'A#':10,'BB':10,'B':11
// };

// // ─────────────────────────────────────────────
// // STRING FORMAT PARSER (v3 — flat delimited, no JSON)
// // H: tempo|time_signature|key|spb
// // B<n>: p,s,d[,oNN][,cNN] ; p,s,d... ; ...
// // Empty/held-over bar: "B<n>:" with nothing after
// // ─────────────────────────────────────────────
// function parseCompactString(str) {
//   const lines = str.split('\n').map(l => l.trim()).filter(l => l.length > 0);

//   let header = null;
//   const bars = [];

//   for (const line of lines) {
//     if (line.startsWith('H:')) {
//       const parts = line.slice(2).trim().split('|');
//       if (parts.length !== 4) throw new Error(`Malformed header: "${line}"`);
//       const [tempoStr, time_signature, key, spbStr] = parts;
//       header = {
//         tempo: parseFloat(tempoStr),
//         time_signature: time_signature.trim(),
//         key: key.trim(),
//         subdivisions_per_bar: parseInt(spbStr, 10)
//       };
//       if (isNaN(header.tempo)) throw new Error(`Invalid tempo: "${tempoStr}"`);
//       if (isNaN(header.subdivisions_per_bar)) throw new Error(`Invalid spb: "${spbStr}"`);
//       continue;
//     }

//     const barMatch = line.match(/^B(\d+):\s*(.*)$/i);
//     if (!barMatch) throw new Error(`Malformed line (expected "B<n>:" or "H:"): "${line}"`);

//     const bar_number = parseInt(barMatch[1], 10);
//     const body = barMatch[2].trim();

//     const notes = [];
//     if (body.length > 0) {
//       const noteStrs = body.split(';').map(s => s.trim()).filter(s => s.length > 0);
//       for (const noteStr of noteStrs) {
//         const fields = noteStr.split(',').map(f => f.trim());
//         if (fields.length < 3) throw new Error(`Bar ${bar_number}: note missing required fields (p,s,d): "${noteStr}"`);

//         const [p, sStr, dStr, ...rest] = fields;
//         const s = parseInt(sStr, 10);
//         const d = parseInt(dStr, 10);
//         if (isNaN(s) || isNaN(d)) throw new Error(`Bar ${bar_number}: invalid s/d in "${noteStr}"`);

//         const note = { p, s, d, o: 0, c: null };
//         for (const tok of rest) {
//           if (/^o-?\d+$/i.test(tok)) note.o = parseInt(tok.slice(1), 10);
//           else if (/^c\d+$/i.test(tok)) note.c = parseInt(tok.slice(1), 10);
//           else throw new Error(`Bar ${bar_number}: unrecognized token "${tok}" in "${noteStr}"`);
//         }
//         notes.push(note);
//       }
//     }

//     bars.push({ bar_number, notes });
//   }

//   if (!header) throw new Error('Missing header line (H: ...)');
//   if (bars.length === 0) throw new Error('No bars found');

//   bars.sort((a, b) => a.bar_number - b.bar_number);
//   for (let i = 0; i < bars.length; i++) {
//     if (bars[i].bar_number !== i + 1) {
//       throw new Error(`Bars not sequential from 1 — gap or duplicate near bar ${i + 1} (found B${bars[i].bar_number})`);
//     }
//   }

//   return { ...header, bars };
// }

// // ─────────────────────────────────────────────
// // ENGINE: Compact String → MIDI
// // ─────────────────────────────────────────────
// class StringToMidiEngine {

//   static getSubdivisionsPerBar(timeSigStr) {
//     const [num, den] = timeSigStr.split('/').map(Number);
//     const subs = num * (16 / den);
//     if (!Number.isInteger(subs)) throw new Error(`Invalid time signature: ${timeSigStr}`);
//     return subs;
//   }

//   static pitchToMidi(pitch) {
//     const match = pitch.match(/^([A-G][#Bb]?)(-?\d+)$/i);
//     if (!match) throw new Error(`Invalid pitch: ${pitch}`);
//     const noteName = match[1].toUpperCase();
//     const octave   = parseInt(match[2]);
//     if (!(noteName in noteMap)) throw new Error(`Unknown note: ${noteName}`);
//     return (octave + 1) * 12 + noteMap[noteName];
//   }

//   static writeVariableLength(value) {
//     let buffer = value & 0x7F;
//     const bytes = [];
//     while ((value >>= 7) > 0) { buffer <<= 8; buffer |= (value & 0x7F) | 0x80; }
//     while (true) { bytes.push(buffer & 0xFF); if (buffer & 0x80) buffer >>= 8; else break; }
//     return bytes;
//   }

//   static docToMidiEvents(doc) {
//     const { tempo, time_signature, bars } = doc;

//     const timeSigParts        = time_signature.split('/').map(Number);
//     const timeSig             = { numerator: timeSigParts[0], denominator: timeSigParts[1] };
//     const ticksPerQuarter     = 480;
//     const subdivisionsPerBar  = this.getSubdivisionsPerBar(time_signature);
//     const barTicks            = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
//     const ticksPerSubdivision = barTicks / subdivisionsPerBar;

//     const midiEvents = [];

//     for (const bar of bars) {
//       if (!bar.notes) continue;
//       const barBaseTick = (bar.bar_number - 1) * barTicks;

//       for (const note of bar.notes) {
//         const midiPitch = this.pitchToMidi(note.p);
//         const velocity  = 100; // fixed

//         const offsetFraction = (note.o || 0) / 100;
//         const startTick = barBaseTick
//           + note.s * ticksPerSubdivision
//           + offsetFraction * ticksPerSubdivision;

//         let durationTicks;
//         if (note.d === 0) {
//           const cutoff = (note.c || 50) / 100;
//           durationTicks = cutoff * ticksPerSubdivision;
//         } else {
//           durationTicks = note.d * ticksPerSubdivision;
//           if (note.c !== null && note.c !== undefined) {
//             durationTicks = (note.d - 1) * ticksPerSubdivision
//               + (note.c / 100) * ticksPerSubdivision;
//           }
//         }

//         if (durationTicks <= 0) continue;
//         const endTick = startTick + durationTicks;
//         midiEvents.push({ tick: startTick, type: 'on',  pitch: midiPitch, velocity });
//         midiEvents.push({ tick: endTick,   type: 'off', pitch: midiPitch, velocity: 0 });
//       }
//     }

//     midiEvents.sort((a, b) => {
//       if (a.tick !== b.tick) return a.tick - b.tick;
//       if (a.type === 'off' && b.type === 'on') return -1;
//       if (a.type === 'on'  && b.type === 'off') return 1;
//       return a.pitch - b.pitch;
//     });

//     return { midiEvents, tempo, timeSig, ticksPerQuarter };
//   }

//   static generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter) {
//     const data = [];
//     const writeBytes = (bytes) => bytes.forEach(b => data.push(b & 0xFF));
//     const writeInt   = (value, numBytes) => {
//       for (let i = numBytes - 1; i >= 0; i--) data.push((value >> (8 * i)) & 0xFF);
//     };

//     writeBytes([0x4D,0x54,0x68,0x64]);
//     writeInt(6,4); writeInt(0,2); writeInt(1,2); writeInt(ticksPerQuarter,2);

//     const trackData = [];
//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xFF,0x51,0x03);
//     const us = Math.round(60000000 / tempo);
//     trackData.push((us>>16)&0xFF,(us>>8)&0xFF,us&0xFF);

//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xFF,0x58,0x04);
//     trackData.push(timeSig.numerator, Math.log2(timeSig.denominator), 24, 8);

//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xC0,0x00);

//     let lastTick = 0;
//     for (const event of midiEvents) {
//       const deltaTime = Math.max(0, Math.round(event.tick - lastTick));
//       trackData.push(...this.writeVariableLength(deltaTime));
//       if (event.type === 'on') trackData.push(0x90, event.pitch&0x7F, event.velocity&0x7F);
//       else                     trackData.push(0x80, event.pitch&0x7F, 0x40);
//       lastTick += deltaTime;
//     }

//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xFF,0x2F,0x00);

//     writeBytes([0x4D,0x54,0x72,0x6B]);
//     writeInt(trackData.length,4);
//     writeBytes(trackData);
//     return new Uint8Array(data);
//   }

//   static convert(compactStr) {
//     const doc = parseCompactString(compactStr);
//     if (!doc.bars || doc.bars.length === 0) throw new Error('No bars found');
//     if (!doc.time_signature) throw new Error('Missing time_signature');
//     if (!doc.tempo) throw new Error('Missing tempo');
//     const { midiEvents, tempo, timeSig, ticksPerQuarter } = this.docToMidiEvents(doc);
//     return { bytes: this.generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter), doc };
//   }
// }

// // ─────────────────────────────────────────────
// // DEFAULT EXAMPLE — v3 compact string format
// // ─────────────────────────────────────────────
// const DEFAULT_INPUT =
// `H: 85|4/4|Dm|16
// B1: D2,0,16; F4,4,4; A4,8,8
// B2: D2,0,16; A4,0,8`;

// // ─────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────
// export default function StringToMidi() {
//   const [input,        setInput]        = useState(DEFAULT_INPUT);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errors,       setErrors]       = useState([]);
//   const [formatValid,  setFormatValid]  = useState(true);
//   const [stats,        setStats]        = useState(null);
//   const [converted,    setConverted]    = useState(false);

//   const handleInputChange = (val) => {
//     setInput(val);
//     setConverted(false);
//     try { parseCompactString(val); setFormatValid(true); } catch { setFormatValid(false); }
//   };

//   const handleConvert = () => {
//     setIsProcessing(true);
//     setErrors([]);
//     setStats(null);
//     setConverted(false);

//     setTimeout(() => {
//       try {
//         const { bytes, doc } = StringToMidiEngine.convert(input);

//         const blob = new Blob([bytes], { type: 'audio/midi' });
//         const url  = URL.createObjectURL(blob);
//         const a    = document.createElement('a');
//         a.href     = url;
//         a.download = `${doc.key || 'composition'}_${doc.tempo}bpm.mid`;
//         document.body.appendChild(a);
//         a.click();
//         URL.revokeObjectURL(url);
//         document.body.removeChild(a);

//         const totalNotes = doc.bars.reduce((acc, b) => acc + ((b.notes ?? []).length), 0);
//         setStats({
//           bars:    doc.bars.length,
//           notes:   totalNotes,
//           tempo:   doc.tempo,
//           key:     doc.key || '?',
//           timeSig: doc.time_signature,
//           size:    `${(bytes.length / 1024).toFixed(1)} KB`
//         });
//         setConverted(true);
//       } catch (err) {
//         setErrors([err.message || 'Conversion failed']);
//       } finally {
//         setIsProcessing(false);
//       }
//     }, 0);
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 md:p-6 flex flex-col">

//       {/* Header */}
//       <div className="text-center mb-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-xl">
//         <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
//           Compact String → MIDI
//         </h1>
//         <p className="mt-2 text-gray-400 text-sm">
//           Flat delimited format · no braces/brackets/quotes · velocity fixed at 100
//         </p>
//         <div className="flex items-center justify-center gap-3 mt-3 flex-wrap text-xs">
//           <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono">B1: p,s,d</span>
//           <span className="text-slate-500">→</span>
//           <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">binary converter</span>
//           <span className="text-slate-500">→</span>
//           <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">.mid download</span>
//         </div>
//       </div>

//       {/* Main Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

//         {/* LEFT — String Input */}
//         <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-violet-500/20 shadow-xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-white flex items-center gap-2">
//               <span className="text-violet-400 font-mono">B:</span>
//               Compact String Input
//             </h2>
//             <span className={`text-xs px-2 py-1 rounded-full font-mono border ${
//               !input.trim()
//                 ? 'bg-slate-700/30 border-slate-600/20 text-slate-500'
//                 : formatValid
//                   ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
//                   : 'bg-red-500/10 border-red-500/20 text-red-400'
//             }`}>
//               {!input.trim() ? 'empty' : formatValid ? '✓ valid' : '✗ invalid'}
//             </span>
//           </div>

//           <textarea
//             value={input}
//             onChange={e => handleInputChange(e.target.value)}
//             spellCheck={false}
//             className={`flex-1 w-full min-h-64 md:min-h-96 bg-black/60 border rounded-xl p-4 text-gray-100 font-mono resize-none text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 ${
//               !input.trim() || formatValid
//                 ? 'border-slate-700 focus:ring-violet-500/40 focus:border-violet-500/30'
//                 : 'border-red-500/40 focus:ring-red-500/30'
//             }`}
//           />

//           <button
//             onClick={handleConvert}
//             disabled={isProcessing || !input.trim() || !formatValid}
//             className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {isProcessing ? (
//               <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Generating MIDI...</>
//             ) : (
//               <><Download className="w-4 h-4" />Convert & Download MIDI</>
//             )}
//           </button>
//         </div>

//         {/* RIGHT — Reference + Status */}
//         <div className="flex flex-col gap-4">
//           <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-blue-500/20 shadow-xl flex-1">
//             <h2 className="text-lg font-semibold text-white mb-4">Compact Field Reference</h2>

//             <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Structure</p>
//             <div className="space-y-1 mb-4 font-mono text-xs">
//               <div className="p-2 rounded-lg bg-white/5 text-slate-300">H: tempo|time_sig|key|spb</div>
//               <div className="p-2 rounded-lg bg-white/5 text-slate-300">B&lt;n&gt;: p,s,d ; p,s,d ...</div>
//             </div>

//             {/* Required fields */}
//             <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Required (positional, no labels)</p>
//             <div className="space-y-1 mb-4">
//               {[
//                 ['p', 'pitch (1st)',               '"C4", "F#3", "Bb5"'],
//                 ['s', 'start_subdivision (2nd)',   '0–15 (4/4) · 0–11 (3/4 or 6/8)'],
//                 ['d', 'duration_subdivisions (3rd)','4=quarter · 8=half · 16=whole'],
//               ].map(([sh, full, hint]) => (
//                 <div key={sh} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
//                   <code className="text-cyan-400 text-xs w-4 font-mono font-bold">{sh}</code>
//                   <code className="text-slate-400 text-xs w-40 font-mono">{full}</code>
//                   <span className="text-slate-300 text-xs">{hint}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Optional fields */}
//             <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Optional tags (omit when default)</p>
//             <div className="space-y-1 mb-4">
//               {[
//                 ['oNN', 'offset_percent',      'e.g. o18 · omit when 0'],
//                 ['cNN', 'end_cutoff_percent',  'e.g. c60 · omit when full sustain'],
//               ].map(([sh, full, hint]) => (
//                 <div key={sh} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
//                   <code className="text-yellow-400 text-xs w-10 font-mono font-bold">{sh}</code>
//                   <code className="text-slate-400 text-xs w-32 font-mono">{full}</code>
//                   <span className="text-slate-300 text-xs">{hint}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Removed */}
//             <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg mb-4">
//               <p className="text-red-400 text-xs">
//                 <span className="font-semibold">velocity — removed.</span> Client sets all notes to 100 automatically. No JSON braces/brackets/quotes anywhere in this format.
//               </p>
//             </div>

//             {/* Duration table */}
//             <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Duration reference (4/4)</p>
//             <div className="grid grid-cols-4 gap-1 text-xs font-mono">
//               {[['d=1','16th'],['d=2','8th'],['d=4','qtr'],['d=8','half'],
//                 ['d=16','whole'],['d=32','2 bars'],['d=48','3 bars'],['d=64','4 bars']
//               ].map(([d, label]) => (
//                 <div key={d} className="bg-black/30 rounded p-1.5 text-center border border-slate-700/50">
//                   <div className="text-cyan-400">{d}</div>
//                   <div className="text-slate-500">{label}</div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
//               <p className="text-blue-300 text-xs">
//                 <span className="font-semibold">Cross-bar:</span> set <code className="text-cyan-400">d</code> beyond 1 bar (e.g. d=32 = 2 bars in 4/4). Declare once in starting bar only. Empty / held-over bars are written as <code className="text-cyan-400">B&lt;n&gt;:</code> with nothing after the colon.
//               </p>
//             </div>
//           </div>

//           {/* Status */}
//           <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 shadow-xl">
//             {errors.length > 0 ? (
//               <div>
//                 <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-1.5 text-sm">
//                   <AlertTriangle className="w-4 h-4" /> Error
//                 </h4>
//                 <ul className="text-red-300 text-xs space-y-1">{errors.map((e,i) => <li key={i}>• {e}</li>)}</ul>
//               </div>
//             ) : converted && stats ? (
//               <div>
//                 <h4 className="font-semibold text-cyan-400 mb-3 flex items-center gap-1.5 text-sm">
//                   <Download className="w-4 h-4" /> MIDI Downloaded
//                 </h4>
//                 <div className="grid grid-cols-6 gap-2">
//                   {[['Bars',stats.bars],['Notes',stats.notes],['BPM',stats.tempo],['Key',stats.key],['Time',stats.timeSig],['Size',stats.size]].map(([l,v]) => (
//                     <div key={l} className="bg-black/30 rounded-lg p-2 text-center border border-slate-700/50">
//                       <div className="text-white font-bold text-sm">{v}</div>
//                       <div className="text-slate-500 text-xs">{l}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2 text-sm text-slate-400">
//                 <Activity className="w-4 h-4 text-slate-500" />
//                 Paste compact string and click Convert
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }









import React, { useState } from 'react';
import { Activity, AlertTriangle, Download } from 'lucide-react';

// ─────────────────────────────────────────────
// NOTE MAP
// ─────────────────────────────────────────────
const noteMap = {
  'C':0,'C#':1,'DB':1,'D':2,'D#':3,'EB':3,
  'E':4,'F':5,'F#':6,'GB':6,'G':7,'G#':8,'AB':8,
  'A':9,'A#':10,'BB':10,'B':11
};

// ─────────────────────────────────────────────
// STRING FORMAT PARSER (v4 — collapsed + auto‑order)
// H: tempo|time_signature|key|spb
// B<n>: p,s,d[,oNN][,cNN] ; p,s,d... ; ...
// Empty/held-over bar: "B<n>:" with nothing after
// ─────────────────────────────────────────────
function parseCompactString(str) {
  str = str.trim();

  // Extract header: "H:" at start, until first bar marker or end
  const headerMatch = str.match(/^H:\s*(.*?)(?=\s*B\d+:|\s*$)/);
  if (!headerMatch) throw new Error('Missing header line (H: ...)');
  const headerRaw = headerMatch[1].trim();
  const headerParts = headerRaw.split('|');
  if (headerParts.length !== 4) throw new Error(`Malformed header: "${headerRaw}"`);
  const [tempoStr, time_signature, key, spbStr] = headerParts;
  const header = {
    tempo: parseFloat(tempoStr),
    time_signature: time_signature.trim(),
    key: key.trim(),
    subdivisions_per_bar: parseInt(spbStr, 10)
  };
  if (isNaN(header.tempo)) throw new Error(`Invalid tempo: "${tempoStr}"`);
  if (isNaN(header.subdivisions_per_bar)) throw new Error(`Invalid spb: "${spbStr}"`);

  // Find all bar markers "B<number>:"
  const barRegex = /B(\d+):/g;
  let match;
  const matches = [];
  while ((match = barRegex.exec(str)) !== null) {
    matches.push({
      barNumber: parseInt(match[1], 10),
      startIndex: match.index,
      endIndex: match.index + match[0].length // after the colon
    });
  }
  if (matches.length === 0) throw new Error('No bars found');

  // Extract content for each bar
  const bars = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const contentStart = current.endIndex;
    const contentEnd = next ? next.startIndex : str.length;
    const content = str.substring(contentStart, contentEnd).trim();

    const notes = [];
    if (content.length > 0) {
      const noteStrs = content.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const noteStr of noteStrs) {
        const fields = noteStr.split(',').map(f => f.trim());
        if (fields.length < 3) throw new Error(`Bar ${current.barNumber}: note missing required fields (p,s,d): "${noteStr}"`);
        const [p, sStr, dStr, ...rest] = fields;
        const s = parseInt(sStr, 10);
        const d = parseInt(dStr, 10);
        if (isNaN(s) || isNaN(d)) throw new Error(`Bar ${current.barNumber}: invalid s/d in "${noteStr}"`);
        const note = { p, s, d, o: 0, c: null };
        for (const tok of rest) {
          if (/^o-?\d+$/i.test(tok)) note.o = parseInt(tok.slice(1), 10);
          else if (/^c\d+$/i.test(tok)) note.c = parseInt(tok.slice(1), 10);
          else throw new Error(`Bar ${current.barNumber}: unrecognized token "${tok}" in "${noteStr}"`);
        }
        notes.push(note);
      }
    }
    bars.push({ bar_number: current.barNumber, notes });
  }

  // Sort by bar number and fill gaps with empty bars
  bars.sort((a, b) => a.bar_number - b.bar_number);
  if (bars.length === 0) throw new Error('No bars found');
  const maxBar = bars[bars.length - 1].bar_number;
  const normalized = [];
  let barIndex = 0;
  for (let i = 1; i <= maxBar; i++) {
    if (barIndex < bars.length && bars[barIndex].bar_number === i) {
      normalized.push(bars[barIndex]);
      barIndex++;
    } else {
      normalized.push({ bar_number: i, notes: [] });
    }
  }

  return { ...header, bars: normalized };
}

// ─────────────────────────────────────────────
// ENGINE: Compact String → MIDI
// ─────────────────────────────────────────────
class StringToMidiEngine {

  static getSubdivisionsPerBar(timeSigStr) {
    const [num, den] = timeSigStr.split('/').map(Number);
    const subs = num * (16 / den);
    if (!Number.isInteger(subs)) throw new Error(`Invalid time signature: ${timeSigStr}`);
    return subs;
  }

  static pitchToMidi(pitch) {
    const match = pitch.match(/^([A-G][#Bb]?)(-?\d+)$/i);
    if (!match) throw new Error(`Invalid pitch: ${pitch}`);
    const noteName = match[1].toUpperCase();
    const octave   = parseInt(match[2]);
    if (!(noteName in noteMap)) throw new Error(`Unknown note: ${noteName}`);
    return (octave + 1) * 12 + noteMap[noteName];
  }

  static writeVariableLength(value) {
    let buffer = value & 0x7F;
    const bytes = [];
    while ((value >>= 7) > 0) { buffer <<= 8; buffer |= (value & 0x7F) | 0x80; }
    while (true) { bytes.push(buffer & 0xFF); if (buffer & 0x80) buffer >>= 8; else break; }
    return bytes;
  }

  static docToMidiEvents(doc) {
    const { tempo, time_signature, bars } = doc;

    const timeSigParts        = time_signature.split('/').map(Number);
    const timeSig             = { numerator: timeSigParts[0], denominator: timeSigParts[1] };
    const ticksPerQuarter     = 480;
    const subdivisionsPerBar  = this.getSubdivisionsPerBar(time_signature);
    const barTicks            = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
    const ticksPerSubdivision = barTicks / subdivisionsPerBar;

    const midiEvents = [];

    for (const bar of bars) {
      if (!bar.notes) continue;
      const barBaseTick = (bar.bar_number - 1) * barTicks;

      for (const note of bar.notes) {
        const midiPitch = this.pitchToMidi(note.p);
        const velocity  = 100; // fixed

        const offsetFraction = (note.o || 0) / 100;
        const startTick = barBaseTick
          + note.s * ticksPerSubdivision
          + offsetFraction * ticksPerSubdivision;

        let durationTicks;
        if (note.d === 0) {
          const cutoff = (note.c || 50) / 100;
          durationTicks = cutoff * ticksPerSubdivision;
        } else {
          durationTicks = note.d * ticksPerSubdivision;
          if (note.c !== null && note.c !== undefined) {
            durationTicks = (note.d - 1) * ticksPerSubdivision
              + (note.c / 100) * ticksPerSubdivision;
          }
        }

        if (durationTicks <= 0) continue;
        const endTick = startTick + durationTicks;
        midiEvents.push({ tick: startTick, type: 'on',  pitch: midiPitch, velocity });
        midiEvents.push({ tick: endTick,   type: 'off', pitch: midiPitch, velocity: 0 });
      }
    }

    midiEvents.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'off' && b.type === 'on') return -1;
      if (a.type === 'on'  && b.type === 'off') return 1;
      return a.pitch - b.pitch;
    });

    return { midiEvents, tempo, timeSig, ticksPerQuarter };
  }

  static generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter) {
    const data = [];
    const writeBytes = (bytes) => bytes.forEach(b => data.push(b & 0xFF));
    const writeInt   = (value, numBytes) => {
      for (let i = numBytes - 1; i >= 0; i--) data.push((value >> (8 * i)) & 0xFF);
    };

    writeBytes([0x4D,0x54,0x68,0x64]);
    writeInt(6,4); writeInt(0,2); writeInt(1,2); writeInt(ticksPerQuarter,2);

    const trackData = [];
    trackData.push(...this.writeVariableLength(0));
    trackData.push(0xFF,0x51,0x03);
    const us = Math.round(60000000 / tempo);
    trackData.push((us>>16)&0xFF,(us>>8)&0xFF,us&0xFF);

    trackData.push(...this.writeVariableLength(0));
    trackData.push(0xFF,0x58,0x04);
    trackData.push(timeSig.numerator, Math.log2(timeSig.denominator), 24, 8);

    trackData.push(...this.writeVariableLength(0));
    trackData.push(0xC0,0x00);

    let lastTick = 0;
    for (const event of midiEvents) {
      const deltaTime = Math.max(0, Math.round(event.tick - lastTick));
      trackData.push(...this.writeVariableLength(deltaTime));
      if (event.type === 'on') trackData.push(0x90, event.pitch&0x7F, event.velocity&0x7F);
      else                     trackData.push(0x80, event.pitch&0x7F, 0x40);
      lastTick += deltaTime;
    }

    trackData.push(...this.writeVariableLength(0));
    trackData.push(0xFF,0x2F,0x00);

    writeBytes([0x4D,0x54,0x72,0x6B]);
    writeInt(trackData.length,4);
    writeBytes(trackData);
    return new Uint8Array(data);
  }

  static convert(compactStr) {
    const doc = parseCompactString(compactStr);
    if (!doc.bars || doc.bars.length === 0) throw new Error('No bars found');
    if (!doc.time_signature) throw new Error('Missing time_signature');
    if (!doc.tempo) throw new Error('Missing tempo');
    const { midiEvents, tempo, timeSig, ticksPerQuarter } = this.docToMidiEvents(doc);
    return { bytes: this.generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter), doc };
  }
}

// ─────────────────────────────────────────────
// DEFAULT EXAMPLE — v4 compact string format
// ─────────────────────────────────────────────
const DEFAULT_INPUT =
`H: 85|4/4|Dm|16
B1: D2,0,16; F4,4,4; A4,8,8
B2: D2,0,16; A4,0,8`;

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function StringToMidi() {
  const [input,        setInput]        = useState(DEFAULT_INPUT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors,       setErrors]       = useState([]);
  const [formatValid,  setFormatValid]  = useState(true);
  const [stats,        setStats]        = useState(null);
  const [converted,    setConverted]    = useState(false);

  const handleInputChange = (val) => {
    setInput(val);
    setConverted(false);
    try { parseCompactString(val); setFormatValid(true); } catch { setFormatValid(false); }
  };

  const handleConvert = () => {
    setIsProcessing(true);
    setErrors([]);
    setStats(null);
    setConverted(false);

    setTimeout(() => {
      try {
        const { bytes, doc } = StringToMidiEngine.convert(input);

        const blob = new Blob([bytes], { type: 'audio/midi' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${doc.key || 'composition'}_${doc.tempo}bpm.mid`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);

        const totalNotes = doc.bars.reduce((acc, b) => acc + ((b.notes ?? []).length), 0);
        setStats({
          bars:    doc.bars.length,
          notes:   totalNotes,
          tempo:   doc.tempo,
          key:     doc.key || '?',
          timeSig: doc.time_signature,
          size:    `${(bytes.length / 1024).toFixed(1)} KB`
        });
        setConverted(true);
      } catch (err) {
        setErrors([err.message || 'Conversion failed']);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 md:p-6 flex flex-col">

      {/* Header */}
      <div className="text-center mb-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
          Compact String → MIDI
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Flat delimited format · no braces/brackets/quotes · velocity fixed at 100
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap text-xs">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono">B1: p,s,d</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">binary converter</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">.mid download</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

        {/* LEFT — String Input */}
        <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-violet-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-violet-400 font-mono">B:</span>
              Compact String Input
            </h2>
            <span className={`text-xs px-2 py-1 rounded-full font-mono border ${
              !input.trim()
                ? 'bg-slate-700/30 border-slate-600/20 text-slate-500'
                : formatValid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {!input.trim() ? 'empty' : formatValid ? '✓ valid' : '✗ invalid'}
            </span>
          </div>

          <textarea
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            spellCheck={false}
            className={`flex-1 w-full min-h-64 md:min-h-96 bg-black/60 border rounded-xl p-4 text-gray-100 font-mono resize-none text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 ${
              !input.trim() || formatValid
                ? 'border-slate-700 focus:ring-violet-500/40 focus:border-violet-500/30'
                : 'border-red-500/40 focus:ring-red-500/30'
            }`}
          />

          <button
            onClick={handleConvert}
            disabled={isProcessing || !input.trim() || !formatValid}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Generating MIDI...</>
            ) : (
              <><Download className="w-4 h-4" />Convert & Download MIDI</>
            )}
          </button>
        </div>

        {/* RIGHT — Reference + Status */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-blue-500/20 shadow-xl flex-1">
            <h2 className="text-lg font-semibold text-white mb-4">Compact Field Reference</h2>

            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Structure</p>
            <div className="space-y-1 mb-4 font-mono text-xs">
              <div className="p-2 rounded-lg bg-white/5 text-slate-300">H: tempo|time_sig|key|spb</div>
              <div className="p-2 rounded-lg bg-white/5 text-slate-300">B&lt;n&gt;: p,s,d ; p,s,d ...</div>
            </div>

            {/* Required fields */}
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Required (positional, no labels)</p>
            <div className="space-y-1 mb-4">
              {[
                ['p', 'pitch (1st)',               '"C4", "F#3", "Bb5"'],
                ['s', 'start_subdivision (2nd)',   '0–15 (4/4) · 0–11 (3/4 or 6/8)'],
                ['d', 'duration_subdivisions (3rd)','4=quarter · 8=half · 16=whole'],
              ].map(([sh, full, hint]) => (
                <div key={sh} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <code className="text-cyan-400 text-xs w-4 font-mono font-bold">{sh}</code>
                  <code className="text-slate-400 text-xs w-40 font-mono">{full}</code>
                  <span className="text-slate-300 text-xs">{hint}</span>
                </div>
              ))}
            </div>

            {/* Optional fields */}
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Optional tags (omit when default)</p>
            <div className="space-y-1 mb-4">
              {[
                ['oNN', 'offset_percent',      'e.g. o18 · omit when 0'],
                ['cNN', 'end_cutoff_percent',  'e.g. c60 · omit when full sustain'],
              ].map(([sh, full, hint]) => (
                <div key={sh} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <code className="text-yellow-400 text-xs w-10 font-mono font-bold">{sh}</code>
                  <code className="text-slate-400 text-xs w-32 font-mono">{full}</code>
                  <span className="text-slate-300 text-xs">{hint}</span>
                </div>
              ))}
            </div>

            {/* Removed */}
            <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg mb-4">
              <p className="text-red-400 text-xs">
                <span className="font-semibold">velocity — removed.</span> Client sets all notes to 100 automatically. No JSON braces/brackets/quotes anywhere in this format.
              </p>
            </div>

            {/* Duration table */}
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Duration reference (4/4)</p>
            <div className="grid grid-cols-4 gap-1 text-xs font-mono">
              {[['d=1','16th'],['d=2','8th'],['d=4','qtr'],['d=8','half'],
                ['d=16','whole'],['d=32','2 bars'],['d=48','3 bars'],['d=64','4 bars']
              ].map(([d, label]) => (
                <div key={d} className="bg-black/30 rounded p-1.5 text-center border border-slate-700/50">
                  <div className="text-cyan-400">{d}</div>
                  <div className="text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
              <p className="text-blue-300 text-xs">
                <span className="font-semibold">Cross-bar:</span> set <code className="text-cyan-400">d</code> beyond 1 bar (e.g. d=32 = 2 bars in 4/4). Declare once in starting bar only. Empty / held-over bars are written as <code className="text-cyan-400">B&lt;n&gt;:</code> with nothing after the colon.
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 shadow-xl">
            {errors.length > 0 ? (
              <div>
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Error
                </h4>
                <ul className="text-red-300 text-xs space-y-1">{errors.map((e,i) => <li key={i}>• {e}</li>)}</ul>
              </div>
            ) : converted && stats ? (
              <div>
                <h4 className="font-semibold text-cyan-400 mb-3 flex items-center gap-1.5 text-sm">
                  <Download className="w-4 h-4" /> MIDI Downloaded
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {[['Bars',stats.bars],['Notes',stats.notes],['BPM',stats.tempo],['Key',stats.key],['Time',stats.timeSig],['Size',stats.size]].map(([l,v]) => (
                    <div key={l} className="bg-black/30 rounded-lg p-2 text-center border border-slate-700/50">
                      <div className="text-white font-bold text-sm">{v}</div>
                      <div className="text-slate-500 text-xs">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Activity className="w-4 h-4 text-slate-500" />
                Paste compact string and click Convert
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}