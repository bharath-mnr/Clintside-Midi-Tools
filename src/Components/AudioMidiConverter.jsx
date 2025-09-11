import React, { useState } from 'react';
import { Download, Info, Music, FileText, Settings, BookOpen, AlertTriangle, Activity } from 'lucide-react';

const AudioMidiConverter = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showQuickReference, setShowQuickReference] = useState(true);
  const [midiData, setMidiData] = useState(null);
  const [errors, setErrors] = useState([]);

  const advancedTutorial = `
🎹 ADVANCED Audio → MIDI FORMAT GUIDE

=== METADATA SECTION ===
This converter supports WAV audio files for monophonic audio to MIDI conversion using the YIN pitch detection algorithm.

=== PARAMETERS ===
- w_len: Window length for analysis (default: 1024)
- w_step: Step size for analysis (default: 512)
- f0_min: Minimum frequency (default: 50 Hz)
- f0_max: Maximum frequency (default: 2000 Hz)
- harmo_thresh: Harmonicity threshold (default: 0.1)
- bpm: Tempo for MIDI (default: 120 BPM)

=== LIMITATIONS ===
- Monophonic audio only (single melody line)
- WAV format input
- Fixed velocity (100)
- Basic onset detection based on pitch changes

=== USAGE ===
Upload a WAV file and click "Convert to MIDI" to generate the MIDI file.
`;

  const pythonCode = `
import numpy as np
from scipy.signal import fftconvolve
from io import BytesIO
from scipy.io.wavfile import read

class SimpleMIDI:
    def __init__(self, tempo=120, division=480):
        self.events = []
        self.add_tempo(tempo)
        self.division = division

    def add_tempo(self, tempo):
        uspq = 60000000 // tempo
        data = [0xff, 0x51, 0x03] + list(uspq.to_bytes(3, 'big'))
        self.events.append((0, data))

    def add_note(self, pitch, vel, duration):
        on = [0x90, pitch, vel]
        off = [0x80, pitch, 0]
        self.events.append((0, on))
        self.events.append((duration, off))

    def varlen(self, value):
        bytes_list = []
        while True:
            bytes_list.append(value & 0x7f)
            value >>= 7
            if value == 0:
                break
            bytes_list[-1] |= 0x80
        bytes_list.reverse()
        return bytes_list

    def get_bytes(self):
        self.events.append((0, [0xff, 0x2f, 0x00]))
        track_data = bytearray()
        last_time = 0
        for dt, event in self.events:
            delta = dt - last_time
            track_data += bytearray(self.varlen(delta)) + bytearray(event)
            last_time = dt
        length = len(track_data)
        midi_bytes = bytearray(b'MThd') + (6).to_bytes(4, 'big') + (0).to_bytes(2, 'big') + (1).to_bytes(2, 'big') + self.division.to_bytes(2, 'big')
        midi_bytes += bytearray(b'MTrk') + length.to_bytes(4, 'big') + track_data
        return midi_bytes

def differenceFunction(x, N, tau_max):
    x = np.array(x, np.float64)
    w = x.size
    x_cumsum = np.concatenate((np.array([0]), (x * x).cumsum()))
    conv = fftconvolve(x, x[::-1])
    tmp = x_cumsum[w:0:-1] + x_cumsum[w] - x_cumsum[:w] - 2 * conv[w - 1:]
    return tmp[:tau_max]

def cumulativeMeanNormalizedDifferenceFunction(df, N):
    cmndf = df[1:] * range(1, N) / np.cumsum(df[1:]).astype(float)
    return np.insert(cmndf, 0, 1)

def getPitch(cmdf, tau_min, tau_max, harmo_th=0.1):
    tau = tau_min
    while tau < tau_max:
        if cmdf[tau] < harmo_th:
            while tau + 1 < tau_max and cmdf[tau + 1] < cmdf[tau]:
                tau += 1
            return tau
        tau += 1
    return 0

def compute_yin(sig, fs, w_len=1024, w_step=512, f0_min=50, f0_max=2000, harmo_thresh=0.1):
    tau_min = int(fs / f0_max)
    tau_max = int(fs / f0_min)
    timeScale = range(0, len(sig) - w_len, w_step)
    times = [t / float(fs) for t in timeScale]
    frames = [sig[t:t + w_len] for t in timeScale]
    pitches = [0.0] * len(timeScale)
    harmonic_rates = [0.0] * len(timeScale)
    argmins = [0.0] * len(timeScale)
    for i in range(len(frames)):
        df = differenceFunction(frames[i], w_len, tau_max)
        cmdf = cumulativeMeanNormalizedDifferenceFunction(df, tau_max)
        tau = getPitch(cmdf, tau_min, tau_max, harmo_thresh)
        if tau != 0:
            pitches[i] = fs / tau
            harmonic_rates[i] = cmdf[tau]
            argmins[i] = tau
        else:
            pitches[i] = 0
            harmonic_rates[i] = 1.0
            argmins[i] = 0
    return pitches, harmonic_rates, argmins, times

def convert_audio_to_midi(audio_bytes):
    fs, data = read(BytesIO(audio_bytes))
    if data.ndim > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float64) / np.max(np.abs(data)) if np.max(np.abs(data)) != 0 else data
    pitches, harmonic_rates, argmins, times = compute_yin(data, fs)
    bpm = 120
    division = 480
    m = SimpleMIDI(bpm, division)
    current_pitch = 0
    start_time = 0
    for i in range(len(pitches)):
        p = pitches[i]
        t = times[i]
        if p > 0 and harmonic_rates[i] < 0.85:  # Use harmonic_rate for confidence
            midi = round(12 * np.log2(p / 440) + 69)
            if midi != current_pitch:
                if current_pitch > 0:
                    dur_sec = t - start_time
                    dur_ticks = int(dur_sec * (bpm / 60) * division)
                    m.add_note(current_pitch, 100, dur_ticks)
                current_pitch = midi
                start_time = t
        else:
            if current_pitch > 0:
                dur_sec = t - start_time
                dur_ticks = int(dur_sec * (bpm / 60) * division)
                m.add_note(current_pitch, 100, dur_ticks)
                current_pitch = 0
    if current_pitch > 0:
        dur_sec = times[-1] + w_len / fs - start_time
        dur_ticks = int(dur_sec * (bpm / 60) * division)
        m.add_note(current_pitch, 100, dur_ticks)
    return m.get_bytes()
`;

  const handleConvert = async () => {
    if (!audioFile) {
      setErrors(['Please upload a WAV file.']);
      return;
    }

    setErrors([]);
    setMidiData(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;

      try {
        const loadPyodide = window.loadPyodide;
        const pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
        });

        await pyodide.loadPackage(['numpy', 'scipy']);

        const audioBytes = pyodide.toPy(new Uint8Array(arrayBuffer));
        const midiBytesPy = await pyodide.runPythonAsync(pythonCode + '\\nconvert_audio_to_midi(audioBytes)');

        const midiBytes = new Uint8Array(midiBytesPy.toJs());

        setMidiData(midiBytes);
      } catch (error) {
        console.error('Conversion error:', error);
        setErrors([`Critical error: ${error.message}`]);
      }
    };
    reader.readAsArrayBuffer(audioFile);
  };

  const handleDownload = () => {
    if (!midiData) return;

    try {
      const blob = new Blob([midiData], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audio-midi-${Date.now()}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setErrors([`Download failed: ${error.message}`]);
    }
  };

  return (
  <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col p-6">
    {/* Header */}
    <div className="text-center mb-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-xl">
      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
         Audio → MIDI Converter
      </h1>
      <p className="mt-3 text-gray-400 text-lg">
        Turn audio into playable MIDI
      </p>
    </div>

    {/* Main Content */}
    <main className="flex flex-1 overflow-hidden mt-0 gap-6">
      {/* Left - Editor */}
      <section className="flex-1 overflow-y-auto">
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700 shadow-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white flex items-center mb-5">
              <FileText className="w-6 h-6 mr-2 text-purple-400" />
              Audio Upload
            </h2>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Guide
            </button>
          </div>

          {/* File Upload */}
          <input
            type="file"
            accept=".wav"
            onChange={(e) => setAudioFile(e.target.files[0])}
            className="w-full flex-1 h-[75vh] bg-slate-950/70 border border-slate-700 rounded-xl p-6 text-gray-100 font-mono focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-inner tracking-wide text-lg"
          />

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConvert}
              className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Convert to MIDI
            </button>

            {midiData && (
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download MIDI
              </button>
            )}
          </div>

          {/* Tutorial */}
          {showTutorial && (
            <div className="mt-6 bg-slate-900/70 p-6 rounded-xl border border-slate-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Tutorial & Examples
              </h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-lg overflow-x-auto h-[40vh]">
                {advancedTutorial}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Sidebar */}
      <aside className="w-full lg:w-96 p-6 overflow-y-auto bg-black/30 border-l border-slate-800 backdrop-blur-2xl rounded-2xl shadow-xl">
        {/* Quick Reference */}
        {showQuickReference && (
          <div className="mb-6 bg-slate-900/70 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Quick Reference
              </h3>
              <button
                onClick={() => setShowQuickReference(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-pink-400 mb-2">Supported Formats:</h4>
                <ul className="space-y-1">
                  <li>• WAV audio files</li>
                  <li>• Monophonic content recommended</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Tips:</h4>
                <ul className="space-y-1">
                  <li>• Use clean recordings for better accuracy</li>
                  <li>• Adjust parameters if needed (future update)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Status
          </h3>

          {errors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-red-400 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Errors:
              </h4>
              <ul className="text-red-300 text-sm space-y-1">
                {errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {midiData && (
            <div className="space-y-2 text-sm text-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-400">MIDI Ready:</span>
                <span className="text-cyan-300">Yes</span>
              </div>
            </div>
          )}

          {!midiData && errors.length === 0 && (
            <p className="text-gray-400 text-sm">
              Upload a WAV file and click{" "}
              <span className="text-cyan-400">"Convert to MIDI"</span> to begin.
            </p>
          )}
        </div>
      </aside>
    </main>
  </div>
);
};

export default AudioMidiConverter;