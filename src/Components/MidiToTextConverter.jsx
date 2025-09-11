import React, { useState, useRef } from 'react';
import { Upload, Copy, Music, FileText, Activity, AlertTriangle, Info } from 'lucide-react';

const MidiToTextConverter = () => {
  const [midiFile, setMidiFile] = useState(null);
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Note mapping with proper enharmonic equivalents
  const noteMap = {
    'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
    'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8,
    'A': 9, 'A#': 10, 'BB': 10, 'B': 11
  };

  // Reverse note mapping for MIDI to note conversion (defaults to sharps)
  const midiToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Convert MIDI number to pitch
  const convertMidiToPitch = (midiNumber, keyTransposition = 0) => {
    const adjustedMidi = midiNumber - keyTransposition;
    const octave = Math.floor(adjustedMidi / 12) - 1;
    const noteIndex = adjustedMidi % 12;
    return midiToNote[noteIndex] + octave;
  };

  // Parse MIDI file and convert to Text notation
  const parseMidiFile = (arrayBuffer) => {
    const data = new Uint8Array(arrayBuffer);
    let offset = 0;

    // Read MIDI header
    const headerChunk = data.slice(0, 14);
    if (String.fromCharCode(...headerChunk.slice(0, 4)) !== 'MThd') {
      throw new Error('Invalid MIDI file format');
    }

    const format = (headerChunk[8] << 8) | headerChunk[9];
    const trackCount = (headerChunk[10] << 8) | headerChunk[11];
    const ticksPerQuarter = (headerChunk[12] << 8) | headerChunk[13];

    offset = 14;

    // Parse tracks
    const events = [];
    let tempo = 120; // Default tempo
    let timeSig = { numerator: 4, denominator: 4 };

    for (let track = 0; track < trackCount; track++) {
      // Read track header
      const trackHeader = data.slice(offset, offset + 8);
      if (String.fromCharCode(...trackHeader.slice(0, 4)) !== 'MTrk') {
        throw new Error('Invalid track header');
      }

      const trackLength = (trackHeader[4] << 24) | (trackHeader[5] << 16) | (trackHeader[6] << 8) | trackHeader[7];
      offset += 8;

      const trackData = data.slice(offset, offset + trackLength);
      let trackOffset = 0;
      let currentTick = 0;
      let runningStatus = 0;

      // Parse track events
      while (trackOffset < trackLength) {
        // Read variable-length delta time
        let deltaTime = 0;
        let byte;
        do {
          byte = trackData[trackOffset++];
          deltaTime = (deltaTime << 7) | (byte & 0x7F);
        } while (byte & 0x80);

        currentTick += deltaTime;

        let statusByte = trackData[trackOffset];
        
        // Handle running status
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
          
          // Read variable length for meta event length
          do {
            lengthByte = trackData[trackOffset++];
            metaLength = (metaLength << 7) | (lengthByte & 0x7F);
          } while (lengthByte & 0x80);

          if (metaType === 0x51 && metaLength === 3) {
            // Set Tempo
            const microsecondsPerQuarter = (trackData[trackOffset] << 16) | 
                                         (trackData[trackOffset + 1] << 8) | 
                                         trackData[trackOffset + 2];
            tempo = Math.round(60000000 / microsecondsPerQuarter);
          } else if (metaType === 0x58 && metaLength >= 4) {
            // Time Signature
            timeSig.numerator = trackData[trackOffset];
            timeSig.denominator = Math.pow(2, trackData[trackOffset + 1]);
          }

          trackOffset += metaLength;
          runningStatus = 0; // Clear running status after meta event
        } else if ((statusByte & 0xF0) === 0x90) {
          // Note On
          const pitch = trackData[trackOffset++];
          const velocity = trackData[trackOffset++];
          
          if (velocity > 0) {
            events.push({
              tick: currentTick,
              type: 'on',
              pitch: pitch,
              velocity: velocity
            });
          } else {
            events.push({
              tick: currentTick,
              type: 'off',
              pitch: pitch,
              velocity: 0
            });
          }
        } else if ((statusByte & 0xF0) === 0x80) {
          // Note Off
          const pitch = trackData[trackOffset++];
          const velocity = trackData[trackOffset++];
          
          events.push({
            tick: currentTick,
            type: 'off',
            pitch: pitch,
            velocity: 0
          });
        } else {
          // Skip other events
          if (statusByte >= 0xF0) {
            break;
          } else {
            const eventType = statusByte & 0xF0;
            if (eventType === 0xC0 || eventType === 0xD0) {
              trackOffset += 1;
            } else {
              trackOffset += 2;
            }
          }
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
  };

  // Convert MIDI events to Text notation - Enhanced version with precise timing (single symbol per cell)
  const convertMidiToText = (midiData) => {
    const { events, tempo, timeSig, ticksPerQuarter } = midiData;
    const notes = [];
    const noteOnEvents = new Map();

    events.forEach(event => {
      if (event.type === 'on') {
        if (noteOnEvents.has(event.pitch)) {
          // End previous note on same pitch (monophonic handling)
          const prev = noteOnEvents.get(event.pitch);
          const duration = event.tick - prev.tick;
          if (duration > 0) {
            notes.push({
              pitch: event.pitch,
              startTick: prev.tick,
              endTick: event.tick,
              velocity: prev.velocity,
              duration: duration
            });
          }
        }
        noteOnEvents.set(event.pitch, event);
      } else if (event.type === 'off' && noteOnEvents.has(event.pitch)) {
        const noteOn = noteOnEvents.get(event.pitch);
        const duration = event.tick - noteOn.tick;
        if (duration > 0) {
          notes.push({
            pitch: event.pitch,
            startTick: noteOn.tick,
            endTick: event.tick,
            velocity: noteOn.velocity,
            duration: duration
          });
        }
        noteOnEvents.delete(event.pitch);
      }
    });

    // Handle any remaining active notes
    if (noteOnEvents.size > 0) {
      const maxTick = events.length > 0 ? Math.max(...events.map(e => e.tick)) : 0;
      noteOnEvents.forEach((on, pitch) => {
        const duration = maxTick - on.tick;
        if (duration > 0) {
          notes.push({
            pitch,
            startTick: on.tick,
            endTick: maxTick,
            velocity: on.velocity,
            duration
          });
        }
      });
    }

    // Calculate bars and subdivisions (fixed to 16th notes)
    const subdivisionsPerBeat = 4; // 16th notes
    const subdivisionsPerBar = timeSig.numerator * subdivisionsPerBeat;
    const ticksPerBar = ticksPerQuarter * timeSig.numerator * (4 / timeSig.denominator);
    const ticksPerSubdivision = ticksPerBar / subdivisionsPerBar;

    // Determine max bar
    const maxTick = Math.max(...notes.map(n => n.endTick), 0);
    const maxBar = Math.ceil((maxTick + 1) / ticksPerBar) || 1;

    // Pitch tracks: pitch -> bar -> array of symbols
    const pitchTracks = new Map();

    notes.forEach(note => {
      const pitchName = convertMidiToPitch(note.pitch);
      if (!pitchTracks.has(pitchName)) {
        pitchTracks.set(pitchName, new Map());
      }

      // Calculate start and end subdivisions
      const startSubTotal = Math.floor(note.startTick / ticksPerSubdivision);
      const startOffsetTicks = note.startTick - startSubTotal * ticksPerSubdivision;
      const offsetPercent = Math.round((startOffsetTicks / ticksPerSubdivision) * 100);

      const endSubTotal = Math.floor((note.endTick - 0.0001) / ticksPerSubdivision);
      const endOffsetTicks = note.endTick - endSubTotal * ticksPerSubdivision;
      const endPercent = Math.round((endOffsetTicks / ticksPerSubdivision) * 100);

      // Place symbols for each subdivision covered
      for (let currentSubTotal = startSubTotal; currentSubTotal <= endSubTotal; currentSubTotal++) {
        const barNum = Math.floor(currentSubTotal / subdivisionsPerBar) + 1;
        const subInBar = currentSubTotal % subdivisionsPerBar;

        if (!pitchTracks.get(pitchName).has(barNum)) {
          pitchTracks.get(pitchName).set(barNum, new Array(subdivisionsPerBar).fill('.'));
        }

        const barPattern = pitchTracks.get(pitchName).get(barNum);
        let sym = '';

        if (currentSubTotal === startSubTotal) {
          // Start symbol
          sym = 'X';
          if (note.velocity !== 100) {
            sym += note.velocity;
          }
          if (offsetPercent > 0) {
            sym += `XR${offsetPercent}`;
          }
          if (startSubTotal === endSubTotal) {
            // Short note in single subdivision
            if (endPercent < 100) {
              sym += `E${endPercent}`;
            }
            // If 100, full sub, no E
          }
        } else {
          // Sustain symbol
          sym = '~';
          if (currentSubTotal === endSubTotal && endPercent < 100) {
            sym += endPercent;
          }
        }

        barPattern[subInBar] = sym;
      }
    });

    // Generate Text notation
    let TextOutput = `Tempo: ${tempo}\n`;
    TextOutput += `TimeSig: ${timeSig.numerator}/${timeSig.denominator}\n`;
    TextOutput += `Instrument: Piano\n`;
    TextOutput += `Legato: Off\n`;
    TextOutput += `Key: C\n\n`;

    const sortedPitches = Array.from(pitchTracks.keys()).sort((a, b) => {
      const aMidi = convertPitchToMidi(a);
      const bMidi = convertPitchToMidi(b);
      return aMidi - bMidi; // Low to high
    });

    for (let barNum = 1; barNum <= maxBar; barNum++) {
      // Generate bar header: "3 e & a 3 e & a 3 e & a" for bar 3
      const barHeader = [];
      for (let beat = 1; beat <= timeSig.numerator; beat++) {
        barHeader.push(barNum.toString(), 'e', '&', 'a');
      }
      TextOutput += `Bar: ${barHeader.join(' ')}\n`;

      sortedPitches.forEach(pitch => {
        const barData = pitchTracks.get(pitch);
        if (barData && barData.has(barNum)) {
          const pattern = barData.get(barNum);
          const formattedPattern = [];
          for (let i = 0; i < pattern.length; i += 4) {
            formattedPattern.push(pattern.slice(i, i + 4).join(' '));
          }
          TextOutput += `${pitch}:   ${formattedPattern.join('   ')}\n`;
        }
      });

      if (barNum < maxBar) {
        TextOutput += '\n';
      }
    }

    return TextOutput;
  };

  // Convert pitch to MIDI number (needed for sorting)
  const convertPitchToMidi = (pitch, transposition = 0) => {
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
  };

  const handleMidiToText = async () => {
    if (!midiFile) {
      setErrors(['Please select a MIDI file first']);
      return;
    }
    try {
      setIsProcessing(true);
      setErrors([]);
      const arrayBuffer = await midiFile.arrayBuffer();
      const midiData = parseMidiFile(arrayBuffer);
      const TextNotation = convertMidiToText(midiData);
      setOutput(TextNotation);
    } catch (error) {
      setErrors([`MIDI parsing error: ${error.message}`]);
      setOutput('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().match(/\.(mid|midi)$/)) {
      setErrors(['Please upload a MIDI file (.mid or .midi)']);
      return;
    }
    setErrors([]);
    setMidiFile(file);
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-xl">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
          MIDI to Text Converter
        </h1>
        <p className="mt-3 text-gray-400 text-lg">
          Upload your MIDI files and instantly convert them into Text notation
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 h-full">
        {/* Input Section */}
        <div className="flex flex-col h-full">
          <div className="flex-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl flex flex-col">
            <h2 className="text-2xl font-semibold text-white flex items-center mb-5">
              <FileText className="w-6 h-6 mr-2 text-purple-400" />
              MIDI File Upload
            </h2>

            <div
              className="border-2 border-dashed border-gray-600 rounded-xl p-10 text-center cursor-pointer hover:border-purple-500/60 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 flex-1 flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".mid,.midi"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-purple-500/20 rounded-full">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                {midiFile ? (
                  <>
                    <p className="font-medium text-white">{midiFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {Math.round(midiFile.size / 1024)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300">Drag & drop a MIDI file here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                    <p className="text-xs text-gray-500">
                      Supported formats: .mid, .midi
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleMidiToText}
                disabled={isProcessing || !midiFile}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
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
                    <Activity className="w-4 h-4" />
                    Convert to Text
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output + Status */}
        <div className="flex flex-col h-full space-y-6">
          {/* Text Output */}
          <div className="flex-1 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Music className="w-6 h-6 mr-2 text-blue-400" />
                Text Notation Output
              </h2>
              {output && (
                <button
                  onClick={copyOutput}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              )}
            </div>

            <textarea
              value={output}
              readOnly
              className="flex-1 w-full min-h-[400px] bg-black/60 border border-gray-700 rounded-lg p-6 text-gray-100 font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg leading-relaxed"
              placeholder="Upload a MIDI file and convert to see Text notation here..."
            />
          </div>

          {/* Status */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-green-500/20 shadow-xl">
            {errors.length > 0 ? (
              <div>
                <h4 className="font-semibold text-red-400 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Errors
                </h4>
                <ul className="text-red-300 text-sm space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-green-400" />
                {midiFile ? (
                  <p className="text-green-300">
                    File selected: {midiFile.name}
                  </p>
                ) : (
                  <p className="text-gray-400">
                    Upload a MIDI file to convert to Text notation
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidiToTextConverter;