// import React, { useState } from 'react';
// import { Download, Info, Music, FileText, Settings, BookOpen, AlertTriangle, Activity } from 'lucide-react';

// const TextMidiConverter = () => {
//   const [input, setInput] = useState(`Tempo: 120
// TimeSig: 4/4
// Instrument: Piano
// Legato: On
// Key: C

// Bar: 1 e & a 2 e & a 3 e & a 4 e & a
// C4:   X . . .   . . . .   . . . .   . . . .
// E4:   . . . .   X . . .   . . . .   . . . .
// G4:   . . . .   . . . .   X . . .   . . . .
// C5:   . . . .   . . . .   . . . .   X . . .`);
  
//   const [showTutorial, setShowTutorial] = useState(false);
//   const [showQuickReference, setShowQuickReference] = useState(true);
//   const [midiData, setMidiData] = useState(null);
//   const [errors, setErrors] = useState([]);

//   const advancedTutorial = `
// 🎹 ADVANCED Text → MIDI FORMAT GUIDE (FL Studio Piano Roll Style)

// === METADATA SECTION ===
// Tempo: 60-200 (BPM)
// TimeSig: 4/4, 3/4, 2/4, 6/8, etc.
// Instrument: Piano
// Legato: On/Off (merge sustained notes on same pitch)
// Key: C, D, Eb, F#, etc. (transposes all pitches)

// === NOTE GRID ===
// - 4/4: 16 columns for 16th notes (e & a subdivision)
// - 4/4: 12 columns for triplets (& a subdivision)
// - Each column represents one subdivision unit
// - Use consistent spacing between symbols

// === SYMBOLS ===
// X        = Note-on (velocity 100)
// X0-100   = Note-on with velocity (1-127)
// X^       = Accent (velocity +20, max 127)
// Xv       = Soft (velocity -20, min 1)
// X.       = Dotted note (duration * 1.5)
// X2       = Double duration (duration * 2)
// X/2      = Half duration (duration * 0.5)
// Xs       = Staccato (duration * 0.5)
// X:4      = Note with duration of 4 subdivisions
// X80:2    = Note with velocity 80, duration 2 subdivisions
// XR0-100  = Note offset ticks to the right (late). 100 = 1 full subdivision.
// XL0-100  = Note offset ticks to the left (early). 100 = 1 full subdivision.
// XE0-100  = Short note with duration as percentage of subdivision (e.g., XE25 = 25% duration).
// XE50XE50 = Multiple short notes in one subdivision (percentages should sum <=100%).
// ~        = Sustain previous note (full subdivision)
// ~0-100   = Sustain previous note but cutoff at percentage of subdivision (e.g., ~25).
// .        = Silence/rest

// === PITCH NOTATION ===
// Scientific: C4, D#5, Bb3, F#2
// Octaves: 0-9 (C4 = middle C)
// `;

//   // Fixed note mapping with proper enharmonic equivalents
//   const noteMap = {
//     'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
//     'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8,
//     'A': 9, 'A#': 10, 'BB': 10, 'B': 11
//   };

//   // Accurate MIDI pitch validation
//   const validateMidiPitch = (pitch, transposition) => {
//     const midiNote = convertPitchToMidi(pitch, transposition);
//     if (midiNote < 0 || midiNote > 127) {
//       throw new Error(`Pitch ${pitch} with transposition ${transposition} results in MIDI note ${midiNote}, which is out of range (0-127)`);
//     }
//     return midiNote;
//   };

//   // Strict velocity validation
//   const validateVelocity = (velocity) => {
//     const val = Math.max(1, Math.min(127, Math.round(velocity)));
//     return val;
//   };

//   // Precise timing calculation with proper rounding
//   const calculateActualTick = (baseTick, timingOffset, ticksPerSubdivision) => {
//     // Corrected to use timingOffset as a percentage of the subdivision
//     const offsetTicks = (timingOffset / 100) * ticksPerSubdivision;
//     return Math.max(0, baseTick + offsetTicks);
//   };

//   // Enhanced note symbol parser with XR/XL offset and E modifier support
//   const parseNoteSymbol = (symbol, defaultVelocity = 100) => {
//     let velocity = defaultVelocity;
//     let durationMultiplier = 1;
//     let timingOffset = 0;
//     let endingOffset = null;
//     let isNoteOn = false;
//     let isSustain = false;
//     let isRest = false;
//     let isEndMarker = false;

//     const originalSymbol = symbol;
//     symbol = symbol.toUpperCase();

//     // Check for sustain symbols (~ or ~0-100)
//     const sustainMatch = symbol.match(/^~(\d+)?$/);
//     if (sustainMatch) {
//       isSustain = true;
//       if (sustainMatch[1]) {
//         endingOffset = parseInt(sustainMatch[1]);
//         if (endingOffset < 0 || endingOffset > 100) {
//           throw new Error(`Sustain ending offset ${endingOffset} must be between 0-100`);
//         }
//       }
//       return { isNoteOn, velocity, durationMultiplier, timingOffset, endingOffset, isSustain, isRest, isEndMarker };
//     }

//     // Check for standalone E (deprecated)
//     if (symbol.match(/^E(\d+)$/)) {
//       throw new Error(`Standalone E${symbol.slice(1)} is deprecated. Use ~num to end sustained notes.`);
//     }

//     // Check for note-on symbols
//     if (symbol.startsWith('X')) {
//       isNoteOn = true;
//       const velocityMatch = symbol.match(/^X(\d+)/);
//       if (velocityMatch) {
//         velocity = parseInt(velocityMatch[1]);
//         if (velocity < 1 || velocity > 127) {
//           throw new Error(`Velocity ${velocity} must be between 1-127`);
//         }
//         symbol = symbol.replace(/^X\d*/, '');
//       } else {
//         symbol = symbol.replace(/^X/, '');
//       }
//     } else {
//       isNoteOn = false;
//     }

//     // Process other modifiers with loops for multiple
//     while (symbol.includes('^')) {
//       velocity = Math.min(127, velocity + 20);
//       symbol = symbol.replace('^', '');
//     }
//     while (symbol.includes('v')) {
//       velocity = Math.max(1, velocity - 20);
//       symbol = symbol.replace('v', '');
//     }
//     while (symbol.includes('.')) {
//       durationMultiplier *= 1.5;
//       symbol = symbol.replace('.', '');
//     }
//     while (symbol.includes('2')) {
//       durationMultiplier *= 2;
//       symbol = symbol.replace('2', '');
//     }
//     while (symbol.includes('/2')) {
//       durationMultiplier *= 0.5;
//       symbol = symbol.replace('/2', '');
//     }
//     while (symbol.includes('s')) {
//       durationMultiplier *= 0.5;
//       symbol = symbol.replace('s', '');
//     }

//     // Extract duration if present (X:4 format)
//     const durationMatch = symbol.match(/:(\d+)/);
//     if (durationMatch) {
//       durationMultiplier = parseInt(durationMatch[1]);
//       symbol = symbol.replace(/:\d+/, '');
//     }
    
//     // Extract timing offsets (XR/XL format)
//     const rightOffsetMatch = symbol.match(/XR(\d+)/);
//     if (rightOffsetMatch) {
//       timingOffset = parseInt(rightOffsetMatch[1]);
//       symbol = symbol.replace(/XR\d+/, '');
//     }
//     const leftOffsetMatch = symbol.match(/XL(\d+)/);
//     if (leftOffsetMatch) {
//       timingOffset = -parseInt(leftOffsetMatch[1]);
//       symbol = symbol.replace(/XL\d+/, '');
//     }

//     // Extract end timing offset (E0-100 format)
//     const endOffsetMatch = symbol.match(/E(\d+)/);
//     if (endOffsetMatch) {
//       endingOffset = parseInt(endOffsetMatch[1]);
//       if (endingOffset < 0 || endingOffset > 100) {
//         throw new Error(`Ending offset ${endingOffset} must be between 0-100`);
//       }
//       symbol = symbol.replace(/E\d+/, '');
//     }

//     // Check for end marker
//     if (endingOffset !== null && !isNoteOn) {
//       isEndMarker = true;
//     }

//     // Check for rest
//     isRest = originalSymbol === '.';

//     // Check for sustain (already handled above)

//     return { 
//       isNoteOn,
//       velocity: validateVelocity(velocity), 
//       durationMultiplier: Math.max(0.125, durationMultiplier),
//       timingOffset, 
//       endingOffset, 
//       isSustain: originalSymbol === '~' || isSustain,
//       isRest,
//       isEndMarker,
//     };
//   };

//   // Enhanced advanced mode parser
//   const parseTextToMidi = (textInput) => {
//     const lines = textInput.trim().split('\n').filter(line => line.trim());
//     const metadata = {};
//     const errors = [];
//     const tracks = {};
//     let currentBar = 0;
    
//     // Parse metadata with better validation
//     const metadataLines = lines.filter(line => line.includes(':') && !line.includes('Bar:') && !line.match(/^[A-G]/i));
//     metadataLines.forEach(line => {
//       const colonIndex = line.indexOf(':');
//       if (colonIndex > 0) {
//         const key = line.substring(0, colonIndex).trim().toLowerCase();
//         const value = line.substring(colonIndex + 1).trim();
//         metadata[key] = value;
//       }
//     });

//     const tempo = parseInt(metadata.tempo) || 120;
//     const timeSig = metadata.timesig || '4/4';
//     const [numStr, denStr] = timeSig.split('/').map(s => s.trim());
//     const numerator = parseInt(numStr) || 4;
//     const denominator = parseInt(denStr) || 4;
//     const instrument = 'Piano';
//     const legato = metadata.legato?.toLowerCase() === 'on';
//     const key = (metadata.key || 'C').toUpperCase();

//     // Validate metadata
//     if (tempo < 60 || tempo > 200) {
//       errors.push(`Tempo ${tempo} must be between 60-200 BPM`);
//     }
//     if (![1, 2, 3, 4, 6, 8, 9, 12, 16].includes(numerator)) {
//       errors.push(`Invalid time signature numerator: ${numerator}`);
//     }
//     if (![2, 4, 8, 16].includes(denominator)) {
//       errors.push(`Invalid time signature denominator: ${denominator}`);
//     }
//     if (!(key in noteMap)) {
//       errors.push(`Invalid key: ${key}. Use C, C#, D, Eb, etc.`);
//     }

//     // Calculate subdivisions based on bar header analysis
//     let subdivisionsPerBar = numerator * 4; // Default to 16th notes
//     const firstBarLine = lines.find(line => line.startsWith('Bar:'));
//     if (firstBarLine) {
//       const barContent = firstBarLine.split('Bar:')[1].trim();
//       const barParts = barContent.split(/\s+/).filter(p => p.trim());
      
//       // Count actual subdivisions in header
//       let subdivisionCount = 0;
//       for (let part of barParts) {
//         if (part.match(/^\d+$/) || part === '&' || part === 'a' || part === 'e') {
//           subdivisionCount++;
//         }
//       }
      
