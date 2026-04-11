// import React, { useState, useRef } from 'react';
// import { Upload, Copy, CheckCheck, Activity, AlertTriangle } from 'lucide-react';

// // ─────────────────────────────────────────────
// // NOTE MAPS
// // ─────────────────────────────────────────────

// const midiToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// // ─────────────────────────────────────────────
// // ENGINE: MIDI → JSON
// // ─────────────────────────────────────────────

// class MidiToJsonEngine {

//   static convertMidiToPitch(midiNumber) {
//     const octave = Math.floor(midiNumber / 12) - 1;
//     const noteIndex = midiNumber % 12;
//     return midiToNote[noteIndex] + octave;
//   }

//   static getSubdivisionsPerBar(timeSig) {
//     const subs = timeSig.numerator * (16 / timeSig.denominator);
//     if (!Number.isInteger(subs)) throw new Error(`Invalid time signature: ${timeSig.numerator}/${timeSig.denominator}`);
//     return subs;
//   }

//   // ── Parse binary MIDI file ──
//   static parseMidiFile(arrayBuffer) {
//     const data = new Uint8Array(arrayBuffer);
//     let offset = 0;

//     const headerChunk = data.slice(0, 14);
//     if (String.fromCharCode(...headerChunk.slice(0, 4)) !== 'MThd') {
//       throw new Error('Invalid MIDI file format');
//     }

//     const trackCount    = (headerChunk[10] << 8) | headerChunk[11];
//     const ticksPerQuarter = (headerChunk[12] << 8) | headerChunk[13];
//     offset = 14;

//     const events = [];
//     let tempo = 120;
//     let timeSig = { numerator: 4, denominator: 4 };

//     for (let track = 0; track < trackCount; track++) {
//       const trackHeader = data.slice(offset, offset + 8);
//       if (String.fromCharCode(...trackHeader.slice(0, 4)) !== 'MTrk') throw new Error('Invalid track header');

//       const trackLength = (trackHeader[4] << 24) | (trackHeader[5] << 16) | (trackHeader[6] << 8) | trackHeader[7];
//       offset += 8;

//       const trackData   = data.slice(offset, offset + trackLength);
//       let trackOffset   = 0;
//       let currentTick   = 0;
//       let runningStatus = 0;

//       while (trackOffset < trackLength) {
//         // Read delta time (variable length)
//         let deltaTime = 0;
//         let byte;
//         do {
//           byte = trackData[trackOffset++];
//           deltaTime = (deltaTime << 7) | (byte & 0x7F);
//         } while (byte & 0x80);
//         currentTick += deltaTime;

//         let statusByte = trackData[trackOffset];
//         if (statusByte < 0x80) {
//           statusByte = runningStatus;
//         } else {
//           trackOffset++;
//           runningStatus = statusByte;
//         }

//         if (statusByte === 0xFF) {
//           // Meta event
//           const metaType = trackData[trackOffset++];
//           let metaLength = 0;
//           let lengthByte;
//           do {
//             lengthByte = trackData[trackOffset++];
//             metaLength = (metaLength << 7) | (lengthByte & 0x7F);
//           } while (lengthByte & 0x80);

//           if (metaType === 0x51 && metaLength === 3) {
//             const us = (trackData[trackOffset] << 16) | (trackData[trackOffset + 1] << 8) | trackData[trackOffset + 2];
//             tempo = Math.round(60000000 / us);
//           } else if (metaType === 0x58 && metaLength >= 4) {
//             timeSig.numerator   = trackData[trackOffset];
//             timeSig.denominator = Math.pow(2, trackData[trackOffset + 1]);
//           }
//           trackOffset += metaLength;
//           runningStatus = 0;

//         } else if ((statusByte & 0xF0) === 0x90) {
//           const pitch    = trackData[trackOffset++];
//           const velocity = trackData[trackOffset++];
//           events.push({ tick: currentTick, type: velocity > 0 ? 'on' : 'off', pitch, velocity });

//         } else if ((statusByte & 0xF0) === 0x80) {
//           const pitch = trackData[trackOffset++];
//           trackOffset++; // velocity byte
//           events.push({ tick: currentTick, type: 'off', pitch, velocity: 0 });

