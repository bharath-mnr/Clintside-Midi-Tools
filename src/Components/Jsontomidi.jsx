// import React, { useState } from 'react';
// import { Activity, AlertTriangle, Copy, CheckCheck, Download } from 'lucide-react';

// // ─────────────────────────────────────────────
// // NOTE MAP
// // ─────────────────────────────────────────────

// const noteMap = {
//   'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
//   'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8,
//   'A': 9, 'A#': 10, 'BB': 10, 'B': 11
// };

// // ─────────────────────────────────────────────
// // ENGINE: JSON → MIDI
// // ─────────────────────────────────────────────

// class JsonToMidiEngine {

//   static getSubdivisionsPerBar(timeSigStr) {
//     const [num, den] = timeSigStr.split('/').map(Number);
//     const subs = num * (16 / den);
//     if (!Number.isInteger(subs)) throw new Error(`Invalid time signature: ${timeSigStr}`);
//     return subs;
//   }

//   static pitchToMidi(pitch) {
//     const match = pitch.match(/^([A-G][#Bb]?)(-?\d+)$/i);
//     if (!match) throw new Error(`Invalid pitch format: ${pitch}`);
//     const noteName   = match[1].toUpperCase();
//     const octave     = parseInt(match[2]);
//     if (!(noteName in noteMap)) throw new Error(`Unknown note name: ${noteName}`);
//     return (octave + 1) * 12 + noteMap[noteName];
//   }

//   static writeVariableLength(value) {
//     let buffer = value & 0x7F;
//     const bytes = [];
//     while ((value >>= 7) > 0) {
//       buffer <<= 8;
//       buffer |= (value & 0x7F) | 0x80;
//     }
//     while (true) {
//       bytes.push(buffer & 0xFF);
//       if (buffer & 0x80) buffer >>= 8;
//       else break;
//     }
//     return bytes;
//   }

//   // ── Convert JSON → MIDI events ──
//   static jsonToMidiEvents(json) {
//     const { tempo, time_signature, bars } = json;

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
//         const midiPitch  = this.pitchToMidi(note.pitch);
//         const velocity   = Math.min(127, Math.max(1, note.velocity || 100));

//         // Start tick — includes offset_percent (XR/XL offset)
//         const offsetFraction = (note.offset_percent || 0) / 100;
//         const startTick      = barBaseTick
//           + note.start_subdivision * ticksPerSubdivision
//           + offsetFraction * ticksPerSubdivision;

//         // Duration ticks
//         // duration_subdivisions = whole subdivisions the note spans
//         // end_cutoff_percent = how far into the last subdivision the note ends
//         let durationTicks;
//         if (note.duration_subdivisions === 0) {
//           // Short note within one subdivision — use end_cutoff_percent as duration
//           const cutoff  = (note.end_cutoff_percent || 50) / 100;
//           durationTicks = cutoff * ticksPerSubdivision;
//         } else {
//           // Multi-subdivision note
//           durationTicks = note.duration_subdivisions * ticksPerSubdivision;
//           if (note.end_cutoff_percent !== null && note.end_cutoff_percent !== undefined) {
//             // Note ends partway through the last subdivision
//             durationTicks = (note.duration_subdivisions - 1) * ticksPerSubdivision
//               + (note.end_cutoff_percent / 100) * ticksPerSubdivision;
//           }
//         }

//         if (durationTicks <= 0) continue;

//         const endTick = startTick + durationTicks;

//         midiEvents.push({ tick: startTick,  type: 'on',  pitch: midiPitch, velocity });
//         midiEvents.push({ tick: endTick,    type: 'off', pitch: midiPitch, velocity: 0 });
//       }
//     }

//     // Sort: by tick, off before on at same tick, then by pitch
//     midiEvents.sort((a, b) => {
//       if (a.tick !== b.tick) return a.tick - b.tick;
//       if (a.type === 'off' && b.type === 'on') return -1;
//       if (a.type === 'on'  && b.type === 'off') return 1;
//       return a.pitch - b.pitch;
//     });

//     return { midiEvents, tempo, timeSig, ticksPerQuarter };
//   }

//   // ── Generate binary MIDI bytes ──
//   static generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter) {
//     const data = [];
//     const writeBytes = (bytes) => bytes.forEach(b => data.push(b & 0xFF));
//     const writeInt   = (value, numBytes) => {
//       for (let i = numBytes - 1; i >= 0; i--) data.push((value >> (8 * i)) & 0xFF);
//     };

//     // MIDI header
//     writeBytes([0x4D, 0x54, 0x68, 0x64]); // MThd
//     writeInt(6, 4);   // header length
//     writeInt(0, 2);   // format 0
//     writeInt(1, 2);   // 1 track
//     writeInt(ticksPerQuarter, 2);

//     const trackData = [];

//     // Tempo meta event
//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xFF, 0x51, 0x03);
//     const us = Math.round(60000000 / tempo);
//     trackData.push((us >> 16) & 0xFF, (us >> 8) & 0xFF, us & 0xFF);

//     // Time signature meta event
//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xFF, 0x58, 0x04);
//     trackData.push(timeSig.numerator, Math.log2(timeSig.denominator), 24, 8);

//     // Program change (piano)
//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xC0, 0x00);

//     // Note events
//     let lastTick = 0;
//     for (const event of midiEvents) {
//       const deltaTime = Math.max(0, Math.round(event.tick - lastTick));
//       trackData.push(...this.writeVariableLength(deltaTime));
//       if (event.type === 'on') {
//         trackData.push(0x90, event.pitch & 0x7F, event.velocity & 0x7F);
//       } else {
//         trackData.push(0x80, event.pitch & 0x7F, 0x40);
//       }
//       lastTick += deltaTime;
//     }

//     // End of track
//     trackData.push(...this.writeVariableLength(0));
//     trackData.push(0xFF, 0x2F, 0x00);

//     // Track chunk
//     writeBytes([0x4D, 0x54, 0x72, 0x6B]); // MTrk
//     writeInt(trackData.length, 4);
//     writeBytes(trackData);

//     return new Uint8Array(data);
//   }

//   // ── Main entry: JSON string → Uint8Array ──
//   static convert(jsonStr) {
//     const json = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
//     if (!json.bars || json.bars.length === 0) throw new Error('No bars found in JSON');
//     if (!json.time_signature) throw new Error('Missing time_signature in JSON');
//     if (!json.tempo) throw new Error('Missing tempo in JSON');

//     const { midiEvents, tempo, timeSig, ticksPerQuarter } = this.jsonToMidiEvents(json);
//     return this.generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter);
//   }
// }

// // ─────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────

// const DEFAULT_INPUT = JSON.stringify({
//   tempo: 85,
//   time_signature: "4/4",
//   key: "Dm",
//   subdivisions_per_bar: 16,
//   bars: [
//     {
//       bar_number: 1,
//       notes: [
//         {
//           pitch: "D2",
//           start_subdivision: 0,
//           offset_percent: 0,
//           duration_subdivisions: 16,
//           end_cutoff_percent: null,
//           velocity: 40
//         },
//         {
//           pitch: "F4",
//           start_subdivision: 4,
//           offset_percent: 0,
//           duration_subdivisions: 4,
//           end_cutoff_percent: null,
//           velocity: 65
//         },
//         {
//           pitch: "A4",
//           start_subdivision: 8,
//           offset_percent: 0,
//           duration_subdivisions: 8,
//           end_cutoff_percent: null,
//           velocity: 75
//         }
//       ]
//     },
//     {
//       bar_number: 2,
//       notes: [
//         {
//           pitch: "D2",
//           start_subdivision: 0,
//           offset_percent: 0,
//           duration_subdivisions: 16,
//           end_cutoff_percent: null,
//           velocity: 40
//         },
//         {
//           pitch: "A4",
//           start_subdivision: 0,
//           offset_percent: 0,
//           duration_subdivisions: 8,
//           end_cutoff_percent: null,
//           velocity: 90
//         }
//       ]
//     }
//   ]
// }, null, 2);

// export default function JsonToMidi() {
//   const [input,        setInput]        = useState(DEFAULT_INPUT);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errors,       setErrors]       = useState([]);
//   const [jsonValid,    setJsonValid]    = useState(true);
//   const [stats,        setStats]        = useState(null);
//   const [converted,    setConverted]    = useState(false);

//   const handleInputChange = (val) => {
//     setInput(val);
//     setConverted(false);
//     try { JSON.parse(val); setJsonValid(true); } catch { setJsonValid(false); }
//   };

//   const handleConvert = async () => {
//     setIsProcessing(true);
//     setErrors([]);
//     setStats(null);
//     setConverted(false);

//     setTimeout(() => {
//       try {
//         const json      = JSON.parse(input);
//         const midiBytes = JsonToMidiEngine.convert(json);

//         // Download
//         const blob = new Blob([midiBytes], { type: 'audio/midi' });
//         const url  = URL.createObjectURL(blob);
//         const a    = document.createElement('a');
//         a.href     = url;
//         a.download = `${json.key || 'composition'}_${json.tempo}bpm.mid`;
//         document.body.appendChild(a);
//         a.click();
//         URL.revokeObjectURL(url);
//         document.body.removeChild(a);

//         const totalNotes = json.bars.reduce((acc, b) => acc + (b.notes?.length || 0), 0);
//         setStats({
//           bars:    json.bars.length,
//           notes:   totalNotes,
//           tempo:   json.tempo,
//           key:     json.key || '?',
//           timeSig: json.time_signature,
//           size:    `${(midiBytes.length / 1024).toFixed(1)} KB`
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
//       <div className="text-center mb-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
//         <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent drop-shadow-lg">
//           JSON → MIDI Converter
//         </h1>
//         <p className="mt-2 text-gray-400 text-sm md:text-base">
//           Convert LLM Generation JSON directly into a downloadable MIDI file
//         </p>
//         <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
//           <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono">llm json output</span>
//           <span className="text-slate-500">→</span>
//           <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">pure math converter</span>
//           <span className="text-slate-500">→</span>
//           <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">.mid download</span>
//         </div>
//       </div>

//       {/* Main Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

//         {/* LEFT — JSON Input */}
//         <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-violet-500/20 shadow-xl">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
//               <span className="text-violet-400 font-mono">{'{ }'}</span>
//               Generation JSON Input
//             </h2>
//             <span className={`text-xs px-2 py-1 rounded-full font-mono border ${
//               !input.trim()
//                 ? 'bg-slate-700/30 border-slate-600/20 text-slate-500'
//                 : jsonValid
//                   ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
//                   : 'bg-red-500/10 border-red-500/20 text-red-400'
//             }`}>
//               {!input.trim() ? 'empty' : jsonValid ? '✓ valid json' : '✗ invalid json'}
//             </span>
//           </div>

//           <textarea
//             value={input}
//             onChange={e => handleInputChange(e.target.value)}
//             spellCheck={false}
//             className={`flex-1 w-full min-h-64 md:min-h-96 bg-black/60 border rounded-xl p-4 text-gray-100 font-mono resize-none shadow-inner text-xs leading-relaxed tracking-wide transition-all focus:outline-none focus:ring-2 ${
//               !input.trim() || jsonValid
//                 ? 'border-slate-700 focus:ring-violet-500/40 focus:border-violet-500/30'
//                 : 'border-red-500/40 focus:ring-red-500/30'
//             }`}
//           />

//           <button
//             onClick={handleConvert}
//             disabled={isProcessing || !input.trim() || !jsonValid}
//             className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {isProcessing ? (
//               <>
//                 <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                   <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
//                 </svg>
//                 Generating MIDI...
//               </>
//             ) : (
//               <>
//                 <Download className="w-4 h-4" />
//                 Convert & Download MIDI
//               </>
//             )}
//           </button>
//         </div>