//       if (subdivisionCount > 0) {
//         subdivisionsPerBar = subdivisionCount;
//       } else {
//         // Fallback: analyze header content
//         if (barContent.includes('e & a')) {
//           subdivisionsPerBar = numerator * 4; // 16th notes
//         } else if (barContent.includes('& a')) {
//           subdivisionsPerBar = numerator * 3; // Triplets
//         } else {
//           subdivisionsPerBar = numerator; // Quarter notes
//         }
//       }
//     }

//     // Parse bars and notes with improved error handling
//     let isParsingNotes = false;
//     let currentBarData = {};

//     const noteLines = lines.filter(line => line.startsWith('Bar:') || line.match(/^[A-G][#Bb]?[0-9]:/i));
    
//     noteLines.forEach((line, lineIndex) => {
//       try {
//         if (line.startsWith('Bar:')) {
//           // Save previous bar if exists
//           if (isParsingNotes && Object.keys(currentBarData).length > 0) {
//             tracks[currentBar] = { ...currentBarData };
//             currentBarData = {};
//           }
          
//           const barMatch = line.match(/Bar:\s*(\d+)/i);
//           if (barMatch) {
//             const barNum = parseInt(barMatch[1]);
//             if (barNum <= 0) {
//               errors.push(`Invalid bar number: ${barNum} (must be positive)`);
//             }
//             currentBar = barNum;
//             isParsingNotes = true;
//           } else {
//             errors.push(`Invalid bar format on line ${lineIndex + 1}: ${line}`);
//           }
//         } else if (isParsingNotes && line.match(/^[A-G][#Bb]?[0-9]:/i)) {
//           const colonIndex = line.indexOf(':');
//           if (colonIndex <= 0) {
//             errors.push(`Invalid pitch line format on line ${lineIndex + 1}: {line}`);
//             return;
//           }
          
//           const pitch = line.substring(0, colonIndex).trim().toUpperCase();
//           const pattern = line.substring(colonIndex + 1).trim();
          
//           // Validate pitch format
//           if (!pitch.match(/^[A-G][#Bb]?[0-9]$/)) {
//             errors.push(`Invalid pitch format "${pitch}" on line ${lineIndex + 1}`);
//             return;
//           }
          
//           const symbols = pattern.split(/\s+/).filter(s => s.length > 0);
//           if (symbols.length !== subdivisionsPerBar) {
//             errors.push(`Bar ${currentBar}, ${pitch}: expected ${subdivisionsPerBar} subdivisions, got ${symbols.length}`);
//           }
          
//           currentBarData[pitch] = symbols;
//         }
//       } catch (error) {
//         errors.push(`Error parsing line ${lineIndex + 1}: ${error.message}`);
//       }
//     });

//     // Save last bar
//     if (isParsingNotes && Object.keys(currentBarData).length > 0) {
//       tracks[currentBar] = { ...currentBarData };
//     }

//     return {
//       metadata: { tempo, timeSig, numerator, denominator, instrument, legato, key, subdivisionsPerBar },
//       tracks,
//       errors
//     };
//   };

//   // Accurate pitch to MIDI conversion
//   const convertPitchToMidi = (pitch, transposition) => {
//     const match = pitch.match(/^([A-G][#Bb]?)(\d+)$/i);
//     if (!match) {
//       throw new Error(`Invalid pitch format: ${pitch}`);
//     }
//     const [, noteName, octave] = match;
//     const noteNameUpper = noteName.toUpperCase();
//     const octaveValue = parseInt(octave);
    
//     if (!(noteNameUpper in noteMap)) {
//       throw new Error(`Unknown note name: ${noteNameUpper}`);
//     }
//     if (octaveValue < 0 || octaveValue > 9) {
//       throw new Error(`Octave ${octaveValue} out of range (0-9)`);
//     }
    
//     const noteValue = noteMap[noteNameUpper];
//     return (octaveValue + 1) * 12 + noteValue + transposition;
//   };

//   // IMPROVED SUSTAIN LOGIC with enhanced timing offset and ending support
//   const convertToMidiEvents = (parsedData) => {
//     const { metadata, tracks } = parsedData;
//     const transposition = noteMap[metadata.key] || 0;
//     const ticksPerQuarter = 480;
//     const subdivisionsPerBar = metadata.subdivisionsPerBar || 16;
//     const ticksPerSubdivision = (ticksPerQuarter * 4 * metadata.numerator / metadata.denominator) / subdivisionsPerBar;
//     const barTicks = (ticksPerQuarter * 4) * (metadata.numerator / metadata.denominator);

//     const noteEvents = [];
//     const activeNotes = new Map(); // Track active notes across bars

//     const barNumbers = Object.keys(tracks).map(n => parseInt(n)).sort((a, b) => a - b);

//     for (let b = 0; b < barNumbers.length; b++) {
//       const barNum = barNumbers[b];
//       const barData = tracks[barNum];
//       const barStartTick = barTicks * (barNum - 1);

//       // End active notes for pitches not present in this bar
//       const currentPitches = new Set(Object.keys(barData));
//       for (const [noteId, noteStart] of [...activeNotes.entries()]) {
//         if (!currentPitches.has(noteStart.pitchName)) {
//           let endTick = barStartTick;
//           let duration = endTick - noteStart.startTick;
//           if (noteStart.minDurationTicks !== null) {
//             duration = Math.max(duration, noteStart.minDurationTicks);
//           }
//           if (noteStart.maxDurationTicks !== null) {
//             duration = Math.min(duration, noteStart.maxDurationTicks);
//           }
//           if (duration > 0) {
//             noteEvents.push({
//               type: 'note',
//               pitch: noteStart.pitch,
//               velocity: noteStart.velocity,
//               startTick: noteStart.startTick,
//               durationTicks: duration,
//             });
//           }
//           activeNotes.delete(noteId);
//         }
//       }

//       // Process each pitch track in this bar
//       Object.entries(barData).forEach(([pitch, symbols]) => {
//         const midiPitch = validateMidiPitch(pitch, transposition);
//         const noteId = `${midiPitch}`;

//         // Check if we have an active note from previous bars
//         let currentActiveNote = activeNotes.get(noteId);

//         for (let i = 0; i < symbols.length; i++) {
//           let symbol = symbols[i];
//           const baseTick = barStartTick + (i * ticksPerSubdivision);

//           try {
//             // Check for compound short notes (e.g., XE50XE50)
//             const compoundMatches = [...symbol.matchAll(/X(\d+)?E(\d+)/gi)];
//             let subParsed = [];
//             let isCompound = false;
//             let sumPercent = 0;

//             if (compoundMatches.length > 1 && compoundMatches.reduce((acc, m) => acc + m[0].length, 0) === symbol.length) {
//               isCompound = true;
//               subParsed = compoundMatches.map(m => {
//                 const velStr = m[1];
//                 const endStr = m[2];
//                 const vel = velStr ? parseInt(velStr) : 100;
//                 const end = parseInt(endStr);
//                 sumPercent += end;
//                 return {
//                   isNoteOn: true,
//                   velocity: validateVelocity(vel),
//                   durationMultiplier: 1,
//                   timingOffset: 0,
//                   endingOffset: end,
//                   isSustain: false,
//                   isRest: false,
//                   isEndMarker: false
//                 };
//               });
//               if (sumPercent > 100) {
//                 throw new Error(`Compound percentages in "${symbol}" exceed 100%`);
//               }
//             } else {
//               subParsed = [parseNoteSymbol(symbol)];
//             }

//             let subCumulativePercent = 0;

//             for (let spIdx = 0; spIdx < subParsed.length; spIdx++) {
//               const parsedSymbol = subParsed[spIdx];
//               const subBasePercent = subCumulativePercent;
//               const subBaseTick = baseTick + (subBasePercent / 100) * ticksPerSubdivision;
//               const calculatedTick = subBaseTick + (parsedSymbol.timingOffset / 100) * ticksPerSubdivision;
//               const actualTick = Math.max(0, calculatedTick);
//               if (actualTick === 0 && calculatedTick < 0) {
//                 console.warn(`Negative offset for ${pitch} in bar ${barNum} at sub ${i} clamped to 0.`);
//               }

//               if (parsedSymbol.isNoteOn) {
//                 // NEW NOTE START
                
//                 // End previous note if active
//                 if (currentActiveNote) {
//                   let endTick = subBaseTick;
//                   if (metadata.legato) {
//                     endTick += 10; // Small overlap for legato
//                   }
//                   let duration = endTick - currentActiveNote.startTick;
//                   if (currentActiveNote.minDurationTicks !== null) {
//                     duration = Math.max(duration, currentActiveNote.minDurationTicks);
//                   }
//                   if (currentActiveNote.maxDurationTicks !== null) {
//                     duration = Math.min(duration, currentActiveNote.maxDurationTicks);
//                   }
//                   if (duration > 0) {
//                     noteEvents.push({
//                       type: 'note',
//                       pitch: currentActiveNote.pitch,
//                       velocity: currentActiveNote.velocity,
//                       startTick: currentActiveNote.startTick,
//                       durationTicks: duration,
//                     });
//                   }
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                 }

//                 // Start new note
//                 const validatedVelocity = validateVelocity(parsedSymbol.velocity);
//                 const baseDurationTicks = ticksPerSubdivision * parsedSymbol.durationMultiplier;
//                 const hasExplicitDuration = !!symbol.match(/:\d+/); // Use symbol here since for compound, it's the full, but for non-compound, it's original
                
//                 currentActiveNote = {
//                   startTick: actualTick,
//                   pitch: midiPitch,
//                   velocity: validatedVelocity,
//                   pitchName: pitch,
//                   minDurationTicks: null,
//                   maxDurationTicks: null
//                 };
//                 if (hasExplicitDuration) {
//                   currentActiveNote.minDurationTicks = baseDurationTicks;
//                   currentActiveNote.maxDurationTicks = baseDurationTicks;
//                 } else if (parsedSymbol.durationMultiplier !== 1) {
//                   if (parsedSymbol.durationMultiplier > 1) {
//                     currentActiveNote.minDurationTicks = baseDurationTicks;
//                   } else {
//                     currentActiveNote.maxDurationTicks = baseDurationTicks;
//                   }
//                 }
//                 activeNotes.set(noteId, currentActiveNote);

//                 // Check for immediate end with E modifier or compound short
//                 if (parsedSymbol.endingOffset !== null) {
//                   const endPercent = parsedSymbol.endingOffset;
//                   let endTick = Math.round(subBaseTick + (endPercent / 100) * ticksPerSubdivision);
//                   let duration = endTick - actualTick;
//                   if (currentActiveNote.minDurationTicks !== null) {
//                     duration = Math.max(duration, currentActiveNote.minDurationTicks);
//                   }
//                   if (currentActiveNote.maxDurationTicks !== null) {
//                     duration = Math.min(duration, currentActiveNote.maxDurationTicks);
//                   }
//                   noteEvents.push({
//                     type: 'note',
//                     pitch: currentActiveNote.pitch,
//                     velocity: currentActiveNote.velocity,
//                     startTick: actualTick,
//                     durationTicks: duration,
//                   });
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                   subCumulativePercent += endPercent;
//                 } else if (!isCompound) {
//                   subCumulativePercent += 100;
//                 }