//         } else {
//           if (statusByte >= 0xF0) break;
//           const eventType = statusByte & 0xF0;
//           trackOffset += (eventType === 0xC0 || eventType === 0xD0) ? 1 : 2;
//         }
//       }
//       offset += trackLength;
//     }

//     return {
//       events: events.sort((a, b) => a.tick - b.tick),
//       tempo,
//       timeSig,
//       ticksPerQuarter
//     };
//   }

//   // ── Convert parsed MIDI data → Generation JSON ──
//   static convertToJson(midiData) {
//     const { events, tempo, timeSig, ticksPerQuarter } = midiData;

//     const subdivisionsPerBar  = this.getSubdivisionsPerBar(timeSig);
//     const ticksPerBar         = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
//     const ticksPerSubdivision = ticksPerBar / subdivisionsPerBar;

//     // ── Pair note-on / note-off events into complete notes ──
//     const rawNotes = [];
//     const noteOnMap = new Map(); // pitch → event

//     for (const event of events) {
//       if (event.type === 'on') {
//         if (noteOnMap.has(event.pitch)) {
//           // Close previous (overlapping note)
//           const prev = noteOnMap.get(event.pitch);
//           const dur  = event.tick - prev.tick;
//           if (dur > 0) rawNotes.push({ pitch: event.pitch, startTick: prev.tick, endTick: event.tick, velocity: prev.velocity });
//         }
//         noteOnMap.set(event.pitch, event);
//       } else if (event.type === 'off' && noteOnMap.has(event.pitch)) {
//         const on  = noteOnMap.get(event.pitch);
//         const dur = event.tick - on.tick;
//         if (dur > 0) rawNotes.push({ pitch: event.pitch, startTick: on.tick, endTick: event.tick, velocity: on.velocity });
//         noteOnMap.delete(event.pitch);
//       }
//     }

//     // Close any unclosed notes
//     const maxTick = events.length > 0 ? Math.max(...events.map(e => e.tick)) : 0;
//     for (const [pitch, on] of noteOnMap.entries()) {
//       const dur = maxTick - on.tick;
//       if (dur > 0) rawNotes.push({ pitch, startTick: on.tick, endTick: maxTick, velocity: on.velocity });
//     }

//     // ── Convert each raw note → JSON note ──
//     // startTick → bar_number + start_subdivision + offset_percent
//     // duration  → duration_subdivisions + end_percent

//     const jsonNotes = []; // { bar_number, pitch, start_subdivision, offset_percent, duration_subdivisions, end_cutoff_percent, velocity }

//     for (const note of rawNotes) {
//       const pitchName = this.convertMidiToPitch(note.pitch);

//       // Start position
//       const startSubTotal    = Math.floor(note.startTick / ticksPerSubdivision);
//       const startOffsetTicks = note.startTick - startSubTotal * ticksPerSubdivision;
//       const offsetPercent    = Math.round((startOffsetTicks / ticksPerSubdivision) * 100);

//       // End position
//       const endSubTotal    = Math.floor((note.endTick - 0.0001) / ticksPerSubdivision);
//       const endOffsetTicks = note.endTick - endSubTotal * ticksPerSubdivision;
//       const endPercent     = Math.round((endOffsetTicks / ticksPerSubdivision) * 100);

//       const barNumber      = Math.floor(startSubTotal / subdivisionsPerBar) + 1;
//       const startSubInBar  = startSubTotal % subdivisionsPerBar;
//       const durationSubs   = endSubTotal - startSubTotal; // whole subdivisions spanned

//       jsonNotes.push({
//         bar_number:              barNumber,
//         pitch:                   pitchName,
//         start_subdivision:       startSubInBar,
//         offset_percent:          offsetPercent,    // XR offset (0 = no offset)
//         duration_subdivisions:   durationSubs,     // how many full subdivisions
//         end_cutoff_percent:      endPercent < 100 ? endPercent : null, // ~50 style cutoff
//         velocity:                note.velocity
//       });
//     }

//     // ── Group notes by bar ──
//     const barsMap = new Map();
//     for (const note of jsonNotes) {
//       if (!barsMap.has(note.bar_number)) {
//         barsMap.set(note.bar_number, []);
//       }
//       barsMap.get(note.bar_number).push({
//         pitch:                  note.pitch,
//         start_subdivision:      note.start_subdivision,
//         offset_percent:         note.offset_percent,
//         duration_subdivisions:  note.duration_subdivisions,
//         end_cutoff_percent:     note.end_cutoff_percent,
//         velocity:               note.velocity
//       });
//     }