//         {/* RIGHT — Info + Status */}
//         <div className="flex flex-col gap-4">

//           {/* JSON field reference */}
//           <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-blue-500/20 shadow-xl flex-1">
//             <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//               <span className="text-blue-400">♩</span>
//               JSON Field Reference
//             </h2>

//             <div className="space-y-3">
//               {[
//                 { field: 'tempo',               type: 'number',   desc: 'BPM (20–300)',                    example: '85' },
//                 { field: 'time_signature',       type: 'string',   desc: 'e.g. "4/4", "3/4", "6/8"',       example: '"4/4"' },
//                 { field: 'key',                  type: 'string',   desc: 'e.g. "Dm", "C", "Am"',           example: '"Dm"' },
//                 { field: 'bar_number',           type: 'number',   desc: 'Bar index starting from 1',       example: '1' },
//                 { field: 'pitch',                type: 'string',   desc: 'Note name + octave',              example: '"D2"' },
//                 { field: 'start_subdivision',    type: 'number',   desc: '0–15 for 4/4, 0–11 for 3/4',     example: '8' },
//                 { field: 'offset_percent',       type: 'number',   desc: 'XR offset 0–100 (0 = on beat)',  example: '0' },
//                 { field: 'duration_subdivisions',type: 'number',   desc: 'How many full subdivisions',      example: '16' },
//                 { field: 'end_cutoff_percent',   type: 'number|null', desc: '~50 style cutoff, null = full', example: 'null' },
//                 { field: 'velocity',             type: 'number',   desc: 'MIDI velocity 1–127',            example: '75' },
//               ].map(({ field, type, desc, example }) => (
//                 <div key={field} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
//                   <code className="text-cyan-400 text-xs font-mono whitespace-nowrap w-44 shrink-0">{field}</code>
//                   <div className="flex-1 min-w-0">
//                     <span className="text-slate-500 text-xs">{type} · </span>
//                     <span className="text-slate-300 text-xs">{desc}</span>
//                   </div>
//                   <code className="text-slate-500 text-xs font-mono whitespace-nowrap">{example}</code>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
//               <p className="text-blue-300 text-xs">
//                 <span className="font-semibold">Cross-bar notes:</span> Set <code className="text-cyan-400">duration_subdivisions</code> larger than one bar (e.g. 32 for 2 bars in 4/4). The converter handles everything automatically.
//               </p>
//             </div>
//           </div>

//           {/* Status */}
//           <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-slate-600/30 shadow-xl">
//             {errors.length > 0 ? (
//               <div>
//                 <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-1.5 text-sm">
//                   <AlertTriangle className="w-4 h-4" /> Errors
//                 </h4>
//                 <ul className="text-red-300 text-xs space-y-1">
//                   {errors.map((e, i) => <li key={i}>• {e}</li>)}
//                 </ul>
//               </div>
//             ) : converted && stats ? (
//               <div>
//                 <h4 className="font-semibold text-cyan-400 mb-3 flex items-center gap-1.5 text-sm">
//                   <Download className="w-4 h-4" /> MIDI Downloaded Successfully
//                 </h4>
//                 <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
//                   {[
//                     { label: 'Bars',    value: stats.bars },
//                     { label: 'Notes',   value: stats.notes },
//                     { label: 'Tempo',   value: stats.tempo },
//                     { label: 'Key',     value: stats.key },
//                     { label: 'TimeSig', value: stats.timeSig },
//                     { label: 'Size',    value: stats.size },
//                   ].map(s => (
//                     <div key={s.label} className="bg-black/30 rounded-lg p-2 text-center border border-slate-700/50">
//                       <div className="text-white font-bold text-sm">{s.value}</div>
//                       <div className="text-slate-500 text-xs">{s.label}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2 text-sm text-slate-400">
//                 <Activity className="w-4 h-4 text-slate-500" />
//                 Paste your Generation JSON and click Convert & Download MIDI
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
// SHORTHAND NORMALISER
// Expands compact note fields to full names.
// p→pitch, s→start_subdivision, d→duration_subdivisions
// o→offset_percent (default 0), c→end_cutoff_percent (default null)
// velocity always 100 (removed from schema)
// ─────────────────────────────────────────────
function normaliseNote(n) {
  return {
    pitch:                 n.pitch                ?? n.p,
    start_subdivision:     n.start_subdivision    ?? n.s ?? 0,
    offset_percent:        n.offset_percent       ?? n.o ?? 0,
    duration_subdivisions: n.duration_subdivisions ?? n.d ?? 4,
    end_cutoff_percent:    n.end_cutoff_percent   ?? n.c ?? null,
    velocity:              100   // always fixed
  };
}