//               } else if (parsedSymbol.isSustain) {
//                 // SUSTAIN - keep note active
//                 if (currentActiveNote) {
//                   if (parsedSymbol.endingOffset !== null) {
//                     let endTick = Math.round(baseTick + (parsedSymbol.endingOffset / 100) * ticksPerSubdivision);
//                     let duration = endTick - currentActiveNote.startTick;
//                     if (currentActiveNote.minDurationTicks !== null) {
//                       duration = Math.max(duration, currentActiveNote.minDurationTicks);
//                     }
//                     if (currentActiveNote.maxDurationTicks !== null) {
//                       duration = Math.min(duration, currentActiveNote.maxDurationTicks);
//                     }
//                     if (duration > 0) {
//                       noteEvents.push({
//                         type: 'note',
//                         pitch: currentActiveNote.pitch,
//                         velocity: currentActiveNote.velocity,
//                         startTick: currentActiveNote.startTick,
//                         durationTicks: duration,
//                       });
//                     }
//                     activeNotes.delete(noteId);
//                     currentActiveNote = null;
//                   }
//                   // else: sustain full, do nothing
//                 } else {
//                   // Sustain with no active note: ignore or error
//                 }
//               } else if (parsedSymbol.isRest) {
//                 // SILENCE - end note if active
//                 if (currentActiveNote) {
//                   let endTick = baseTick;
//                   let duration = endTick - currentActiveNote.startTick;
//                   if (currentActiveNote.minDurationTicks !== null) {
//                     duration = Math.max(duration, currentActiveNote.minDurationTicks);
//                   }
//                   if (currentActiveNote.maxDurationTicks !== null) {
//                     duration = Math.min(duration, currentActiveNote.maxDurationTicks);
//                   }
//                   if (duration > 0) {
//                     noteEvents.push({
//                       type: 'note',
//                       pitch: currentActiveNote.pitch,
//                       velocity: currentActiveNote.velocity,
//                       startTick: currentActiveNote.startTick,
//                       durationTicks: duration,
//                     });
//                   }
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                 }
//               } else if (parsedSymbol.isEndMarker) {
//                 // Standalone 'E' symbol to end a sustained note (kept for backward compat, but deprecated)
//                 if (currentActiveNote) {
//                   let endTick = Math.round(baseTick + (ticksPerSubdivision * (parsedSymbol.endingOffset / 100)));
//                   let duration = endTick - currentActiveNote.startTick;
//                   if (currentActiveNote.minDurationTicks !== null) {
//                     duration = Math.max(duration, currentActiveNote.minDurationTicks);
//                   }
//                   if (currentActiveNote.maxDurationTicks !== null) {
//                     duration = Math.min(duration, currentActiveNote.maxDurationTicks);
//                   }
//                   if (duration > 0) {
//                     noteEvents.push({
//                       type: 'note',
//                       pitch: currentActiveNote.pitch,
//                       velocity: currentActiveNote.velocity,
//                       startTick: currentActiveNote.startTick,
//                       durationTicks: duration,
//                     });
//                   }
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                 }
//               }
//             }
//           } catch (error) {
//             console.error(`Error processing symbol "${symbol}" in bar ${barNum}, ${pitch}:`, error.message);
//           }
//         }
//       });
//     }

//     // End all remaining active notes at the final bar end
//     const finalBarTick = barNumbers.length * barTicks;
//     for (const [noteId, noteStart] of activeNotes.entries()) {
//       let duration = finalBarTick - noteStart.startTick;
//       if (noteStart.minDurationTicks !== null) {
//         duration = Math.max(duration, noteStart.minDurationTicks);
//       }
//       if (noteStart.maxDurationTicks !== null) {
//         duration = Math.min(duration, noteStart.maxDurationTicks);
//       }
//       if (duration > 0) {
//         noteEvents.push({
//           type: 'note',
//           pitch: noteStart.pitch,
//           velocity: noteStart.velocity,
//           startTick: noteStart.startTick,
//           durationTicks: duration,
//         });
//       }
//     }

//     // Convert to MIDI events (note-on/note-off pairs)
//     const midiEvents = [];
//     noteEvents.forEach(event => {
//       midiEvents.push({
//         tick: event.startTick,
//         type: 'on',
//         pitch: event.pitch,
//         velocity: event.velocity
//       });
//       midiEvents.push({
//         tick: event.startTick + event.durationTicks,
//         type: 'off',
//         pitch: event.pitch,
//         velocity: 0
//       });
//     });

//     // Sort events properly
//     midiEvents.sort((a, b) => {
//       if (a.tick !== b.tick) return a.tick - b.tick;

//       // Ensure note-off events come before note-on events at the same tick
//       if (a.type === 'off' && b.type === 'on') return -1;
//       if (a.type === 'on' && b.type === 'off') return 1;

//       // For same event types, sort by pitch
//       if (a.pitch !== b.pitch) return a.pitch - b.pitch;

//       return 0;
//     });

//     return midiEvents;
//   };
  
//   // Corrected MIDI variable-length encoding
//   const writeVariableLength = (value) => {
//     let buffer = value & 0x7F;
//     const bytes = [];
    
//     while ((value >>= 7) > 0) {
//       buffer <<= 8;
//       buffer |= (value & 0x7F) | 0x80;
//     }
    
//     while (true) {
//       bytes.push(buffer & 0xFF);
//       if (buffer & 0x80) {
//         buffer >>= 8;
//       } else {
//         break;
//       }
//     }
    
//     return bytes;
//   };

//   // Fixed MIDI byte generation with correct tempo encoding
//   const generateMidiBytes = (events, metadata) => {
//     const data = [];
    
//     // Helper functions
//     const writeBytes = (bytes) => bytes.forEach(b => data.push(b & 0xFF));
//     const writeInt = (value, numBytes) => {
//       for (let i = numBytes - 1; i >= 0; i--) {
//         data.push((value >> (8 * i)) & 0xFF);
//       }
//     };

//     // MIDI Header
//     writeBytes([0x4D, 0x54, 0x68, 0x64]); // "MThd"
//     writeInt(6, 4); // Header length
//     writeInt(0, 2); // Format 0 (single track)
//     writeInt(1, 2); // Number of tracks
//     writeInt(480, 2); // Ticks per quarter note

//     // Track data
//     const trackData = [];
    
//     // Add tempo meta event with proper delta time
//     const tempoDeltaTime = writeVariableLength(0);
//     trackData.push(...tempoDeltaTime);
//     trackData.push(0xFF, 0x51, 0x03); // Meta event: Set Tempo
    
//     // Fixed tempo calculation: microseconds per quarter note = 60,000,000 / BPM
//     const microsecondsPerQuarter = Math.round(60000000 / metadata.tempo);
//     trackData.push((microsecondsPerQuarter >> 16) & 0xFF);
//     trackData.push((microsecondsPerQuarter >> 8) & 0xFF);
//     trackData.push(microsecondsPerQuarter & 0xFF);
    
//     // Set time signature with proper delta time
//     const timeSigDeltaTime = writeVariableLength(0);
//     trackData.push(...timeSigDeltaTime);
//     trackData.push(0xFF, 0x58, 0x04); // Meta event: Time Signature
//     trackData.push(metadata.numerator || 4);
//     trackData.push(Math.log2(metadata.denominator || 4));
//     trackData.push(24); // MIDI clocks per metronome tick
//     trackData.push(8); // 32nd notes per quarter note

//     // Add program change for instrument (Piano = 0)
//     const programDeltaTime = writeVariableLength(0);
//     trackData.push(...programDeltaTime);
//     trackData.push(0xC0, 0x00);

//     // Add MIDI events with proper delta time calculation
//     let lastTick = 0;
//     events.forEach(event => {
//       const deltaTime = Math.max(0, Math.round(event.tick - lastTick));
//       const deltaBytes = writeVariableLength(deltaTime);
//       trackData.push(...deltaBytes);
      
//       if (event.type === 'on') {
//         trackData.push(0x90, event.pitch & 0x7F, event.velocity & 0x7F);
//       } else {
//         trackData.push(0x80, event.pitch & 0x7F, 0x40); // Standard note-off with velocity 64
//       }
//       //lastTick = event.tick
//       lastTick += deltaTime;
//     });

//     // End of track
//     const endBytes = writeVariableLength(0);
//     trackData.push(...endBytes);
//     trackData.push(0xFF, 0x2F, 0x00);

//     // Write track header and data
//     writeBytes([0x4D, 0x54, 0x72, 0x6B]); // "MTrk"
//     writeInt(trackData.length, 4);
//     writeBytes(trackData);

//     return new Uint8Array(data);
//   };

//   const handleConvert = () => {
//     try {
//       const parsed = parseTextToMidi(input);
      
//       setErrors(parsed.errors);
      
//       if (parsed.errors.length === 0) {
//         const events = convertToMidiEvents(parsed);
//         setMidiData({ events, metadata: parsed.metadata });
//       } else {
//         setMidiData(null);
//       }
//     } catch (error) {
//       console.error('Conversion error:', error);
//       setErrors([`Critical error: ${error.message}`]);
//       setMidiData(null);
//     }
//   };

//   const handleDownload = () => {
//     if (!midiData || midiData.events.length === 0) return;

//     try {
//       const midiBytes = generateMidiBytes(midiData.events, midiData.metadata);
//       const blob = new Blob([midiBytes], { type: 'audio/midi' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `Text-midi-${Date.now()}.mid`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Download error:', error);
//       setErrors([`Download failed: ${error.message}`]);
//     }
//   };

//   return (
//   <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col p-6">
//     {/* Header */}
//     <div className="text-center mb-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-xl">
//       <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
//          Text → MIDI Converter
//       </h1>
//       <p className="mt-3 text-gray-400 text-lg">
//         Turn advanced notation into playable MIDI
//       </p>
//     </div>

//     {/* Main Content */}
//     <main className="flex flex-1 overflow-hidden mt-0 gap-6">
//       {/* Left - Editor */}
//       <section className="flex-1 overflow-y-auto">
//         <div className="bg-black/50 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700 shadow-xl h-full flex flex-col">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-semibold text-white flex items-center mb-5">
//               <FileText className="w-6 h-6 mr-2 text-purple-400" />
//               Advanced Notation
//             </h2>
//             <button
//               onClick={() => setShowTutorial(!showTutorial)}
//               className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
//             >
//               <BookOpen className="w-4 h-4" />
//               Guide
//             </button>
//           </div>

//           {/* Big Editor */}
//           <textarea
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder={`Tempo: 120\nTimeSig: 4/4\nInstrument: Piano\nKey: C\n\nBar: 1 e & a 2 e & a\nC4:   X . . .   X . . .`}
//             className="w-full flex-1 h-[75vh] bg-slate-950/70 border border-slate-700 rounded-xl p-6 text-gray-100 font-mono resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-inner tracking-wide text-lg"
//             spellCheck={false}
//           />

//           {/* Buttons */}
//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={handleConvert}
//               className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
//             >
//               <Activity className="w-5 h-5" />
//               Convert to MIDI
//             </button>

//             {midiData && (
//               <button
//                 onClick={handleDownload}
//                 className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
//               >
//                 <Download className="w-5 h-5" />
//                 Download MIDI
//               </button>
//             )}
//           </div>

//           {/* Tutorial */}
//           {showTutorial && (
//             <div className="mt-6 bg-slate-900/70 p-6 rounded-xl border border-slate-700">
//               <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
//                 <BookOpen className="w-5 h-5 mr-2" />
//                 Tutorial & Examples
//               </h3>
//               <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-lg overflow-x-auto h-[40vh]">
//                 {advancedTutorial}
//               </pre>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Sidebar */}
//       <aside className="w-full lg:w-96 p-6 overflow-y-auto bg-black/30 border-l border-slate-800 backdrop-blur-2xl rounded-2xl shadow-xl">
//         {/* Quick Reference */}
//         {showQuickReference && (
//           <div className="mb-6 bg-slate-900/70 rounded-xl p-6 border border-slate-700">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-xl font-bold text-green-400 flex items-center">
//                 <Info className="w-5 h-5 mr-2" />
//                 Quick Reference
//               </h3>
//               <button
//                 onClick={() => setShowQuickReference(false)}
//                 className="text-gray-500 hover:text-white transition-colors"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="space-y-4 text-sm text-gray-300">
//               <div>
//                 <h4 className="font-semibold text-pink-400 mb-2">Symbols:</h4>
//                 <ul className="space-y-1">
//                   <li>• X = Note trigger</li>
//                   <li>• X0-100 = Velocity 80</li>
//                   <li>• X:4 = Duration</li>
//                   <li>• XR0-100 = 15 ticks late</li>
//                   <li>• XL0-100 = 10 ticks early</li>
//                   <li>• ~ = Sustain</li>
//                   <li>• . = Rest</li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-semibold text-yellow-400 mb-2">Modifiers:</h4>
//                 <ul className="space-y-1">
//                   <li>• ^ = Accent</li>
//                   <li>• v = Soft</li>
//                   <li>• . = Dotted</li>
//                   <li>• s = Staccato</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Status */}
//         <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700">
//           <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center">
//             <Activity className="w-5 h-5 mr-2" />
//             Status
//           </h3>

//           {errors.length > 0 && (
//             <div className="mb-4">
//               <h4 className="font-semibold text-red-400 mb-2 flex items-center">
//                 <AlertTriangle className="w-4 h-4 mr-1" />
//                 Errors:
//               </h4>
//               <ul className="text-red-300 text-sm space-y-1">
//                 {errors.map((error, i) => (
//                   <li key={i}>• {error}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {midiData && (
//             <div className="space-y-2 text-sm text-gray-200">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Events:</span>
//                 <span className="text-cyan-300">{midiData.events.length}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Tempo:</span>
//                 <span className="text-cyan-300">{midiData.metadata.tempo} BPM</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Time Sig:</span>
//                 <span className="text-cyan-300">{midiData.metadata.timeSig}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Key:</span>
//                 <span className="text-cyan-300">{midiData.metadata.key}</span>
//               </div>
//             </div>
//           )}

//           {!midiData && errors.length === 0 && (
//             <p className="text-gray-400 text-sm">
//               Enter notation and click{" "}
//               <span className="text-cyan-400">"Convert to MIDI"</span> to begin.
//             </p>
//           )}
//         </div>
//       </aside>
//     </main>
//   </div>
// );
// };

// export default TextMidiConverter;





// import React, { useState } from 'react';
// import { Activity, AlertTriangle, FileText } from 'lucide-react';

// const noteMap = {
//   'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
//   'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8,
//   'A': 9, 'A#': 10, 'BB': 10, 'B': 11
// };

// class TextToMidiConverterEngine {
//   static calculateSubdivisions(timeSig) {
//     const numerator = timeSig.numerator;
//     const denominator = timeSig.denominator;
//     const subdivisions = numerator * (16 / denominator);
//     if (!Number.isInteger(subdivisions)) {
//       throw new Error(`Invalid time signature: ${numerator}/${denominator} results in non-integer subdivisions.`);
//     }
//     return subdivisions;
//   }

//   static validateMidiPitch(pitch, transposition) {
//     const midiNote = this.convertPitchToMidi(pitch, transposition);
//     if (midiNote < 0 || midiNote > 127) {
//       throw new Error(`Pitch ${pitch} with transposition ${transposition} results in MIDI note ${midiNote}, which is out of range (0-127)`);
//     }
//     return midiNote;
//   }

//   static validateVelocity(velocity) {
//     const val = Math.max(1, Math.min(127, Math.round(velocity)));
//     return val;
//   }

//   static parseNoteSymbol(symbol, defaultVelocity = 100) {
//     let velocity = defaultVelocity;
//     let timingOffset = 0;
//     let durationPercent = null;
//     let restOffset = null;
//     let restDuration = null;
//     let isNoteOn = false;
//     let isSustain = false;
//     let isRest = false;
//     let sustainCutoff = null;

//     const originalSymbol = symbol;
//     symbol = symbol.toUpperCase();

//     if (originalSymbol === '.') {
//       return { 
//         isNoteOn: false, 
//         velocity, 
//         timingOffset: 0, 
//         durationPercent: null,
//         restOffset: null,
//         restDuration: null,
//         isSustain: false, 
//         isRest: true,
//         sustainCutoff: null
//       };
//     }

//     const sustainMatch = symbol.match(/^~(\d+)?$/);
//     if (sustainMatch) {
//       isSustain = true;
//       if (sustainMatch[1]) {
//         sustainCutoff = parseInt(sustainMatch[1]);
//         if(sustainCutoff < 0){
//           sustainCutoff = 0;
//         }
//         if(sustainCutoff > 100){
//           sustainCutoff = 100;
//         }
//       }
//       return { 
//         isNoteOn: false, 
//         velocity, 
//         timingOffset: 0, 
//         durationPercent: null,
//         restOffset: null,
//         restDuration: null,
//         isSustain: true, 
//         isRest: false,
//         sustainCutoff
//       };
//     }

//     const positionedRestMatch = symbol.match(/^XO(\d+)XE(\d+)$/);
//     if (positionedRestMatch) {
//       restOffset = parseInt(positionedRestMatch[1]);
//       restDuration = parseInt(positionedRestMatch[2]);
      
//       if (restOffset < 0) {
//         restOffset = 0;
//       }
//       if (restOffset > 100) {
//         restOffset = 100;
//       }
//       if (restDuration < 0) {
//         restDuration = 0;
//       }
//       if (restDuration > 100) {
//         restDuration = 100;
//       }
//       if (restOffset + restDuration > 100) {
//         restDuration = 100 - restOffset;
//       }

//       return { 
//         isNoteOn: true,
//         velocity: 100,
//         timingOffset: restOffset, 
//         durationPercent: restDuration,
//         restOffset,
//         restDuration,
//         isSustain: false, 
//         isRest: false,
//         sustainCutoff: null
//       };
//     }

//     if (symbol.startsWith('X')) {
//       isNoteOn = true;
      
//       const velocityMatch = symbol.match(/^X(\d+)/);
//       if (velocityMatch) {
//         velocity = parseInt(velocityMatch[1]);
//         if(velocity > 127){
//           velocity = 127;
//         }
//         if (velocity < 1) {
//           velocity = 1;
//         }
//         symbol = symbol.replace(/^X\d+/, '');
//       } else {
//         symbol = symbol.replace(/^X/, '');
//       }

//       const rightOffsetMatch = symbol.match(/XR(\d+)/);
//       if (rightOffsetMatch) {
//         timingOffset = parseInt(rightOffsetMatch[1]);
//         if(timingOffset > 100){
//           timingOffset = 100;
//         }
//         if(timingOffset < 0){
//           timingOffset = 0;
//         }
//         symbol = symbol.replace(/XR\d+/, '');
//       }

//       const leftOffsetMatch = symbol.match(/XL(\d+)/);
//       if (leftOffsetMatch) {
//         let leftVal = parseInt(leftOffsetMatch[1]);
//         if(leftVal > 100){
//           leftVal = 100;
//         }
//         if(leftVal < 0){
//           leftVal = 0;
//         }
//         timingOffset = -leftVal;
//         symbol = symbol.replace(/XL\d+/, '');
//       }

//       const durationMatch = symbol.match(/E(\d+)/) || symbol.match(/^(\d+)$/);
//       if (durationMatch) {
//         durationPercent = parseInt(durationMatch[1]);
//         if (durationPercent < 0) {
//           durationPercent = 0;
//         }
//         if (durationPercent > 100) {
//           durationPercent = 100;
//         }
//         symbol = symbol.replace(/E?\d+/, '');
//       }
//     }

//     return { 
//       isNoteOn,
//       velocity: this.validateVelocity(velocity), 
//       timingOffset,
//       durationPercent,
//       restOffset,
//       restDuration,
//       isSustain: false, 
//       isRest: false,
//       sustainCutoff: null
//     };
//   }

//   static parseCompoundSymbol(symbol) {
//     const parts = [];
    
//     const shortNoteMatches = [...symbol.matchAll(/X(\d+)?E(\d+)/gi)];
//     if (shortNoteMatches.length > 1) {
//       let totalPercent = 0;
//       let currentStart = 0;
      
//       for (const match of shortNoteMatches) {
//         const vel = match[1] ? parseInt(match[1]) : 100;
//         let duration = parseInt(match[2]);
        
//         if(duration > 100){
//           duration = 100;
//         }
//         if(duration < 0){
//           duration = 0;
//         }
        
//         totalPercent += duration;
        
//         if (totalPercent > 100) {
//           duration = 100 - currentStart;
//           if(duration < 0) duration = 0;
//         }

//         parts.push({
//           isNoteOn: true,
//           velocity: this.validateVelocity(vel),
//           timingOffset: currentStart,
//           durationPercent: duration,
//           restOffset: null,
//           restDuration: null,
//           isSustain: false,
//           isRest: false,
//           sustainCutoff: null
//         });
        
//         currentStart += duration;
//         if(currentStart >= 100) break;
//       }
      
//       return parts;
//     }

//     const complexRestMatch = symbol.match(/^((?:XO\d+XE\d+|XE\d+)+)$/);
//     if (complexRestMatch) {
//       const segments = [...symbol.matchAll(/(XO\d+XE\d+|XE\d+)/g)];
//       let currentPos = 0;
      
//       for (const segment of segments) {
//         const segmentStr = segment[0];
        
//         if (segmentStr.startsWith('XO')) {
//           const posMatch = segmentStr.match(/^XO(\d+)XE(\d+)$/);
//           if (posMatch) {
//             let restOffset = parseInt(posMatch[1]);
//             let noteDuration = parseInt(posMatch[2]);
            