//     const bars = Array.from(barsMap.entries())
//       .sort(([a], [b]) => a - b)
//       .map(([bar_number, notes]) => ({ bar_number, notes }));

//     return {
//       tempo,
//       time_signature: `${timeSig.numerator}/${timeSig.denominator}`,
//       key: 'C', // MIDI files don't reliably store key — user can edit
//       subdivisions_per_bar: subdivisionsPerBar,
//       bars
//     };
//   }

//   // ── Main entry: ArrayBuffer → JSON object ──
//   static convert(arrayBuffer) {
//     const midiData = this.parseMidiFile(arrayBuffer);
//     return this.convertToJson(midiData);
//   }
// }

// // ─────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────

// export default function MidiToJson() {
//   const [midiFile,     setMidiFile]     = useState(null);
//   const [output,       setOutput]       = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errors,       setErrors]       = useState([]);
//   const [copied,       setCopied]       = useState(false);
//   const [stats,        setStats]        = useState(null);
//   const fileInputRef = useRef(null);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!file.name.toLowerCase().match(/\.(mid|midi)$/)) {
//       setErrors(['Please upload a MIDI file (.mid or .midi)']);
//       return;
//     }
//     setErrors([]);
//     setOutput('');
//     setStats(null);
//     setMidiFile(file);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) fileInputRef.current.files = e.dataTransfer.files;
//     handleFileUpload({ target: { files: [file] } });
//   };

//   const handleConvert = async () => {
//     if (!midiFile) return;
//     setIsProcessing(true);
//     setErrors([]);
//     setOutput('');
//     setStats(null);
//     try {
//       const arrayBuffer = await midiFile.arrayBuffer();
//       const json        = MidiToJsonEngine.convert(arrayBuffer);
//       const jsonStr     = JSON.stringify(json, null, 2);
//       setOutput(jsonStr);

//       const totalNotes = json.bars.reduce((acc, b) => acc + b.notes.length, 0);
//       setStats({
//         bars:    json.bars.length,
//         notes:   totalNotes,
//         tempo:   json.tempo,
//         timeSig: json.time_signature,
//         subDiv:  json.subdivisions_per_bar
//       });
//     } catch (err) {
//       setErrors([err.message || 'Conversion failed']);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCopy = () => {
//     if (!output) return;
//     navigator.clipboard.writeText(output).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 md:p-6 flex flex-col">

//       {/* Header */}
//       <div className="text-center mb-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
//         <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
//           MIDI → JSON Converter
//         </h1>
//         <p className="mt-2 text-gray-400 text-sm md:text-base">
//           Convert binary MIDI files into Generation JSON for RAG knowledge base
//         </p>
//         <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
//           <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono">.mid binary</span>
//           <span className="text-slate-500">→</span>
//           <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">generation json</span>
//           <span className="text-slate-500">→</span>
//           <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">pinecone rag</span>
//         </div>
//       </div>

//       {/* Main Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

//         {/* LEFT — Upload */}
//         <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-orange-500/20 shadow-xl">
//           <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 mb-4">
//             <span className="text-orange-400">♪</span>
//             MIDI File Upload
//           </h2>