function normaliseBar(b) {
  return {
    bar_number: b.bar_number ?? b.bn,
    notes: (b.notes ?? []).map(normaliseNote)
  };
}

// ─────────────────────────────────────────────
// ENGINE: JSON → MIDI
// ─────────────────────────────────────────────
class JsonToMidiEngine {

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

  static jsonToMidiEvents(json) {
    const { tempo, time_signature } = json;
    const bars = json.bars.map(normaliseBar);

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
        const midiPitch = this.pitchToMidi(note.pitch);
        const velocity  = 100; // fixed

        const offsetFraction = (note.offset_percent || 0) / 100;
        const startTick = barBaseTick
          + note.start_subdivision * ticksPerSubdivision
          + offsetFraction * ticksPerSubdivision;

        let durationTicks;
        if (note.duration_subdivisions === 0) {
          const cutoff = (note.end_cutoff_percent || 50) / 100;
          durationTicks = cutoff * ticksPerSubdivision;
        } else {
          durationTicks = note.duration_subdivisions * ticksPerSubdivision;
          if (note.end_cutoff_percent !== null && note.end_cutoff_percent !== undefined) {
            durationTicks = (note.duration_subdivisions - 1) * ticksPerSubdivision
              + (note.end_cutoff_percent / 100) * ticksPerSubdivision;
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

  static convert(jsonStr) {
    const json = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    if (!json.bars || json.bars.length === 0) throw new Error('No bars found');
    if (!json.time_signature) throw new Error('Missing time_signature');
    if (!json.tempo) throw new Error('Missing tempo');
    const { midiEvents, tempo, timeSig, ticksPerQuarter } = this.jsonToMidiEvents(json);
    return this.generateMidiBytes(midiEvents, tempo, timeSig, ticksPerQuarter);
  }
}

// ─────────────────────────────────────────────
// DEFAULT EXAMPLE — compact shorthand format
// ─────────────────────────────────────────────
const DEFAULT_INPUT = JSON.stringify({
  tempo: 85,
  time_signature: "4/4",
  key: "Dm",
  subdivisions_per_bar: 16,
  bars: [
    { bn: 1, notes: [
      { p: "D2", s: 0, d: 16 },
      { p: "F4", s: 4, d: 4 },
      { p: "A4", s: 8, d: 8 }
    ]},
    { bn: 2, notes: [
      { p: "D2", s: 0, d: 16 },
      { p: "A4", s: 0, d: 8 }
    ]}
  ]
}, null, 2);

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function JsonToMidi() {
  const [input,        setInput]        = useState(DEFAULT_INPUT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors,       setErrors]       = useState([]);
  const [jsonValid,    setJsonValid]    = useState(true);
  const [stats,        setStats]        = useState(null);
  const [converted,    setConverted]    = useState(false);

  const handleInputChange = (val) => {
    setInput(val);
    setConverted(false);
    try { JSON.parse(val); setJsonValid(true); } catch { setJsonValid(false); }
  };

  const handleConvert = () => {
    setIsProcessing(true);
    setErrors([]);
    setStats(null);
    setConverted(false);

    setTimeout(() => {
      try {
        const json      = JSON.parse(input);
        const midiBytes = JsonToMidiEngine.convert(json);

        const blob = new Blob([midiBytes], { type: 'audio/midi' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${json.key || 'composition'}_${json.tempo}bpm.mid`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);

        const totalNotes = json.bars.reduce((acc, b) => acc + ((b.notes ?? []).length), 0);
        setStats({
          bars:    json.bars.length,
          notes:   totalNotes,
          tempo:   json.tempo,
          key:     json.key || '?',
          timeSig: json.time_signature,
          size:    `${(midiBytes.length / 1024).toFixed(1)} KB`
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
          JSON → MIDI Converter
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Compact shorthand format · velocity fixed at 100 · cross-bar auto-handled
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap text-xs">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono">p s d (+ o c optional)</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">binary converter</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">.mid download</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

        {/* LEFT — JSON Input */}
        <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-violet-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-violet-400 font-mono">{'{ }'}</span>
              Compact JSON Input
            </h2>
            <span className={`text-xs px-2 py-1 rounded-full font-mono border ${
              !input.trim()
                ? 'bg-slate-700/30 border-slate-600/20 text-slate-500'
                : jsonValid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {!input.trim() ? 'empty' : jsonValid ? '✓ valid' : '✗ invalid'}
            </span>
          </div>

          <textarea
            value={input}
            onChange={e => handleInputChange(e.target.value)}
            spellCheck={false}
            className={`flex-1 w-full min-h-64 md:min-h-96 bg-black/60 border rounded-xl p-4 text-gray-100 font-mono resize-none text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 ${
              !input.trim() || jsonValid
                ? 'border-slate-700 focus:ring-violet-500/40 focus:border-violet-500/30'
                : 'border-red-500/40 focus:ring-red-500/30'
            }`}
          />

          <button
            onClick={handleConvert}
            disabled={isProcessing || !input.trim() || !jsonValid}
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

            {/* Required fields */}
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Required</p>
            <div className="space-y-1 mb-4">
              {[
                ['p', 'pitch',               '"C4", "F#3", "Bb5"'],
                ['s', 'start_subdivision',   '0–15 (4/4) · 0–11 (3/4 or 6/8)'],
                ['d', 'duration_subdivisions','4=quarter · 8=half · 16=whole'],
              ].map(([sh, full, hint]) => (
                <div key={sh} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <code className="text-cyan-400 text-xs w-4 font-mono font-bold">{sh}</code>
                  <code className="text-slate-400 text-xs w-32 font-mono">{full}</code>
                  <span className="text-slate-300 text-xs">{hint}</span>
                </div>
              ))}
            </div>

            {/* Optional fields */}
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Optional (omit = default)</p>
            <div className="space-y-1 mb-4">
              {[
                ['o', 'offset_percent',      '0 (default, omit) · 15–25 = swing'],
                ['c', 'end_cutoff_percent',  'null (default, omit) · 50–80 = staccato'],
              ].map(([sh, full, hint]) => (
                <div key={sh} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <code className="text-yellow-400 text-xs w-4 font-mono font-bold">{sh}</code>
                  <code className="text-slate-400 text-xs w-32 font-mono">{full}</code>
                  <span className="text-slate-300 text-xs">{hint}</span>
                </div>
              ))}
            </div>

            {/* Removed */}
            <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg mb-4">
              <p className="text-red-400 text-xs">
                <span className="font-semibold">velocity — removed.</span> Client sets all notes to 100 automatically. Never include it in JSON output.
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
                <span className="font-semibold">Cross-bar:</span> set <code className="text-cyan-400">d</code> beyond 1 bar (e.g. d:32 = 2 bars in 4/4). Declare once in starting bar only. Empty bars still need <code className="text-cyan-400">{`{bn:N, notes:[]}`}</code>.
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
                Paste compact JSON and click Convert
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}