//             if(restOffset > 100) restOffset = 100;
//             if(restOffset < 0) restOffset = 0;
//             if(noteDuration > 100) noteDuration = 100;
//             if(noteDuration < 0) noteDuration = 0;
            
//             if(restOffset + noteDuration > 100){
//               noteDuration = 100 - restOffset;
//               if(noteDuration < 0) noteDuration = 0;
//             }
            
//             parts.push({
//               isNoteOn: true,
//               velocity: 100,
//               timingOffset: restOffset,
//               durationPercent: noteDuration,
//               restOffset,
//               restDuration: noteDuration,
//               isSustain: false,
//               isRest: false,
//               sustainCutoff: null
//             });
//             currentPos += restOffset + noteDuration;
//           }
//         } else if (segmentStr.startsWith('XE')) {
//           const durationMatch = segmentStr.match(/^XE(\d+)$/);
//           if (durationMatch) {
//             let duration = parseInt(durationMatch[1]);
            
//             if(duration > 100) duration = 100;
//             if(duration < 0) duration = 0;
            
//             if(currentPos + duration > 100){
//               duration = 100 - currentPos;
//               if(duration < 0) duration = 0;
//             }
            
//             parts.push({
//               isNoteOn: true,
//               velocity: 100,
//               timingOffset: currentPos,
//               durationPercent: duration,
//               restOffset: null,
//               restDuration: null,
//               isSustain: false,
//               isRest: false,
//               sustainCutoff: null
//             });
            
//             currentPos += duration;
//           }
//         }
        
//         if(currentPos >= 100) break;
//       }
      
//       return parts;
//     }

//     return [this.parseNoteSymbol(symbol)];
//   }

//   static parseTextToMidi(text) {
//     const lines = text.trim().split('\n');
//     let tempo = 120;
//     let timeSig = { numerator: 4, denominator: 4 };
//     let key = 'C';
//     const bars = [];
//     let currentBar = null;
//     const errors = [];
//     let transposition = 0;

//     lines.forEach(line => {
//       line = line.trim();
//       if (!line) return;

//       if (line.startsWith('Tempo:')) {
//         const match = line.match(/Tempo:\s*(\d+)/);
//         if (match) tempo = parseInt(match[1]);
//       } else if (line.startsWith('TimeSig:')) {
//         const match = line.match(/TimeSig:\s*(\d+)\/(\d+)/);
//         if (match) {
//           timeSig.numerator = parseInt(match[1]);
//           timeSig.denominator = parseInt(match[2]);
//         }
//       } else if (line.startsWith('Key:')) {
//         const match = line.match(/Key:\s*([A-G][#b]?[m]?)/i);
//         if (match) {
//           key = match[1].toUpperCase();
//           if (!/^[A-G][#B]?M?$/.test(key)) {
//             key = 'C';
//           }
//         }
//       } else if (line.startsWith('Bar:')) {
//         const match = line.match(/Bar:\s*(\d+)/);
//         if (match) {
//           currentBar = { number: parseInt(match[1]), pitches: new Map() };
//           bars.push(currentBar);
//         }
//       } else if (currentBar && line.match(/^[A-G][#b]?\d:/i)) {
//         const [pitch, patternStr] = line.split(':');
//         const symbols = patternStr.trim().split(/\s+/).filter(s => s);
//         currentBar.pitches.set(pitch.trim(), symbols);
//       }
//     });

//     const metadata = { tempo, timeSig, key };

//     return { bars, metadata, errors, transposition };
//   }

//   static convertToMidiEvents(parsed) {
//     const { bars, metadata, transposition } = parsed;
//     const timeSig = metadata.timeSig;
//     const ticksPerQuarter = 480;
//     const subdivisionsPerBar = this.calculateSubdivisions(timeSig);
//     const barTicks = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
//     const ticksPerSubdivision = barTicks / subdivisionsPerBar;

//     const noteEvents = [];
//     const activeNotes = new Map();

//     bars.forEach(bar => {
//       const barNum = bar.number;
//       const baseBarTick = (barNum - 1) * barTicks;

//       bar.pitches.forEach((patterns, pitch) => {
//         let currentActiveNote = null;
//         const noteId = `${barNum}-${pitch}`;

//         patterns.forEach((symbol, subIndex) => {
//           const parsedSymbols = this.parseCompoundSymbol(symbol);
//           parsedSymbols.forEach(parsedSymbol => {
//             try {
//               const baseTick = baseBarTick + subIndex * ticksPerSubdivision;
//               const offsetTicks = (parsedSymbol.timingOffset / 100) * ticksPerSubdivision;
//               const actualTick = baseTick + offsetTicks;
//               const midiPitch = this.validateMidiPitch(pitch, transposition);

//               if (parsedSymbol.isNoteOn) {
//                 if (currentActiveNote) {
//                   const duration = actualTick - currentActiveNote.startTick;
//                   if (duration > 0) {
//                     noteEvents.push({
//                       type: 'note',
//                       pitch: currentActiveNote.pitch,
//                       velocity: currentActiveNote.velocity,
//                       startTick: currentActiveNote.startTick,
//                       durationTicks: duration,
//                     });
//                   }
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                 }

//                 currentActiveNote = {
//                   startTick: actualTick,
//                   pitch: midiPitch,
//                   velocity: parsedSymbol.velocity,
//                   pitchName: pitch
//                 };
//                 activeNotes.set(noteId, currentActiveNote);

//                 if (parsedSymbol.durationPercent !== null) {
//                   const durationTicks = (parsedSymbol.durationPercent / 100) * ticksPerSubdivision;
//                   const endTick = actualTick + durationTicks;
                  
//                   noteEvents.push({
//                     type: 'note',
//                     pitch: midiPitch,
//                     velocity: parsedSymbol.velocity,
//                     startTick: actualTick,
//                     durationTicks: durationTicks,
//                   });
                  
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                 }

//               } else if (parsedSymbol.isSustain) {
//                 if (currentActiveNote) {
//                   if (parsedSymbol.sustainCutoff !== null) {
//                     const cutoffTicks = (parsedSymbol.sustainCutoff / 100) * ticksPerSubdivision;
//                     const endTick = baseTick + cutoffTicks;
//                     const duration = endTick - currentActiveNote.startTick;
                    
//                     if (duration > 0) {
//                       noteEvents.push({
//                         type: 'note',
//                         pitch: currentActiveNote.pitch,
//                         velocity: currentActiveNote.velocity,
//                         startTick: currentActiveNote.startTick,
//                         durationTicks: duration,
//                       });
//                     }
//                     activeNotes.delete(noteId);
//                     currentActiveNote = null;
//                   }
//                 }

//               } else if (parsedSymbol.isRest) {
//                 if (currentActiveNote) {
//                   const duration = baseTick - currentActiveNote.startTick;
//                   if (duration > 0) {
//                     noteEvents.push({
//                       type: 'note',
//                       pitch: currentActiveNote.pitch,
//                       velocity: currentActiveNote.velocity,
//                       startTick: currentActiveNote.startTick,
//                       durationTicks: duration,
//                     });
//                   }
//                   activeNotes.delete(noteId);
//                   currentActiveNote = null;
//                 }
//               }
//             } catch (error) {
//               console.error(`Error processing symbol "${symbol}" in bar ${barNum}, ${pitch}:`, error.message);
//             }
//           });
//         });

//         if (currentActiveNote) {
//           const duration = baseBarTick + barTicks - currentActiveNote.startTick;
//           if (duration > 0) {
//             noteEvents.push({
//               type: 'note',
//               pitch: currentActiveNote.pitch,
//               velocity: currentActiveNote.velocity,
//               startTick: currentActiveNote.startTick,
//               durationTicks: duration,
//             });
//           }
//           activeNotes.delete(noteId);
//         }
//       });
//     });

//     const finalBarTick = bars.length * barTicks;
//     for (const [noteId, noteStart] of activeNotes.entries()) {
//       const duration = finalBarTick - noteStart.startTick;
//       if (duration > 0) {
//         noteEvents.push({
//           type: 'note',
//           pitch: noteStart.pitch,
//           velocity: noteStart.velocity,
//           startTick: noteStart.startTick,
//           durationTicks: duration,
//         });
//       }
//     }

//     const midiEvents = [];
//     noteEvents.forEach(event => {
//       midiEvents.push({
//         tick: event.startTick,
//         type: 'on',
//         pitch: event.pitch,
//         velocity: event.velocity
//       });
//       midiEvents.push({
//         tick: event.startTick + event.durationTicks,
//         type: 'off',
//         pitch: event.pitch,
//         velocity: 0
//       });
//     });

//     midiEvents.sort((a, b) => {
//       if (a.tick !== b.tick) return a.tick - b.tick;

//       if (a.type === 'off' && b.type === 'on') return -1;
//       if (a.type === 'on' && b.type === 'off') return 1;

//       if (a.pitch !== b.pitch) return a.pitch - b.pitch;

//       return 0;
//     });

//     return midiEvents;
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
//       if (buffer & 0x80) {
//         buffer >>= 8;
//       } else {
//         break;
//       }
//     }
    
//     return bytes;
//   }

//   static generateMidiBytes(events, metadata) {
//     const data = [];
    
//     const writeBytes = (bytes) => bytes.forEach(b => data.push(b & 0xFF));
//     const writeInt = (value, numBytes) => {
//       for (let i = numBytes - 1; i >= 0; i--) {
//         data.push((value >> (8 * i)) & 0xFF);
//       }
//     };

//     writeBytes([0x4D, 0x54, 0x68, 0x64]);
//     writeInt(6, 4);
//     writeInt(0, 2);
//     writeInt(1, 2);
//     writeInt(480, 2);

//     const trackData = [];
    
//     const tempoDeltaTime = this.writeVariableLength(0);
//     trackData.push(...tempoDeltaTime);
//     trackData.push(0xFF, 0x51, 0x03);
    
//     const microsecondsPerQuarter = Math.round(60000000 / metadata.tempo);
//     trackData.push((microsecondsPerQuarter >> 16) & 0xFF);
//     trackData.push((microsecondsPerQuarter >> 8) & 0xFF);
//     trackData.push(microsecondsPerQuarter & 0xFF);
    
//     const timeSigDeltaTime = this.writeVariableLength(0);
//     trackData.push(...timeSigDeltaTime);
//     trackData.push(0xFF, 0x58, 0x04);
//     trackData.push(metadata.timeSig.numerator || 4);
//     trackData.push(Math.log2(metadata.timeSig.denominator || 4));
//     trackData.push(24);
//     trackData.push(8);

//     const programDeltaTime = this.writeVariableLength(0);
//     trackData.push(...programDeltaTime);
//     trackData.push(0xC0, 0x00);

//     let lastTick = 0;
//     events.forEach(event => {
//       const deltaTime = Math.max(0, Math.round(event.tick - lastTick));
//       const deltaBytes = this.writeVariableLength(deltaTime);
//       trackData.push(...deltaBytes);
      
//       if (event.type === 'on') {
//         trackData.push(0x90, event.pitch & 0x7F, event.velocity & 0x7F);
//       } else {
//         trackData.push(0x80, event.pitch & 0x7F, 0x40);
//       }
//       lastTick += deltaTime;
//     });

//     const endBytes = this.writeVariableLength(0);
//     trackData.push(...endBytes);
//     trackData.push(0xFF, 0x2F, 0x00);

//     writeBytes([0x4D, 0x54, 0x72, 0x6B]);
//     writeInt(trackData.length, 4);
//     writeBytes(trackData);

//     return new Uint8Array(data);
//   }

//   static convertPitchToMidi(pitch, transposition = 0) {
//     const match = pitch.match(/^([A-G][#Bb]?)(-?\d+)$/i);
//     if (!match) throw new Error(`Invalid pitch format: ${pitch}`);
//     const [, noteName, octave] = match;
//     const noteNameUpper = noteName.toUpperCase();
//     const octaveValue = parseInt(octave);
//     if (!(noteNameUpper in noteMap)) {
//       throw new Error(`Unknown note name: ${noteNameUpper}`);
//     }
//     const noteValue = noteMap[noteNameUpper];
//     return (octaveValue + 1) * 12 + noteValue + transposition;
//   }
// }

// const TextMidiConverter = () => {
//   const [input, setInput] = useState(`Tempo: 120
// TimeSig: 4/4

// Bar: 1
// C4:   X . . .   . . . .   . . . .   . . . .
// E4:   . . . .   X . . .   . . . .   . . . .
// G4:   . . . .   . . . .   X . . .   . . . .
// C5:   . . . .   . . . .   . . . .   X . . .`);
  
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errors, setErrors] = useState([]);

//   const validateSubdivisions = (inputText) => {
//     const errors = [];
//     const lines = inputText.trim().split('\n');
    
//     const timeSigLine = lines.find(line => line.toLowerCase().startsWith('timesig:'));
//     if (!timeSigLine) {
//       errors.push('Missing TimeSig definition');
//       return errors;
//     }
    
//     const timeSigMatch = timeSigLine.match(/TimeSig:\s*(\d+)\/(\d+)/i);
//     if (!timeSigMatch) {
//       errors.push('Invalid TimeSig format. Use format like: TimeSig: 4/4');
//       return errors;
//     }
    
//     const numerator = parseInt(timeSigMatch[1]);
//     const denominator = parseInt(timeSigMatch[2]);
    
//     if (![4, 8].includes(denominator)) {
//       errors.push(`Unsupported denominator: ${denominator}. Only 4 or 8 supported.`);
//       return errors;
//     }
//     const expectedSubdivisions = numerator * (16 / denominator);
//     if (!Number.isInteger(expectedSubdivisions)) {
//       errors.push(`Invalid time signature: ${numerator}/${denominator} results in non-integer subdivisions.`);
//       return errors;
//     }
    
//     let currentBar = null;
//     let currentBarPitches = new Map();
    
//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i].trim();
      
//       if (line.startsWith('Bar:')) {
//         if (currentBar !== null) {
//           checkBarSubdivisions(currentBar, currentBarPitches, expectedSubdivisions, errors);
//         }
        
//         const barMatch = line.match(/Bar:\s*(\d+)/);
//         currentBar = barMatch ? parseInt(barMatch[1]) : null;
//         currentBarPitches = new Map();
//         continue;
//       }
      
//       if (currentBar !== null && line.match(/^[A-G][#b]?\d:/i)) {
//         const [pitch, ...patterns] = line.split(':');
//         const pattern = patterns.join(':').trim();
//         const subdivisions = pattern.split(/\s+/).filter(s => s.length > 0);
        
//         currentBarPitches.set(pitch.trim(), subdivisions.length);
//       }
//     }
    
//     if (currentBar !== null) {
//       checkBarSubdivisions(currentBar, currentBarPitches, expectedSubdivisions, errors);
//     }
    
//     return errors;
//   };
  
//   const checkBarSubdivisions = (barNumber, pitches, expected, errors) => {
//     for (const [pitch, count] of pitches.entries()) {
//       if (count !== expected) {
//         errors.push(`Bar ${barNumber} ${pitch}: Expected ${expected} subdivisions, got ${count}`);
//       }
//     }
//   };

//   const handleConvert = async () => {
//     try {
//       setIsProcessing(true);
//       setErrors([]);
      
//       const validationErrors = validateSubdivisions(input);
//       if (validationErrors.length > 0) {
//         setErrors(validationErrors);
//         setIsProcessing(false);
//         return;
//       }
      
//       const parsed = TextToMidiConverterEngine.parseTextToMidi(input);
      
//       if (parsed.errors.length > 0) {
//         setErrors(parsed.errors);
//         setIsProcessing(false);
//         return;
//       }
      
//       const events = TextToMidiConverterEngine.convertToMidiEvents(parsed);
//       const midiBytes = TextToMidiConverterEngine.generateMidiBytes(events, parsed.metadata);
      
//       const blob = new Blob([midiBytes], { type: 'audio/midi' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       a.download = 'converted.mid';
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       console.error('Conversion error:', error);
//       setErrors([error.message || 'Conversion failed']);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col p-4 md:p-6">
//       <div className="text-center mb-6 md:mb-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
//         <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
//           Text → MIDI Converter
//         </h1>
//         <p className="mt-2 md:mt-3 text-gray-400 text-sm md:text-lg">
//           Turn advanced notation into playable MIDI
//         </p>
//       </div>

//       <main className="flex flex-col lg:flex-row flex-1 overflow-hidden mt-0 gap-4 md:gap-6">
//         <section className="flex-1 overflow-y-auto">
//           <div className="bg-black/50 backdrop-blur-2xl rounded-2xl p-4 md:p-6 border border-slate-700 shadow-xl h-full flex flex-col">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center mb-3 md:mb-5">
//                 <FileText className="w-5 h-5 md:w-6 md:h-6 mr-2 text-purple-400" />
//                 Advanced Notation
//               </h2>
//             </div>

//             <textarea
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder={`Tempo: 120\nTimeSig: 4/4\nKey: C\n\nBar: 1\nC4: X . . .   . . . .   . . . .   . . . .`}
//               className="w-full flex-1 h-64 md:h-[75vh] bg-slate-950/70 border border-slate-700 rounded-xl p-4 md:p-6 text-gray-100 font-mono resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-inner tracking-wide text-sm md:text-lg"
//               spellCheck={false}
//             />

//             <div className="flex gap-3 mt-4 md:mt-6">
//               <button
//                 onClick={handleConvert}
//                 disabled={isProcessing}
//                 className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
//               >
//                 {isProcessing ? (
//                   <>
//                     <svg
//                       className="animate-spin w-4 h-4 md:w-5 md:h-5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <Activity className="w-4 h-4 md:w-5 md:h-5" />
//                     Convert to MIDI
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </section>

//         <aside className="w-full lg:w-80 p-4 md:p-6 overflow-y-auto bg-black/30 border border-slate-800 backdrop-blur-2xl rounded-2xl shadow-xl mt-4 lg:mt-0">
//           <div className="bg-slate-900/70 rounded-xl p-4 md:p-6 border border-slate-700">
//             <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-3 md:mb-4 flex items-center">
//               <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
//               Status
//             </h3>

//             {errors.length > 0 && (
//               <div className="mb-4">
//                 <h4 className="font-semibold text-red-400 mb-2 flex items-center text-sm md:text-base">
//                   <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
//                   Errors:
//                 </h4>
//                 <ul className="text-red-300 text-xs md:text-sm space-y-1">
//                   {errors.map((error, i) => (
//                     <li key={i}>• {error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {!errors.length && (
//               <p className="text-gray-400 text-xs md:text-sm">
//                 Enter notation and click{" "}
//                 <span className="text-cyan-400">"Convert to MIDI"</span> to begin.
//               </p>
//             )}
//           </div>
//         </aside>
//       </main>
//     </div>
//   );
// };

// export default TextMidiConverter;














import React, { useState } from 'react';
import { Activity, AlertTriangle, FileText } from 'lucide-react';

const noteMap = {
  'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
  'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8,
  'A': 9, 'A#': 10, 'BB': 10, 'B': 11
};

class TextToMidiConverterEngine {
  static calculateSubdivisions(timeSig) {
    const numerator = timeSig.numerator;
    const denominator = timeSig.denominator;
    const subdivisions = numerator * (16 / denominator);
    if (!Number.isInteger(subdivisions)) {
      throw new Error(`Invalid time signature: ${numerator}/${denominator} results in non-integer subdivisions.`);
    }
    return subdivisions;
  }

  static expandCompression(symbols) {
    const expanded = [];
    
    for (const symbol of symbols) {
      const compressionMatch = symbol.match(/^(.+?)\((\d+)\)$/);
      
      if (compressionMatch) {
        const baseSymbol = compressionMatch[1];
        const count = parseInt(compressionMatch[2]);
        
        for (let i = 0; i < count; i++) {
          expanded.push(baseSymbol);
        }
      } else {
        expanded.push(symbol);
      }
    }
    
    return expanded;
  }

  static validateMidiPitch(pitch, transposition) {
    const midiNote = this.convertPitchToMidi(pitch, transposition);
    if (midiNote < 0 || midiNote > 127) {
      throw new Error(`Pitch ${pitch} with transposition ${transposition} results in MIDI note ${midiNote}, which is out of range (0-127)`);
    }
    return midiNote;
  }

  static validateVelocity(velocity) {
    const val = Math.max(1, Math.min(127, Math.round(velocity)));
    return val;
  }