//           {/* Drop zone */}
//           <div
//             onDrop={handleDrop}
//             onDragOver={e => e.preventDefault()}
//             onClick={() => fileInputRef.current?.click()}
//             className={`flex-1 min-h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
//               midiFile
//                 ? 'border-orange-500/50 bg-orange-500/5 shadow-orange-500/10 shadow-lg'
//                 : 'border-slate-600 hover:border-orange-500/40 hover:bg-orange-500/5'
//             }`}
//           >
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileUpload}
//               accept=".mid,.midi"
//               className="hidden"
//             />
//             <div className="text-center p-6">
//               {midiFile ? (
//                 <>
//                   <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
//                     <span className="text-2xl">♪</span>
//                   </div>
//                   <p className="text-white font-semibold">{midiFile.name}</p>
//                   <p className="text-slate-400 text-sm mt-1">{(midiFile.size / 1024).toFixed(1)} KB</p>
//                   <p className="text-orange-400 text-xs mt-2">Click to change file</p>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
//                     <Upload className="w-6 h-6 text-slate-400" />
//                   </div>
//                   <p className="text-slate-300 font-medium">Drop your MIDI file here</p>
//                   <p className="text-slate-500 text-sm mt-1">or click to browse</p>
//                   <p className="text-slate-600 text-xs mt-2">.mid / .midi supported</p>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Convert button */}
//           <button
//             onClick={handleConvert}
//             disabled={isProcessing || !midiFile}
//             className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {isProcessing ? (
//               <>
//                 <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                   <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
//                 </svg>
//                 Converting...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-4 h-4" />
//                 Convert to JSON
//               </>
//             )}
//           </button>

//           {/* JSON format reference */}
//           <div className="mt-4 bg-black/30 rounded-xl p-4 border border-slate-700/50">
//             <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wider">Output JSON structure</p>
//             <pre className="text-slate-400 text-xs leading-relaxed font-mono">{`{
//   tempo, time_signature, key,
//   subdivisions_per_bar,
//   bars: [{
//     bar_number,
//     notes: [{
//       pitch,           // "D2"
//       start_subdivision, // 0-15 (4/4)
//       offset_percent,  // XR offset
//       duration_subdivisions,
//       end_cutoff_percent,
//       velocity         // 1-127
//     }]
//   }]
// }`}</pre>
//           </div>
//         </div>

//         {/* RIGHT — Output + Status */}
//         <div className="flex flex-col gap-4">
//           <div className="flex-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-500/20 shadow-xl flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
//                 <span className="text-purple-400 font-mono">{'{ }'}</span>
//                 JSON Output
//               </h2>
//               {output && (
//                 <button
//                   onClick={handleCopy}
//                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
//                     copied
//                       ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
//                       : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
//                   }`}
//                 >
//                   {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
//                   {copied ? 'Copied!' : 'Copy JSON'}
//                 </button>
//               )}
//             </div>

//             <textarea
//               value={output}
//               readOnly
//               placeholder="Upload a MIDI file and convert to see JSON output here..."
//               className="flex-1 w-full min-h-64 md:min-h-80 bg-black/60 border border-slate-700 rounded-xl p-4 text-gray-100 font-mono resize-none text-xs leading-relaxed shadow-inner focus:outline-none"
//             />
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
//             ) : stats ? (
//               <div>
//                 <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-1.5 text-sm">
//                   <Activity className="w-4 h-4" /> Conversion Complete
//                 </h4>
//                 <div className="grid grid-cols-5 gap-2">
//                   {[
//                     { label: 'Bars',   value: stats.bars },
//                     { label: 'Notes',  value: stats.notes },
//                     { label: 'Tempo',  value: stats.tempo },
//                     { label: 'TimeSig',value: stats.timeSig },
//                     { label: 'Subdiv', value: stats.subDiv },
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
//                 Upload a MIDI file and click Convert to JSON
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }










import React, { useState, useRef } from 'react';
import { Upload, Copy, CheckCheck, Activity, AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────
// NOTE MAPS
// ─────────────────────────────────────────────

const midiToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ─────────────────────────────────────────────
// ENGINE: MIDI → JSON
// ─────────────────────────────────────────────

class MidiToJsonEngine {

  static convertMidiToPitch(midiNumber) {
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    return midiToNote[noteIndex] + octave;
  }

  static getSubdivisionsPerBar(timeSig) {
    const subs = timeSig.numerator * (16 / timeSig.denominator);
    if (!Number.isInteger(subs)) throw new Error(`Invalid time signature: ${timeSig.numerator}/${timeSig.denominator}`);
    return subs;
  }

  // ── Parse binary MIDI file ──
  static parseMidiFile(arrayBuffer) {
    const data = new Uint8Array(arrayBuffer);
    let offset = 0;

    const headerChunk = data.slice(0, 14);
    if (String.fromCharCode(...headerChunk.slice(0, 4)) !== 'MThd') {
      throw new Error('Invalid MIDI file format');
    }

    const trackCount      = (headerChunk[10] << 8) | headerChunk[11];
    const ticksPerQuarter = (headerChunk[12] << 8) | headerChunk[13];
    offset = 14;

    const events = [];
    let tempo  = 120;
    let timeSig = { numerator: 4, denominator: 4 };

    for (let track = 0; track < trackCount; track++) {
      const trackHeader = data.slice(offset, offset + 8);
      if (String.fromCharCode(...trackHeader.slice(0, 4)) !== 'MTrk') throw new Error('Invalid track header');

      const trackLength = (trackHeader[4] << 24) | (trackHeader[5] << 16) | (trackHeader[6] << 8) | trackHeader[7];
      offset += 8;

      const trackData   = data.slice(offset, offset + trackLength);
      let trackOffset   = 0;
      let currentTick   = 0;
      let runningStatus = 0;

      while (trackOffset < trackLength) {
        // Read delta time (variable length)
        let deltaTime = 0;
        let byte;
        do {
          byte = trackData[trackOffset++];
          deltaTime = (deltaTime << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        currentTick += deltaTime;

        let statusByte = trackData[trackOffset];
        if (statusByte < 0x80) {
          statusByte = runningStatus;
        } else {
          trackOffset++;
          runningStatus = statusByte;
        }

        if (statusByte === 0xFF) {
          // Meta event
          const metaType = trackData[trackOffset++];
          let metaLength = 0;
          let lengthByte;
          do {
            lengthByte = trackData[trackOffset++];
            metaLength = (metaLength << 7) | (lengthByte & 0x7F);
          } while (lengthByte & 0x80);

          if (metaType === 0x51 && metaLength === 3) {
            const us = (trackData[trackOffset] << 16) | (trackData[trackOffset + 1] << 8) | trackData[trackOffset + 2];
            tempo = Math.round(60000000 / us);
          } else if (metaType === 0x58 && metaLength >= 4) {
            timeSig.numerator   = trackData[trackOffset];
            timeSig.denominator = Math.pow(2, trackData[trackOffset + 1]);
          }
          trackOffset += metaLength;
          runningStatus = 0;

        } else if ((statusByte & 0xF0) === 0x90) {
          const pitch    = trackData[trackOffset++];
          const velocity = trackData[trackOffset++];
          events.push({ tick: currentTick, type: velocity > 0 ? 'on' : 'off', pitch, velocity });

        } else if ((statusByte & 0xF0) === 0x80) {
          const pitch = trackData[trackOffset++];
          trackOffset++; // velocity byte
          events.push({ tick: currentTick, type: 'off', pitch, velocity: 0 });

        } else {
          if (statusByte >= 0xF0) break;
          const eventType = statusByte & 0xF0;
          trackOffset += (eventType === 0xC0 || eventType === 0xD0) ? 1 : 2;
        }
      }
      offset += trackLength;
    }

    return {
      events: events.sort((a, b) => a.tick - b.tick),
      tempo,
      timeSig,
      ticksPerQuarter
    };
  }

  // ── Convert parsed MIDI data → Generation JSON ──
  static convertToJson(midiData) {
    const { events, tempo, timeSig, ticksPerQuarter } = midiData;

    const subdivisionsPerBar  = this.getSubdivisionsPerBar(timeSig);
    const ticksPerBar         = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
    const ticksPerSubdivision = ticksPerBar / subdivisionsPerBar;

    // ── Pair note-on / note-off events into complete notes ──
    const rawNotes  = [];
    const noteOnMap = new Map(); // pitch → event

    for (const event of events) {
      if (event.type === 'on') {
        if (noteOnMap.has(event.pitch)) {
          // Close previous (overlapping note)
          const prev = noteOnMap.get(event.pitch);
          const dur  = event.tick - prev.tick;
          if (dur > 0) rawNotes.push({ pitch: event.pitch, startTick: prev.tick, endTick: event.tick, velocity: prev.velocity });
        }
        noteOnMap.set(event.pitch, event);
      } else if (event.type === 'off' && noteOnMap.has(event.pitch)) {
        const on  = noteOnMap.get(event.pitch);
        const dur = event.tick - on.tick;
        if (dur > 0) rawNotes.push({ pitch: event.pitch, startTick: on.tick, endTick: event.tick, velocity: on.velocity });
        noteOnMap.delete(event.pitch);
      }
    }

    // Close any unclosed notes
    const maxTick = events.length > 0 ? Math.max(...events.map(e => e.tick)) : 0;
    for (const [pitch, on] of noteOnMap.entries()) {
      const dur = maxTick - on.tick;
      if (dur > 0) rawNotes.push({ pitch, startTick: on.tick, endTick: maxTick, velocity: on.velocity });
    }

    // ── Convert each raw note → JSON note ──
    const jsonNotes = [];

    for (const note of rawNotes) {
      const pitchName = this.convertMidiToPitch(note.pitch);

      // ── Start position ──
      const startSubTotal    = Math.floor(note.startTick / ticksPerSubdivision);
      const startOffsetTicks = note.startTick - startSubTotal * ticksPerSubdivision;
      const offsetPercent    = Math.round((startOffsetTicks / ticksPerSubdivision) * 100);

      // ── End position ──
      // FIX: Remove the -0.0001 fudge factor. It caused notes ending exactly
      // on a subdivision boundary to be assigned to the previous slot,
      // shrinking durationSubs by 1 and generating wrong end_cutoff_percent.
      //
      // Correct logic:
      //   endSubTotal = which subdivision boundary the note's endTick falls on/into
      //   endPercent  = how far into that subdivision the note ends (0 = exactly on boundary)
      //   durationSubs = endSubTotal - startSubTotal
      //     → if endPercent == 0: note ends cleanly at the boundary, cutoff = null
      //     → if endPercent >  0: note ends partway through slot endSubTotal, cutoff = endPercent
      const endSubTotal    = Math.floor(note.endTick / ticksPerSubdivision);
      const endOffsetTicks = note.endTick - endSubTotal * ticksPerSubdivision;
      const endPercent     = Math.round((endOffsetTicks / ticksPerSubdivision) * 100);

      const barNumber     = Math.floor(startSubTotal / subdivisionsPerBar) + 1;
      const startSubInBar = startSubTotal % subdivisionsPerBar;
      const durationSubs  = endSubTotal - startSubTotal;

      // end_cutoff_percent: only set when note ends mid-subdivision (0 < endPercent < 100)
      const endCutoff = (endPercent > 0 && endPercent < 100) ? endPercent : null;

      jsonNotes.push({
        bar_number:             barNumber,
        pitch:                  pitchName,
        start_subdivision:      startSubInBar,
        offset_percent:         offsetPercent,
        duration_subdivisions:  durationSubs,
        end_cutoff_percent:     endCutoff,
        velocity:               note.velocity
      });
    }

    // ── Group notes by bar ──
    const barsMap = new Map();
    for (const note of jsonNotes) {
      if (!barsMap.has(note.bar_number)) {
        barsMap.set(note.bar_number, []);
      }
      barsMap.get(note.bar_number).push({
        pitch:                 note.pitch,
        start_subdivision:     note.start_subdivision,
        offset_percent:        note.offset_percent,
        duration_subdivisions: note.duration_subdivisions,
        end_cutoff_percent:    note.end_cutoff_percent,
        velocity:              note.velocity
      });
    }

    const bars = Array.from(barsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([bar_number, notes]) => ({ bar_number, notes }));

    // ── Fill in empty bars so all bar numbers are sequential ──
    const filledBars = [];
    if (bars.length > 0) {
      const lastBar = bars[bars.length - 1].bar_number;
      const barLookup = new Map(bars.map(b => [b.bar_number, b]));
      for (let i = 1; i <= lastBar; i++) {
        filledBars.push(barLookup.get(i) ?? { bar_number: i, notes: [] });
      }
    }

    return {
      tempo,
      time_signature: `${timeSig.numerator}/${timeSig.denominator}`,
      key: 'C',
      subdivisions_per_bar: subdivisionsPerBar,
      bars: filledBars
    };
  }

  // ── Main entry: ArrayBuffer → JSON object ──
  static convert(arrayBuffer) {
    const midiData = this.parseMidiFile(arrayBuffer);
    return this.convertToJson(midiData);
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function MidiToJson() {
  const [midiFile,     setMidiFile]     = useState(null);
  const [output,       setOutput]       = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors,       setErrors]       = useState([]);
  const [copied,       setCopied]       = useState(false);
  const [stats,        setStats]        = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().match(/\.(mid|midi)$/)) {
      setErrors(['Please upload a MIDI file (.mid or .midi)']);
      return;
    }
    setErrors([]);
    setOutput('');
    setStats(null);
    setMidiFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) fileInputRef.current.files = e.dataTransfer.files;
    handleFileUpload({ target: { files: [file] } });
  };

  const handleConvert = async () => {
    if (!midiFile) return;
    setIsProcessing(true);
    setErrors([]);
    setOutput('');
    setStats(null);
    try {
      const arrayBuffer = await midiFile.arrayBuffer();
      const json        = MidiToJsonEngine.convert(arrayBuffer);
      const jsonStr     = JSON.stringify(json, null, 2);
      setOutput(jsonStr);

      const totalNotes = json.bars.reduce((acc, b) => acc + b.notes.length, 0);
      setStats({
        bars:    json.bars.length,
        notes:   totalNotes,
        tempo:   json.tempo,
        timeSig: json.time_signature,
        subDiv:  json.subdivisions_per_bar
      });
    } catch (err) {
      setErrors([err.message || 'Conversion failed']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4 md:p-6 flex flex-col">

      {/* Header */}
      <div className="text-center mb-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
          MIDI → JSON Converter
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          Convert binary MIDI files into Generation JSON for RAG knowledge base
        </p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono">.mid binary</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">generation json</span>
          <span className="text-slate-500">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">pinecone rag</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1">

        {/* LEFT — Upload */}
        <div className="flex flex-col bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-orange-500/20 shadow-xl">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <span className="text-orange-400">♪</span>
            MIDI File Upload
          </h2>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 min-h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              midiFile
                ? 'border-orange-500/50 bg-orange-500/5 shadow-orange-500/10 shadow-lg'
                : 'border-slate-600 hover:border-orange-500/40 hover:bg-orange-500/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".mid,.midi"
              className="hidden"
            />
            <div className="text-center p-6">
              {midiFile ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">♪</span>
                  </div>
                  <p className="text-white font-semibold">{midiFile.name}</p>
                  <p className="text-slate-400 text-sm mt-1">{(midiFile.size / 1024).toFixed(1)} KB</p>
                  <p className="text-orange-400 text-xs mt-2">Click to change file</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-300 font-medium">Drop your MIDI file here</p>
                  <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                  <p className="text-slate-600 text-xs mt-2">.mid / .midi supported</p>
                </>
              )}
            </div>
          </div>

          {/* Convert button */}
          <button
            onClick={handleConvert}
            disabled={isProcessing || !midiFile}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
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

          {/* JSON format reference */}
          <div className="mt-4 bg-black/30 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wider">Output JSON structure</p>
            <pre className="text-slate-400 text-xs leading-relaxed font-mono">{`{
  tempo, time_signature, key,
  subdivisions_per_bar,
  bars: [{
    bar_number,
    notes: [{
      pitch,              // "D2"
      start_subdivision,  // 0–15 (4/4)
      offset_percent,     // XR offset
      duration_subdivisions,
      end_cutoff_percent, // null or 0–99
      velocity            // 1–127
    }]
  }]
}`}</pre>
          </div>
        </div>

        {/* RIGHT — Output + Status */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-500/20 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-purple-400 font-mono">{'{ }'}</span>
                JSON Output
              </h2>
              {output && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
                  }`}
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              )}
            </div>

            <textarea
              value={output}
              readOnly
              placeholder="Upload a MIDI file and convert to see JSON output here..."
              className="flex-1 w-full min-h-64 md:min-h-80 bg-black/60 border border-slate-700 rounded-xl p-4 text-gray-100 font-mono resize-none text-xs leading-relaxed shadow-inner focus:outline-none"
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
                <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-1.5 text-sm">
                  <Activity className="w-4 h-4" /> Conversion Complete
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Bars',    value: stats.bars },
                    { label: 'Notes',   value: stats.notes },
                    { label: 'Tempo',   value: stats.tempo },
                    { label: 'TimeSig', value: stats.timeSig },
                    { label: 'Subdiv',  value: stats.subDiv },
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
                Upload a MIDI file and click Convert to JSON
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}