  static parseNoteSymbol(symbol, defaultVelocity = 100) {
    let velocity = defaultVelocity;
    let timingOffset = 0;
    let durationPercent = null;
    let restOffset = null;
    let restDuration = null;
    let isNoteOn = false;
    let isSustain = false;
    let isRest = false;
    let sustainCutoff = null;

    const originalSymbol = symbol;
    symbol = symbol.toUpperCase();

    if (originalSymbol === '.') {
      return { 
        isNoteOn: false, 
        velocity, 
        timingOffset: 0, 
        durationPercent: null,
        restOffset: null,
        restDuration: null,
        isSustain: false, 
        isRest: true,
        sustainCutoff: null
      };
    }

    const sustainMatch = symbol.match(/^~(\d+)?$/);
    if (sustainMatch) {
      isSustain = true;
      if (sustainMatch[1]) {
        sustainCutoff = parseInt(sustainMatch[1]);
        if(sustainCutoff < 0){
          sustainCutoff = 0;
        }
        if(sustainCutoff > 100){
          sustainCutoff = 100;
        }
      }
      return { 
        isNoteOn: false, 
        velocity, 
        timingOffset: 0, 
        durationPercent: null,
        restOffset: null,
        restDuration: null,
        isSustain: true, 
        isRest: false,
        sustainCutoff
      };
    }

    const positionedRestMatch = symbol.match(/^XO(\d+)XE(\d+)$/);
    if (positionedRestMatch) {
      restOffset = parseInt(positionedRestMatch[1]);
      restDuration = parseInt(positionedRestMatch[2]);
      
      if (restOffset < 0) {
        restOffset = 0;
      }
      if (restOffset > 100) {
        restOffset = 100;
      }
      if (restDuration < 0) {
        restDuration = 0;
      }
      if (restDuration > 100) {
        restDuration = 100;
      }
      if (restOffset + restDuration > 100) {
        restDuration = 100 - restOffset;
      }

      return { 
        isNoteOn: true,
        velocity: 100,
        timingOffset: restOffset, 
        durationPercent: restDuration,
        restOffset,
        restDuration,
        isSustain: false, 
        isRest: false,
        sustainCutoff: null
      };
    }

    if (symbol.startsWith('X')) {
      isNoteOn = true;
      
      const velocityMatch = symbol.match(/^X(\d+)/);
      if (velocityMatch) {
        velocity = parseInt(velocityMatch[1]);
        if(velocity > 127){
          velocity = 127;
        }
        if (velocity < 1) {
          velocity = 1;
        }
        symbol = symbol.replace(/^X\d+/, '');
      } else {
        symbol = symbol.replace(/^X/, '');
      }

      const rightOffsetMatch = symbol.match(/XR(\d+)/);
      if (rightOffsetMatch) {
        timingOffset = parseInt(rightOffsetMatch[1]);
        if(timingOffset > 100){
          timingOffset = 100;
        }
        if(timingOffset < 0){
          timingOffset = 0;
        }
        symbol = symbol.replace(/XR\d+/, '');
      }

      const leftOffsetMatch = symbol.match(/XL(\d+)/);
      if (leftOffsetMatch) {
        let leftVal = parseInt(leftOffsetMatch[1]);
        if(leftVal > 100){
          leftVal = 100;
        }
        if(leftVal < 0){
          leftVal = 0;
        }
        timingOffset = -leftVal;
        symbol = symbol.replace(/XL\d+/, '');
      }

      const durationMatch = symbol.match(/E(\d+)/) || symbol.match(/^(\d+)$/);
      if (durationMatch) {
        durationPercent = parseInt(durationMatch[1]);
        if (durationPercent < 0) {
          durationPercent = 0;
        }
        if (durationPercent > 100) {
          durationPercent = 100;
        }
        symbol = symbol.replace(/E?\d+/, '');
      }
    }

    return { 
      isNoteOn,
      velocity: this.validateVelocity(velocity), 
      timingOffset,
      durationPercent,
      restOffset,
      restDuration,
      isSustain: false, 
      isRest: false,
      sustainCutoff: null
    };
  }

  static parseCompoundSymbol(symbol) {
    const parts = [];
    
    const shortNoteMatches = [...symbol.matchAll(/X(\d+)?E(\d+)/gi)];
    if (shortNoteMatches.length > 1) {
      let totalPercent = 0;
      let currentStart = 0;
      
      for (const match of shortNoteMatches) {
        const vel = match[1] ? parseInt(match[1]) : 100;
        let duration = parseInt(match[2]);
        
        if(duration > 100){
          duration = 100;
        }
        if(duration < 0){
          duration = 0;
        }
        
        totalPercent += duration;
        
        if (totalPercent > 100) {
          duration = 100 - currentStart;
          if(duration < 0) duration = 0;
        }

        parts.push({
          isNoteOn: true,
          velocity: this.validateVelocity(vel),
          timingOffset: currentStart,
          durationPercent: duration,
          restOffset: null,
          restDuration: null,
          isSustain: false,
          isRest: false,
          sustainCutoff: null
        });
        
        currentStart += duration;
        if(currentStart >= 100) break;
      }
      
      return parts;
    }

    const complexRestMatch = symbol.match(/^((?:XO\d+XE\d+|XE\d+)+)$/);
    if (complexRestMatch) {
      const segments = [...symbol.matchAll(/(XO\d+XE\d+|XE\d+)/g)];
      let currentPos = 0;
      
      for (const segment of segments) {
        const segmentStr = segment[0];
        
        if (segmentStr.startsWith('XO')) {
          const posMatch = segmentStr.match(/^XO(\d+)XE(\d+)$/);
          if (posMatch) {
            let restOffset = parseInt(posMatch[1]);
            let noteDuration = parseInt(posMatch[2]);
            
            if(restOffset > 100) restOffset = 100;
            if(restOffset < 0) restOffset = 0;
            if(noteDuration > 100) noteDuration = 100;
            if(noteDuration < 0) noteDuration = 0;
            
            if(restOffset + noteDuration > 100){
              noteDuration = 100 - restOffset;
              if(noteDuration < 0) noteDuration = 0;
            }
            
            parts.push({
              isNoteOn: true,
              velocity: 100,
              timingOffset: restOffset,
              durationPercent: noteDuration,
              restOffset,
              restDuration: noteDuration,
              isSustain: false,
              isRest: false,
              sustainCutoff: null
            });
            currentPos += restOffset + noteDuration;
          }
        } else if (segmentStr.startsWith('XE')) {
          const durationMatch = segmentStr.match(/^XE(\d+)$/);
          if (durationMatch) {
            let duration = parseInt(durationMatch[1]);
            
            if(duration > 100) duration = 100;
            if(duration < 0) duration = 0;
            
            if(currentPos + duration > 100){
              duration = 100 - currentPos;
              if(duration < 0) duration = 0;
            }
            
            parts.push({
              isNoteOn: true,
              velocity: 100,
              timingOffset: currentPos,
              durationPercent: duration,
              restOffset: null,
              restDuration: null,
              isSustain: false,
              isRest: false,
              sustainCutoff: null
            });
            
            currentPos += duration;
          }
        }
        
        if(currentPos >= 100) break;
      }
      
      return parts;
    }

    return [this.parseNoteSymbol(symbol)];
  }

  static parseTextToMidi(text) {
    const lines = text.trim().split('\n');
    let tempo = 120;
    let timeSig = { numerator: 4, denominator: 4 };
    let key = 'C';
    const bars = [];
    let currentBar = null;
    const errors = [];
    let transposition = 0;

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      if (line.startsWith('Tempo:')) {
        const match = line.match(/Tempo:\s*(\d+)/);
        if (match) tempo = parseInt(match[1]);
      } else if (line.startsWith('TimeSig:')) {
        const match = line.match(/TimeSig:\s*(\d+)\/(\d+)/);
        if (match) {
          timeSig.numerator = parseInt(match[1]);
          timeSig.denominator = parseInt(match[2]);
        }
      } else if (line.startsWith('Key:')) {
        const match = line.match(/Key:\s*([A-G][#b]?[m]?)/i);
        if (match) {
          key = match[1].toUpperCase();
          if (!/^[A-G][#B]?M?$/.test(key)) {
            key = 'C';
          }
        }
      } else if (line.startsWith('Bar:')) {
        const match = line.match(/Bar:\s*(\d+)/);
        if (match) {
          currentBar = { number: parseInt(match[1]), pitches: new Map() };
          bars.push(currentBar);
        }
      } else if (currentBar && line.match(/^[A-G][#b]?-?\d+:/i)) {
        const [pitch, patternStr] = line.split(':');
        const symbols = patternStr.trim().split(/\s+/).filter(s => s);
        const expanded = this.expandCompression(symbols);
        currentBar.pitches.set(pitch.trim(), expanded);
      }
    });

    const metadata = { tempo, timeSig, key };

    return { bars, metadata, errors, transposition };
  }

  static convertToMidiEvents(parsed) {
    const { bars, metadata, transposition } = parsed;
    const timeSig = metadata.timeSig;
    const ticksPerQuarter = 480;
    const subdivisionsPerBar = this.calculateSubdivisions(timeSig);
    const barTicks = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
    const ticksPerSubdivision = barTicks / subdivisionsPerBar;

    const noteEvents = [];
    const activeNotes = new Map();

    bars.forEach(bar => {
      const barNum = bar.number;
      const baseBarTick = (barNum - 1) * barTicks;

      bar.pitches.forEach((patterns, pitch) => {
        let currentActiveNote = null;
        const noteId = `${barNum}-${pitch}`;

        patterns.forEach((symbol, subIndex) => {
          const parsedSymbols = this.parseCompoundSymbol(symbol);
          parsedSymbols.forEach(parsedSymbol => {
            try {
              const baseTick = baseBarTick + subIndex * ticksPerSubdivision;
              const offsetTicks = (parsedSymbol.timingOffset / 100) * ticksPerSubdivision;
              const actualTick = baseTick + offsetTicks;
              const midiPitch = this.validateMidiPitch(pitch, transposition);

              if (parsedSymbol.isNoteOn) {
                if (currentActiveNote) {
                  const duration = actualTick - currentActiveNote.startTick;
                  if (duration > 0) {
                    noteEvents.push({
                      type: 'note',
                      pitch: currentActiveNote.pitch,
                      velocity: currentActiveNote.velocity,
                      startTick: currentActiveNote.startTick,
                      durationTicks: duration,
                    });
                  }
                  activeNotes.delete(noteId);
                  currentActiveNote = null;
                }

                currentActiveNote = {
                  startTick: actualTick,
                  pitch: midiPitch,
                  velocity: parsedSymbol.velocity,
                  pitchName: pitch
                };
                activeNotes.set(noteId, currentActiveNote);

                if (parsedSymbol.durationPercent !== null) {
                  const durationTicks = (parsedSymbol.durationPercent / 100) * ticksPerSubdivision;
                  const endTick = actualTick + durationTicks;
                  
                  noteEvents.push({
                    type: 'note',
                    pitch: midiPitch,
                    velocity: parsedSymbol.velocity,
                    startTick: actualTick,
                    durationTicks: durationTicks,
                  });
                  
                  activeNotes.delete(noteId);
                  currentActiveNote = null;
                }

              } else if (parsedSymbol.isSustain) {
                if (currentActiveNote) {
                  if (parsedSymbol.sustainCutoff !== null) {
                    const cutoffTicks = (parsedSymbol.sustainCutoff / 100) * ticksPerSubdivision;
                    const endTick = baseTick + cutoffTicks;
                    const duration = endTick - currentActiveNote.startTick;
                    
                    if (duration > 0) {
                      noteEvents.push({
                        type: 'note',
                        pitch: currentActiveNote.pitch,
                        velocity: currentActiveNote.velocity,
                        startTick: currentActiveNote.startTick,
                        durationTicks: duration,
                      });
                    }
                    activeNotes.delete(noteId);
                    currentActiveNote = null;
                  }
                }

              } else if (parsedSymbol.isRest) {
                if (currentActiveNote) {
                  const duration = baseTick - currentActiveNote.startTick;
                  if (duration > 0) {
                    noteEvents.push({
                      type: 'note',
                      pitch: currentActiveNote.pitch,
                      velocity: currentActiveNote.velocity,
                      startTick: currentActiveNote.startTick,
                      durationTicks: duration,
                    });
                  }
                  activeNotes.delete(noteId);
                  currentActiveNote = null;
                }
              }
            } catch (error) {
              console.error(`Error processing symbol "${symbol}" in bar ${barNum}, ${pitch}:`, error.message);
            }
          });
        });

        if (currentActiveNote) {
          const duration = baseBarTick + barTicks - currentActiveNote.startTick;
          if (duration > 0) {
            noteEvents.push({
              type: 'note',
              pitch: currentActiveNote.pitch,
              velocity: currentActiveNote.velocity,
              startTick: currentActiveNote.startTick,
              durationTicks: duration,
            });
          }
          activeNotes.delete(noteId);
        }
      });
    });

    const finalBarTick = bars.length * barTicks;
    for (const [noteId, noteStart] of activeNotes.entries()) {
      const duration = finalBarTick - noteStart.startTick;
      if (duration > 0) {
        noteEvents.push({
          type: 'note',
          pitch: noteStart.pitch,
          velocity: noteStart.velocity,
          startTick: noteStart.startTick,
          durationTicks: duration,
        });
      }
    }

    const midiEvents = [];
    noteEvents.forEach(event => {
      midiEvents.push({
        tick: event.startTick,
        type: 'on',
        pitch: event.pitch,
        velocity: event.velocity
      });
      midiEvents.push({
        tick: event.startTick + event.durationTicks,
        type: 'off',
        pitch: event.pitch,
        velocity: 0
      });
    });

    midiEvents.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;

      if (a.type === 'off' && b.type === 'on') return -1;
      if (a.type === 'on' && b.type === 'off') return 1;

      if (a.pitch !== b.pitch) return a.pitch - b.pitch;

      return 0;
    });

    return midiEvents;
  }
  
  static writeVariableLength(value) {
    let buffer = value & 0x7F;
    const bytes = [];
    
    while ((value >>= 7) > 0) {
      buffer <<= 8;
      buffer |= (value & 0x7F) | 0x80;
    }
    
    while (true) {
      bytes.push(buffer & 0xFF);
      if (buffer & 0x80) {
        buffer >>= 8;
      } else {
        break;
      }
    }
    
    return bytes;
  }

  static generateMidiBytes(events, metadata) {
    const data = [];
    
    const writeBytes = (bytes) => bytes.forEach(b => data.push(b & 0xFF));
    const writeInt = (value, numBytes) => {
      for (let i = numBytes - 1; i >= 0; i--) {
        data.push((value >> (8 * i)) & 0xFF);
      }
    };

    writeBytes([0x4D, 0x54, 0x68, 0x64]);
    writeInt(6, 4);
    writeInt(0, 2);
    writeInt(1, 2);
    writeInt(480, 2);

    const trackData = [];
    
    const tempoDeltaTime = this.writeVariableLength(0);
    trackData.push(...tempoDeltaTime);
    trackData.push(0xFF, 0x51, 0x03);
    
    const microsecondsPerQuarter = Math.round(60000000 / metadata.tempo);
    trackData.push((microsecondsPerQuarter >> 16) & 0xFF);
    trackData.push((microsecondsPerQuarter >> 8) & 0xFF);
    trackData.push(microsecondsPerQuarter & 0xFF);
    
    const timeSigDeltaTime = this.writeVariableLength(0);
    trackData.push(...timeSigDeltaTime);
    trackData.push(0xFF, 0x58, 0x04);
    trackData.push(metadata.timeSig.numerator || 4);
    trackData.push(Math.log2(metadata.timeSig.denominator || 4));
    trackData.push(24);
    trackData.push(8);

    const programDeltaTime = this.writeVariableLength(0);
    trackData.push(...programDeltaTime);
    trackData.push(0xC0, 0x00);

    let lastTick = 0;
    events.forEach(event => {
      const deltaTime = Math.max(0, Math.round(event.tick - lastTick));
      const deltaBytes = this.writeVariableLength(deltaTime);
      trackData.push(...deltaBytes);
      
      if (event.type === 'on') {
        trackData.push(0x90, event.pitch & 0x7F, event.velocity & 0x7F);
      } else {
        trackData.push(0x80, event.pitch & 0x7F, 0x40);
      }
      lastTick += deltaTime;
    });

    const endBytes = this.writeVariableLength(0);
    trackData.push(...endBytes);
    trackData.push(0xFF, 0x2F, 0x00);

    writeBytes([0x4D, 0x54, 0x72, 0x6B]);
    writeInt(trackData.length, 4);
    writeBytes(trackData);

    return new Uint8Array(data);
  }

  static convertPitchToMidi(pitch, transposition = 0) {
    const match = pitch.match(/^([A-G][#Bb]?)(-?\d+)$/i);
    if (!match) throw new Error(`Invalid pitch format: ${pitch}`);
    const [, noteName, octave] = match;
    const noteNameUpper = noteName.toUpperCase();
    const octaveValue = parseInt(octave);
    if (!(noteNameUpper in noteMap)) {
      throw new Error(`Unknown note name: ${noteNameUpper}`);
    }
    const noteValue = noteMap[noteNameUpper];
    return (octaveValue + 1) * 12 + noteValue + transposition;
  }
}

const TextMidiConverter = () => {
  const [input, setInput] = useState(`Tempo: 120
TimeSig: 4/4
Key: C

Bar: 1
C4: X .(3) X50 .(3) X80 .(2) X .(3)
E4: .(4) X .(11)
G4: .(8) X80 ~(7)
C5: .(12) X .(3)`);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);

  const validateSubdivisions = (inputText) => {
    const errors = [];
    const lines = inputText.trim().split('\n');
    
    const timeSigLine = lines.find(line => line.toLowerCase().startsWith('timesig:'));
    if (!timeSigLine) {
      errors.push('Missing TimeSig definition');
      return errors;
    }
    
    const timeSigMatch = timeSigLine.match(/TimeSig:\s*(\d+)\/(\d+)/i);
    if (!timeSigMatch) {
      errors.push('Invalid TimeSig format. Use format like: TimeSig: 4/4');
      return errors;
    }
    
    const numerator = parseInt(timeSigMatch[1]);
    const denominator = parseInt(timeSigMatch[2]);
    
    if (![4, 8].includes(denominator)) {
      errors.push(`Unsupported denominator: ${denominator}. Only 4 or 8 supported.`);
      return errors;
    }
    const expectedSubdivisions = numerator * (16 / denominator);
    if (!Number.isInteger(expectedSubdivisions)) {
      errors.push(`Invalid time signature: ${numerator}/${denominator} results in non-integer subdivisions.`);
      return errors;
    }
    
    let currentBar = null;
    let currentBarPitches = new Map();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('Bar:')) {
        if (currentBar !== null) {
          checkBarSubdivisions(currentBar, currentBarPitches, expectedSubdivisions, errors);
        }
        
        const barMatch = line.match(/Bar:\s*(\d+)/);
        currentBar = barMatch ? parseInt(barMatch[1]) : null;
        currentBarPitches = new Map();
        continue;
      }
      
      if (currentBar !== null && line.match(/^[A-G][#b]?-?\d+:/i)) {
        const [pitch, ...patterns] = line.split(':');
        const pattern = patterns.join(':').trim();
        const symbols = pattern.split(/\s+/).filter(s => s.length > 0);
        
        const expanded = TextToMidiConverterEngine.expandCompression(symbols);
        
        currentBarPitches.set(pitch.trim(), expanded.length);
      }
    }
    
    if (currentBar !== null) {
      checkBarSubdivisions(currentBar, currentBarPitches, expectedSubdivisions, errors);
    }
    
    return errors;
  };
  
  const checkBarSubdivisions = (barNumber, pitches, expected, errors) => {
    for (const [pitch, count] of pitches.entries()) {
      if (count !== expected) {
        errors.push(`Bar ${barNumber} ${pitch}: Expected ${expected} subdivisions when expanded, got ${count}`);
      }
    }
  };

  const handleConvert = async () => {
    try {
      setIsProcessing(true);
      setErrors([]);
      
      const validationErrors = validateSubdivisions(input);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsProcessing(false);
        return;
      }
      
      const parsed = TextToMidiConverterEngine.parseTextToMidi(input);
      
      if (parsed.errors.length > 0) {
        setErrors(parsed.errors);
        setIsProcessing(false);
        return;
      }
      
      const events = TextToMidiConverterEngine.convertToMidiEvents(parsed);
      const midiBytes = TextToMidiConverterEngine.generateMidiBytes(events, parsed.metadata);
      
      const blob = new Blob([midiBytes], { type: 'audio/midi' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'converted.mid';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Conversion error:', error);
      setErrors([error.message || 'Conversion failed']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col p-4 md:p-6">
      <div className="text-center mb-6 md:mb-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
        <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
          Text → MIDI Converter
        </h1>
        <p className="mt-2 md:mt-3 text-gray-400 text-sm md:text-lg">
          Turn compressed notation into playable MIDI
        </p>
      </div>

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden mt-0 gap-4 md:gap-6">
        <section className="flex-1 overflow-y-auto">
          <div className="bg-black/50 backdrop-blur-2xl rounded-2xl p-4 md:p-6 border border-slate-700 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center mb-3 md:mb-5">
                <FileText className="w-5 h-5 md:w-6 md:h-6 mr-2 text-purple-400" />
                Compressed Notation
              </h2>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Tempo: 120\nTimeSig: 4/4\nKey: C\n\nBar: 1\nC4: X .(15)\nE4: .(4) X .(11)`}
              className="w-full flex-1 h-64 md:h-[75vh] bg-slate-950/70 border border-slate-700 rounded-xl p-4 md:p-6 text-gray-100 font-mono resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-inner tracking-wide text-sm md:text-lg"
              spellCheck={false}
            />

            <div className="flex gap-3 mt-4 md:mt-6">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 md:w-5 md:h-5" />
                    Convert to MIDI
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-80 p-4 md:p-6 overflow-y-auto bg-black/30 border border-slate-800 backdrop-blur-2xl rounded-2xl shadow-xl mt-4 lg:mt-0">
          <div className="bg-slate-900/70 rounded-xl p-4 md:p-6 border border-slate-700">
            <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-3 md:mb-4 flex items-center">
              <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Status
            </h3>

            {errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center text-sm md:text-base">
                  <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Errors:
                </h4>
                <ul className="text-red-300 text-xs md:text-sm space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {!errors.length && (
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-4">
                  Enter compressed notation and click{" "}
                  <span className="text-cyan-400">"Convert to MIDI"</span> to begin.
                </p>
                {/* <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                  <h4 className="text-xs font-semibold text-purple-300 mb-2">Compression Examples:</h4>
                  <div className="text-xs text-gray-300 space-y-1 font-mono">
                    <div>.(4) = 4 rests</div>
                    <div>~(8) = 8 sustains</div>
                    <div>X(3) = 3 note-ons</div>
                    <div>X60(5) = 5 notes @ vel 60</div>
                  </div>
                </div> */}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default TextMidiConverter;



