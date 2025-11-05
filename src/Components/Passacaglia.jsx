import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Passacaglia = () => {
  const [activeView, setActiveView] = useState('overview');

  // Core structural analysis
  const structure = [
    { section: "EXPOSITION", bars: "1-2", theme: "Ground Bass", tension: 1, voices: 5, register: "Low-Mid" },
    { section: "VARIATION 1", bars: "3-10", theme: "Melodic Awakening", tension: 3, voices: 5, register: "Mid-High" },
    { section: "VARIATION 2", bars: "11-18", theme: "Harmonic Bloom", tension: 5, voices: 5, register: "High" },
    { section: "VARIATION 3", bars: "19-26", theme: "Octave Ascent", tension: 7, voices: 6, register: "Higher" },
    { section: "VARIATION 4", bars: "27-34", theme: "Textural Peak", tension: 8, voices: 6, register: "Highest" },
    { section: "VARIATION 5", bars: "35-42", theme: "Lower Register Return", tension: 6, voices: 5, register: "Mid" },
    { section: "VARIATION 6", bars: "43-50", theme: "Rhythmic Complexity", tension: 9, voices: 7, register: "Full Range" },
    { section: "VARIATION 7", bars: "51-58", theme: "Melodic Return", tension: 7, voices: 5, register: "Mid-High" },
    { section: "VARIATION 8", bars: "59-66", theme: "Second Bloom", tension: 8, voices: 6, register: "High" },
    { section: "RESOLUTION", bars: "67-74", theme: "Sustained Chords", tension: 4, voices: 5, register: "Full" }
  ];

  // Ground Bass analysis from lefthand.txt
  const groundBass = {
    pattern: "A→A→C→E→A (descending then ascending)",
    harmonic: "i - i - III - V - i (Am - Am - C - E - Am)",
    character: "Cyclical, hypnotic, never-ending foundation",
    bars: "Every 8 bars (repeats 9+ times)",
    intervals: [0, 0, +3, +4, +7],
    function: "Like waves on a beach - constant, eternal, grounding",
    // From lefthand.txt specific analysis
    exactPattern: "Arpeggiated broken chords - NEVER CHANGES",
    structure: "Root-Fifth-Third-Root (1-5-3-1) for each chord",
    chords: ["Am (E-A-C-E)", "Am (E-A-C-E)", "C (G-C-E-G)", "E (B-E-G#-B)", "Am (E-A-C-E)"],
    rhythm: "Two attacks per bar - subdivisions 1 and 9 (beats 1 and 3)",
    velocity: "Constant at 31 (pp to p range) - NEVER exceeds piano dynamic",
    metaphor: "If the right hand is the story, the left hand is TIME ITSELF - constant, cyclical, inevitable"
  };

  // Left Hand analysis from lefthand.txt
  const leftHandAnalysis = {
    pattern: "Arpeggiated broken chords - NEVER CHANGES",
    structure: "Root-Fifth-Third-Root (1-5-3-1) for each chord",
    chords: ["Am (E-A-C-E)", "Am (E-A-C-E)", "C (G-C-E-G)", "E (B-E-G#-B)", "Am (E-A-C-E)"],
    rhythm: "Two attacks per bar - subdivisions 1 and 9 (beats 1 and 3)",
    velocity: "Constant at 31 (pp to p range) - NEVER exceeds piano dynamic",
    function: "The eternal foundation - like the earth beneath our feet, unchanging while everything above shifts and changes",
    metaphor: "If the right hand is the story, the left hand is TIME ITSELF - constant, cyclical, inevitable",
    // Specific left hand patterns from lefthand.txt:
    consistency: "Identical pattern repeats every 8 bars throughout entire piece",
    voicing: "Always root position arpeggios with doubling",
    range: "Stays in lower register (A2-E4) - never competes with melody",
    dynamicRange: "Extremely narrow (31 velocity only) - pure background function"
  };

  // Left hand specific patterns from lefthand.txt
  const leftHandPatterns = {
    arpeggioPattern: {
      description: "Broken chord arpeggios in root position",
      notes: "Always follows 1-5-3-1 pattern for each chord",
      rhythm: "Two attacks per bar (beats 1 and 3)",
      consistency: "Never varies throughout entire piece"
    },
    chordProgression: {
      sequence: "Am → Am → C → E → Am",
      function: "i → i → III → V → i",
      character: "Natural minor with brief major inflections",
      bassNotes: ["A2/E3", "A2/E3", "C2/G3", "E2/B3", "A2/E3"]
    },
    texture: {
      density: "Sparse but consistent",
      role: "Pure foundation - never melodic",
      relationship: "Provides harmonic anchor for right hand variations"
    }
  };

  // Right hand melodic cells (recurring motifs)
  const melodicCells = {
    CELL_A: {
      name: "The Rising Question",
      firstAppearance: "Bar 3",
      pattern: "Ascending stepwise motion + leap",
      notes: "C5→G5→A5→B5→C6 (ascending scale fragment)",
      rhythm: "Whole notes with inner quarter note movement",
      emotional: "Hope, yearning, reaching upward",
      recurrences: ["Bar 3", "Bar 11", "Bar 19", "Bar 27", "Bar 51", "Bar 59", "Bar 67"],
      transformation: "Each return is HIGHER in register or with added voices"
    },
    CELL_B: {
      name: "The Sustained Answer",
      firstAppearance: "Bar 4",
      pattern: "Long held tones with inner voice activity",
      notes: "C5→D5→E5→F5 (ascending by step)",
      rhythm: "Whole notes (4+ subdivisions each)",
      emotional: "Peace, resolution, breathing space",
      recurrences: ["Bar 4", "Bar 12", "Bar 20", "Bar 36", "Bar 52", "Bar 60"],
      transformation: "Octave shifts and added harmonics"
    },
    CELL_C: {
      name: "The Descending Wave",
      firstAppearance: "Bar 5",
      pattern: "Descending scale with rhythmic acceleration",
      notes: "B4→A5→G5→F5 (falling cascade)",
      rhythm: "Mixed durations creating wave effect",
      emotional: "Release, falling, water imagery",
      recurrences: ["Bar 5", "Bar 13", "Bar 21", "Bar 29", "Bar 53"],
      transformation: "Speed and register variations"
    },
    CELL_D: {
      name: "The Harmonic Pillar",
      firstAppearance: "Bar 6",
      pattern: "Sustained dyads and triads",
      notes: "E5-B5 (perfect 5th), then C5-E5-G5 (triad)",
      rhythm: "Whole notes held across multiple bars",
      emotional: "Stability, foundation, arrival",
      recurrences: ["Bar 6", "Bar 14", "Bar 22", "Bar 38", "Bar 54", "Bar 62"],
      transformation: "Voice addition: dyad→triad→tetrad"
    },
    CELL_E: {
      name: "The Chromatic Twist",
      firstAppearance: "Bar 9",
      pattern: "Half-step motion creating tension",
      notes: "F#5→G#5 (leading tone resolution in E major context)",
      rhythm: "Quarter notes with sustain",
      emotional: "Tension, leading, expectation",
      recurrences: ["Bar 9", "Bar 17", "Bar 25", "Bar 33", "Bar 41", "Bar 49", "Bar 57", "Bar 65", "Bar 73"],
      transformation: "Always signals harmonic pivot to E major chord"
    }
  };

  // Harmonic journey
  const harmonicJourney = [
    { section: "Bars 1-10", progression: "Am - Am - C - E - Am", function: "Establish ground", color: "Dark, minor, melancholic" },
    { section: "Bars 11-18", progression: "Am - Am - C - E - Am", function: "Melodic bloom over ground", color: "Hopeful, ascending" },
    { section: "Bars 19-26", progression: "Am - Am - C - E - Am", function: "Octave ascent", color: "Brighter, more ethereal" },
    { section: "Bars 27-34", progression: "Am - Am - C - E - Am", function: "Peak register", color: "Celestial, highest point" },
    { section: "Bars 35-42", progression: "Am - Am - C - E - Am", function: "Register descent", color: "Return to earth" },
    { section: "Bars 43-50", progression: "Am - Am - C - E - Am", function: "Rhythmic complexity", color: "Active, alive" },
    { section: "Bars 51-58", progression: "Am - Am - C - E - Am", function: "Melodic return", color: "Familiar, comforting" },
    { section: "Bars 59-66", progression: "Am - Am - C - E - Am", function: "Second bloom", color: "Renewed hope" },
    { section: "Bars 67-74", progression: "Am - Am - C - E - Am", function: "Final resolution", color: "Peace, acceptance" }
  ];

  // Register evolution (octave analysis)
  const registerEvolution = [
    { bar: 1, lowest: "A2", highest: "E4", span: 29, section: "Ground bass only" },
    { bar: 3, lowest: "A2", highest: "C6", span: 46, section: "First melody" },
    { bar: 11, lowest: "A2", highest: "C6", span: 46, section: "Melodic repeat" },
    { bar: 19, lowest: "A2", highest: "C6", span: 46, section: "Octave up version" },
    { bar: 27, lowest: "A2", highest: "F6", span: 50, section: "Peak register" },
    { bar: 35, lowest: "A2", highest: "C5", span: 39, section: "Descent begins" },
    { bar: 43, lowest: "A2", highest: "G6", span: 54, section: "Complexity peak" },
    { bar: 51, lowest: "A2", highest: "C6", span: 46, section: "Return home" },
    { bar: 59, lowest: "A2", highest: "C6", span: 46, section: "Final bloom" },
    { bar: 67, lowest: "A2", highest: "C6", span: 46, section: "Resolution" }
  ];

  // Texture density over time
  const textureDensity = [
    { bar: 1, notesPerBeat: 1.5, complexity: 2, description: "Sparse ground" },
    { bar: 3, notesPerBeat: 2.0, complexity: 4, description: "Melody enters" },
    { bar: 11, notesPerBeat: 2.5, complexity: 5, description: "Added voices" },
    { bar: 19, notesPerBeat: 3.0, complexity: 6, description: "Thickening" },
    { bar: 27, notesPerBeat: 3.5, complexity: 7, description: "Dense texture" },
    { bar: 35, notesPerBeat: 2.5, complexity: 5, description: "Thinning" },
    { bar: 43, notesPerBeat: 4.0, complexity: 9, description: "Rhythmic peak" },
    { bar: 51, notesPerBeat: 2.0, complexity: 4, description: "Return simplicity" },
    { bar: 59, notesPerBeat: 2.5, complexity: 5, description: "Second wave" },
    { bar: 67, notesPerBeat: 1.5, complexity: 3, description: "Final calm" }
  ];

  // Velocity dynamics (emotional arc)
  const velocityArc = [
    { bar: 1, velocity: 19, dynamic: "pp", mood: "Quiet beginning" },
    { bar: 3, velocity: 19, dynamic: "pp", mood: "Gentle awakening" },
    { bar: 11, velocity: 20, dynamic: "p", mood: "Slightly brighter" },
    { bar: 19, velocity: 25, dynamic: "mp", mood: "Growing confidence" },
    { bar: 27, velocity: 27, dynamic: "mf", mood: "Assertive presence" },
    { bar: 35, velocity: 18, dynamic: "pp", mood: "Retreat, reflection" },
    { bar: 43, velocity: 27, dynamic: "mf", mood: "Return of energy" },
    { bar: 51, velocity: 19, dynamic: "pp", mood: "Nostalgic return" },
    { bar: 59, velocity: 20, dynamic: "p", mood: "Renewed hope" },
    { bar: 67, velocity: 18, dynamic: "pp", mood: "Final peace" }
  ];

  // Key storytelling moments
  const storyBeats = [
    {
      bar: 3,
      moment: "The First Question",
      description: "After two bars of foundation, the melody enters. Like a voice asking: 'What lies beyond?' The ascending C-G-A-B-C feels like climbing stairs into unknown territory.",
      musical: "Cell A introduction - ascending scale fragment",
      emotional: "Curiosity, innocence, first steps"
    },
    {
      bar: 9,
      moment: "The Chromatic Turn",
      description: "The F#→G# movement is the first 'twist' in the story. This is the moment of doubt, the question mark. The music briefly touches E major (the relative major) before returning to Am.",
      musical: "Cell E - leading tone resolution",
      emotional: "Doubt, questioning, pivot point"
    },
    {
      bar: 11,
      moment: "The Affirmation",
      description: "The melody returns, but now it's not alone. Additional voices join, as if the solo voice has found companions. The journey continues with support.",
      musical: "Cell A + Cell B layered",
      emotional: "Companionship, validation, not alone"
    },
    {
      bar: 19,
      moment: "The Ascent Begins",
      description: "Same melody, but ONE OCTAVE HIGHER. This is the 'rising action' in narrative terms. The story lifts, literally. We're climbing higher, seeing further.",
      musical: "Cell A transposed up one octave",
      emotional: "Elevation, expansion, broader perspective"
    },
    {
      bar: 27,
      moment: "The Summit",
      description: "The highest register of the entire piece. This is the peak of the mountain. From here, we can see everything. The melody reaches F6 - the ceiling of the piano's singing range.",
      musical: "Cell A at highest register + full harmony",
      emotional: "Triumph, vista, breathtaking view"
    },
    {
      bar: 35,
      moment: "The Descent",
      description: "What goes up must come down. The register drops back to middle C. This isn't defeat - it's necessary return. The journey home begins.",
      musical: "Cell A returns to original octave",
      emotional: "Acceptance, grounding, returning"
    },
    {
      bar: 43,
      moment: "The Storm",
      description: "The rhythmic complexity peaks here. This is the 'dark night of the soul' moment. Multiple voices, complex rhythms, inner turmoil. But the ground bass NEVER CHANGES - providing stability in chaos.",
      musical: "Polyrhythmic texture over unchanging bass",
      emotional: "Struggle, complexity, testing"
    },
    {
      bar: 51,
      moment: "Recognition",
      description: "The original melody returns. After all the complexity, we hear the beginning again. But we're changed - we hear it differently now. Same notes, different meaning.",
      musical: "Cell A return - exact repetition",
      emotional: "Nostalgia, recognition, full circle"
    },
    {
      bar: 59,
      moment: "Second Bloom",
      description: "One more flowering. The melody ascends again, but with the wisdom of the journey. This time, it's not naive hope - it's earned peace.",
      musical: "Cell A + B with fuller harmonization",
      emotional: "Mature hope, wisdom, acceptance"
    },
    {
      bar: 67,
      moment: "The Eternal Return",
      description: "The final bars return to sustained chords. The ground bass continues its cycle. The piece could repeat infinitely - like waves on a beach, like breath, like heartbeat. No dramatic ending - just... continuation.",
      musical: "Whole note chords over ground bass",
      emotional: "Peace, eternity, the cycle continues"
    }
  ];

  // Right hand pattern analysis
  const rightHandPatterns = {
    pattern1: {
      name: "Ascending Scalar Motion",
      bars: [3, 11, 19, 27, 51, 59, 67],
      technique: "Stepwise melody with occasional leaps",
      purpose: "Creates sense of rising, hope, question",
      notes: "Usually starts on tonic (C) or dominant (E), ascends to octave above"
    },
    pattern2: {
      name: "Sustained Whole Notes",
      bars: [4, 6, 12, 14, 20, 22, 36, 38, 52, 54, 60, 62, 68, 70],
      technique: "Long held tones (whole notes lasting 4+ subdivisions)",
      purpose: "Creates breathing space, allows harmony to resonate",
      notes: "Often dyads (2 notes) or triads (3 notes)"
    },
    pattern3: {
      name: "Inner Voice Movement",
      bars: [5, 7, 13, 15, 21, 23, 29, 37, 53, 61, 69],
      technique: "Quarter note movement within sustained texture",
      purpose: "Adds motion without disturbing calm",
      notes: "Stepwise or small leaps, fills harmonic space"
    },
    pattern4: {
      name: "Chromatic Resolution",
      bars: [9, 17, 25, 33, 41, 49, 57, 65, 73],
      technique: "F# and G# leading tones",
      purpose: "Creates tension before resolution to E major chord",
      notes: "Always F#→G# or single G# as leading tone"
    },
    pattern5: {
      name: "Octave Doubling",
      bars: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      technique: "Same melody but doubled at octave",
      purpose: "Creates power, fullness without changing harmony",
      notes: "Exact replication one octave higher"
    },
    pattern6: {
      name: "Polyrhythmic Texture",
      bars: [43, 44, 45, 46, 47, 48],
      technique: "Multiple independent rhythmic voices",
      purpose: "Peak complexity, emotional intensity",
      notes: "3-4 voices with staggered entrances"
    }
  };

  // Mathematical patterns
  const mathematicalPatterns = [
    {
      pattern: "8-Bar Cycles",
      discovery: "Every 8 bars = one complete passacaglia cycle",
      significance: "8 bars × 9 cycles = 72 bars main body + 2 bars intro = 74 bars total",
      formula: "8n where n = cycle number (0-9)"
    },
    {
      pattern: "Register Symmetry",
      discovery: "Bars 1-34 = rising (low to high), Bars 35-50 = falling (high to mid), Bars 51-74 = rising again (mid to high)",
      significance: "Creates arch form: A (rise) - B (fall) - A' (rise again)",
      formula: "Pyramid structure: ascent → peak → descent → re-ascent"
    },
    {
      pattern: "Fibonacci Voice Addition",
      discovery: "Voices accumulate: 5 (start) → 5 → 6 → 6 → 5 → 7 → 5 → 6 → 5",
      significance: "Never exceeds 7 voices, keeps texture transparent",
      formula: "Voice count roughly follows 5-6-7 pattern (Fibonacci-adjacent)"
    },
    {
      pattern: "Chromatic Cell Regularity",
      discovery: "Cell E (F#→G#) appears every 8 bars like clockwork",
      significance: "Marks the end of each passacaglia cycle - structural punctuation",
      formula: "Appears at bars: 9, 17, 25, 33, 41, 49, 57, 65, 73"
    },
    {
      pattern: "Octave Displacement",
      discovery: "Bars 19-26 are EXACT octave transposition of bars 3-10",
      significance: "Same notes, same rhythms, just 12 semitones higher - pure transformation",
      formula: "Transposition(melody, +12 semitones)"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-4 sm:p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent text-center sm:text-left">
            <a href="https://youtu.be/ApCL2GomTD4?si=qkF3h-gLWu8MLQZp" target="_blank" rel="noopener noreferrer"> Passacaglia: The Art of the Ground Bass</a>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-1 sm:mb-2 text-center sm:text-left">A Minor • 120 BPM • 4/4 Time • 74 Bars</p>
          <p className="text-base sm:text-lg text-slate-400 text-center sm:text-left">The Story of Eternal Return: One Bass Line, Infinite Transformations</p>
        </div>

        {/* Navigation - Mobile Responsive */}
        <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap justify-center sm:justify-start">
          {['overview', 'ground-bass', 'melodic-cells', 'storytelling', 'right-hand', 'register', 'harmony', 'patterns', 'summary'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all ${
                activeView === view
                  ? 'bg-cyan-600 shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {view.toUpperCase().replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* OVERVIEW - Mobile Responsive */}
        {activeView === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-300 mb-3 sm:mb-4 text-center sm:text-left">Overview: What is a Passacaglia?</h2>
            
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-cyan-500">
              <h3 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-3 sm:mb-4">🎼 The Passacaglia Form</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                A <strong className="text-cyan-300">passacaglia</strong> is a Baroque compositional technique: a short harmonic progression (usually 8 bars) that REPEATS in the bass while upper voices create endless variations above it.
              </p>
              <p className="text-base sm:text-lg text-slate-300 mb-3 sm:mb-4">
                Think of it as musical architecture: the <strong className="text-blue-300">foundation never changes</strong>, but the building above transforms continuously.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-cyan-900/40 rounded p-3 sm:p-4 text-center border border-cyan-400">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300 mb-1 sm:mb-2">74</div>
                  <div className="text-slate-300 text-sm sm:text-base">Total Bars</div>
                </div>
                <div className="bg-blue-900/40 rounded p-3 sm:p-4 text-center border border-blue-400">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-300 mb-1 sm:mb-2">9+</div>
                  <div className="text-slate-300 text-sm sm:text-base">Bass Cycles</div>
                </div>
                <div className="bg-teal-900/40 rounded p-3 sm:p-4 text-center border border-teal-400">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-300 mb-1 sm:mb-2">5</div>
                  <div className="text-slate-300 text-sm sm:text-base">Melodic Cells</div>
                </div>
              </div>
            </div>

            {/* Structure Timeline */}
            <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-300 mb-3 sm:mb-4">Structural Arc</h3>
              <div className="h-64 sm:h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={structure}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="section" 
                      stroke="#888" 
                      angle={-30} 
                      textAnchor="end" 
                      height={60}
                      fontSize={10}
                    />
                    <YAxis stroke="#888" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }} />
                    <Area type="monotone" dataKey="tension" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs sm:text-sm text-cyan-300 text-center mt-2 sm:mt-3">
                Tension follows arch form: rise (1-34) → fall (35-42) → rise (43-58) → release (59-74)
              </p>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {structure.map((item, idx) => (
                <div key={idx} className="bg-slate-800/70 rounded-lg p-3 sm:p-4 border-l-4 border-cyan-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-cyan-300">{item.section}</h4>
                      <span className="text-xs bg-cyan-900/50 px-2 py-1 rounded">Bars {item.bars}</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-blue-400">{item.tension}/10</span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-slate-300"><strong className="text-cyan-300">Theme:</strong> {item.theme}</p>
                    <p className="text-slate-300"><strong className="text-blue-300">Voices:</strong> {item.voices}</p>
                    <p className="text-slate-300"><strong className="text-teal-300">Register:</strong> {item.register}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUND BASS - Mobile Responsive */}
        {activeView === 'ground-bass' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-300 mb-3 sm:mb-4 text-center sm:text-left">The Ground Bass: The Eternal Foundation</h2>
            
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-purple-500">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4">🔄 The Unbreakable Pattern</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-4 sm:mb-6">
                The left hand plays the SAME harmonic progression for the ENTIRE piece. This is not limitation - this is liberation. When the foundation is stable, the imagination can soar.
              </p>
              
              <div className="bg-black/40 rounded p-4 sm:p-6 mb-4 sm:mb-6">
                <h4 className="text-lg sm:text-xl font-bold text-pink-300 mb-3 sm:mb-4">The 8-Bar Cycle</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {['Bar 1-2: Am', 'Bar 3-4: Am', 'Bar 5-6: C', 'Bar 7-8: E', 'Return: Am'].map((bar, idx) => (
                      <div key={idx} className="bg-purple-900/40 rounded p-2 sm:p-3 text-center border border-purple-400">
                        <div className="text-xs sm:text-sm text-slate-300">{bar}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-300 text-center mt-3 sm:mt-4 text-sm sm:text-base">
                    <strong className="text-purple-300">Roman Numerals:</strong> {groundBass.harmonic}
                  </p>
                  <p className="text-slate-300 text-center text-sm sm:text-base">
                    <strong className="text-pink-300">Function:</strong> {groundBass.function}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-purple-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Bass Line Notes</h4>
                  <div className="space-y-2 text-slate-200 text-sm">
                    <p><strong className="text-purple-300">Am:</strong> E3-A3-C4-E4 (root position, arpeggiated)</p>
                    <p><strong className="text-purple-300">Am (repeat):</strong> E3-A3-C4-E4 (identical)</p>
                    <p><strong className="text-purple-300">C:</strong> G3-C4-E4-G4 (root position)</p>
                    <p><strong className="text-purple-300">E:</strong> B3-E4-G#4-B4 (with raised 7th - G#)</p>
                    <p><strong className="text-purple-300">Am:</strong> E3-A3-C4-E4 (return home)</p>
                  </div>
                </div>

                <div className="bg-pink-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-pink-300 mb-2 sm:mb-3">Why This Works</h4>
                  <div className="space-y-2 text-slate-200 text-xs sm:text-sm">
                    <p>• <strong className="text-pink-300">Am twice:</strong> Establishes tonic strongly</p>
                    <p>• <strong className="text-pink-300">C major:</strong> Brightens without leaving key (relative major)</p>
                    <p>• <strong className="text-pink-300">E major:</strong> Dominant function (V) - creates tension</p>
                    <p>• <strong className="text-pink-300">G# in E chord:</strong> Leading tone - PULLS back to A</p>
                    <p>• <strong className="text-pink-300">Return to Am:</strong> Resolution, but cycle continues...</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-black/30 rounded border border-purple-400">
                <h4 className="text-lg sm:text-xl font-bold text-cyan-300 mb-2 sm:mb-3">🌊 The Metaphor: Waves on a Beach</h4>
                <p className="text-slate-200 text-base sm:text-lg">
                  The ground bass is like ocean waves. Each wave (8-bar cycle) follows the same path: 
                  approach the shore (Am→Am), crest (C), break (E), recede (Am). Then immediately, 
                  the next wave begins. Eternal, cyclical, hypnotic.
                </p>
                <p className="text-slate-300 italic mt-2 sm:mt-3 text-sm sm:text-base">
                  The melody above is the light on the water - constantly changing, dancing, reflecting. 
                  But the waves themselves? They never stop.
                </p>
              </div>
            </div>

            {/* Left Hand Technical Analysis */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-300 mb-3 sm:mb-4">Left Hand Technical Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">Rhythm Pattern</h4>
                  <div className="bg-black/40 rounded p-3 sm:p-4 mb-2 sm:mb-3">
                    <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base"><strong className="text-cyan-300">Attacks per bar:</strong> 2 (on beats 1 and 3)</p>
                    <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base"><strong className="text-cyan-300">Subdivisions:</strong> 1 and 9 (of 16 total)</p>
                    <p className="text-slate-200 text-sm sm:text-base"><strong className="text-cyan-300">Duration:</strong> Each note sustained through next attack</p>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    This creates a <strong className="text-cyan-300">two-against-four feel</strong>. While the time signature is 4/4, 
                    the bass emphasizes beats 1 and 3, creating a "slow rocking" motion.
                  </p>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Velocity Consistency</h4>
                  <div className="bg-black/40 rounded p-3 sm:p-4 mb-2 sm:mb-3">
                    <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base"><strong className="text-purple-300">Range:</strong> 31 only (constant)</p>
                    <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base"><strong className="text-purple-300">Dynamic:</strong> p (soft)</p>
                    <p className="text-slate-200 text-sm sm:text-base"><strong className="text-purple-300">Variation:</strong> None - pure background</p>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    The bass is <strong className="text-purple-300">intentionally subdued</strong>. It's the foundation, 
                    not the focus. Like a heartbeat - you don't consciously hear it, but without it, nothing lives.
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded p-4 sm:p-6 border border-blue-500">
                <h4 className="text-lg sm:text-xl font-bold text-blue-300 mb-3 sm:mb-4">Why Unchanging Bass = Genius</h4>
                <div className="space-y-2 sm:space-y-3 text-slate-200 text-sm sm:text-base">
                  <p>
                    <strong className="text-cyan-300">1. Cognitive Freedom:</strong> Your brain doesn't need to track 
                    harmonic changes. It KNOWS the pattern. This frees attention for the melodic variations above.
                  </p>
                  <p>
                    <strong className="text-blue-300">2. Emotional Anchor:</strong> In a piece about transformation, 
                    the unchanging bass is the ONE CONSTANT. It's home. It's safe. No matter how far the melody wanders, 
                    this foundation remains.
                  </p>
                  <p>
                    <strong className="text-purple-300">3. Structural Clarity:</strong> Every 8 bars = one complete cycle. 
                    The listener can COUNT the cycles. This creates subliminal satisfaction - the brain loves predictable patterns.
                  </p>
                  <p>
                    <strong className="text-pink-300">4. Compositional Challenge:</strong> Limitation breeds creativity. 
                    With harmony locked, the composer MUST find interest through melody, rhythm, register, texture. 
                    This constraint forces innovation.
                  </p>
                </div>
              </div>
            </div>

            {/* Left Hand Patterns */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-3 sm:mb-4">Left Hand Pattern Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-green-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-green-300 mb-2 sm:mb-3">Arpeggio Pattern</h4>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Description:</strong> {leftHandPatterns.arpeggioPattern.description}</p>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Notes:</strong> {leftHandPatterns.arpeggioPattern.notes}</p>
                  <p className="text-slate-200 text-xs sm:text-sm"><strong>Rhythm:</strong> {leftHandPatterns.arpeggioPattern.rhythm}</p>
                </div>
                <div className="bg-blue-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">Chord Progression</h4>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Sequence:</strong> {leftHandPatterns.chordProgression.sequence}</p>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Function:</strong> {leftHandPatterns.chordProgression.function}</p>
                  <p className="text-slate-200 text-xs sm:text-sm"><strong>Character:</strong> {leftHandPatterns.chordProgression.character}</p>
                </div>
                <div className="bg-purple-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Texture Role</h4>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Density:</strong> {leftHandPatterns.texture.density}</p>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Role:</strong> {leftHandPatterns.texture.role}</p>
                  <p className="text-slate-200 text-xs sm:text-sm"><strong>Relationship:</strong> {leftHandPatterns.texture.relationship}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-900/40 to-green-900/40 rounded p-4 sm:p-6 border-2 border-emerald-500">
                <h4 className="text-lg sm:text-xl font-bold text-emerald-300 mb-2 sm:mb-3">The Eternal Consistency</h4>
                <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                  From bar 1 to bar 74, the left hand pattern NEVER deviates. Every 8 bars, the same notes, 
                  same rhythm, same velocity. This creates a musical "ground" in the truest sense - the earth 
                  upon which the right hand's "sky" can paint infinite weather patterns.
                </p>
                <p className="text-slate-300 text-xs sm:text-sm italic">
                  The left hand's job isn't to be interesting - it's to be RELIABLE. And in that reliability, 
                  it becomes the most interesting element of all.
                </p>
              </div>
            </div>

            {/* Cycle Breakdown */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-3 sm:mb-4">The 9 Cycles Visualized</h3>
              
              <div className="space-y-2">
                {[
                  { cycle: 1, bars: "1-8", character: "Exposition - ground bass alone, then melody enters" },
                  { cycle: 2, bars: "9-16", character: "First bloom - melody with harmonic support" },
                  { cycle: 3, bars: "17-24", character: "Octave ascent begins - rising energy" },
                  { cycle: 4, bars: "25-32", character: "Peak register - highest melodies" },
                  { cycle: 5, bars: "33-40", character: "Descent and reflection - return to earth" },
                  { cycle: 6, bars: "41-48", character: "Rhythmic complexity - polyrhythmic peak" },
                  { cycle: 7, bars: "49-56", character: "Melodic return - familiar themes reappear" },
                  { cycle: 8, bars: "57-64", character: "Second bloom - renewed with wisdom" },
                  { cycle: 9, bars: "65-72", character: "Resolution approach - winding down" },
                  { cycle: "Coda", bars: "73-74", character: "Final sustained chords - eternal continuation" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-green-900/20 rounded p-3 sm:p-4 border-l-4 border-green-500 hover:bg-green-900/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-green-300">Cycle {item.cycle}</span>
                        <span className="text-xs sm:text-sm text-slate-400 ml-2 sm:ml-3">Bars {item.bars}</span>
                      </div>
                      <span className="text-xs bg-green-900/50 px-2 py-1 rounded">8 bars</span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-2">{item.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MELODIC CELLS - Mobile Responsive */}
        {activeView === 'melodic-cells' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-pink-300 mb-3 sm:mb-4 text-center sm:text-left">Melodic Cells: The Five Recurring Themes</h2>
            
            <div className="bg-gradient-to-r from-pink-900/50 to-rose-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-pink-500">
              <h3 className="text-xl sm:text-2xl font-bold text-pink-300 mb-3 sm:mb-4">🧬 The DNA of the Melody</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                This piece doesn't have "one melody" - it has <strong className="text-pink-300">five melodic cells</strong> 
                that recur, transform, and interweave throughout. Like musical DNA, these cells combine in different ways 
                to create the living organism of the piece.
              </p>
            </div>

            {Object.entries(melodicCells).map(([id, cell]) => (
              <div key={id} className="bg-slate-800/70 rounded-lg p-4 sm:p-6 border-l-4 border-pink-500">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-300">{id}: {cell.name}</h3>
                    <span className="text-xs sm:text-sm text-slate-400">First appears: {cell.firstAppearance}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-rose-400">{cell.recurrences.length}×</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-cyan-300 mb-1 sm:mb-2">Musical Character</h4>
                      <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base"><strong className="text-cyan-300">Pattern:</strong> {cell.pattern}</p>
                      <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base"><strong className="text-cyan-300">Notes:</strong> {cell.notes}</p>
                      <p className="text-slate-200 text-sm sm:text-base"><strong className="text-cyan-300">Rhythm:</strong> {cell.rhythm}</p>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-pink-900/30 rounded p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-bold text-pink-300 mb-1 sm:mb-2">Emotional Content</h4>
                      <p className="text-slate-200 italic text-sm sm:text-base">"{cell.emotional}"</p>
                    </div>
                    <div className="bg-rose-900/30 rounded p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-bold text-rose-300 mb-1 sm:mb-2">Transformation</h4>
                      <p className="text-slate-200 text-xs sm:text-sm">{cell.transformation}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">Appearances Throughout Piece</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {cell.recurrences.map((bar, idx) => (
                      <span key={idx} className="bg-blue-900/40 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm text-blue-200 border border-blue-600">
                        {bar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Cell Interaction Analysis */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4">How Cells Interact</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-purple-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Bars 3-10: Cell A + Cell B (Foundation)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    Cell A (ascending) establishes the "question" - the upward yearning. Cell B (sustained answer) 
                    provides "response" - the peaceful resolution. Together they create call-and-response.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    Like inhale (A) and exhale (B). Tension and release in musical breath.
                  </p>
                </div>

                <div className="bg-pink-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-pink-300 mb-2 sm:mb-3">Bars 11-18: Cells A + B + D (Harmony Blooms)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    Same A and B, but now Cell D (harmonic pillars) adds underneath. The melody is SUPPORTED. 
                    What was solo voice is now duet, then trio. Companionship emerges.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    The journey is no longer solitary. Others have joined.
                  </p>
                </div>

                <div className="bg-blue-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">Bars 19-26: Cells A + B transposed (Octave Ascent)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    EXACT repetition of bars 3-10, but ONE OCTAVE HIGHER. Same notes, same rhythm, but the 
                    register change creates entirely new emotional color. Higher = brighter, more hopeful, more distant.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    Same path, but now we're climbing mountains instead of walking valleys.
                  </p>
                </div>

                <div className="bg-green-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-green-300 mb-2 sm:mb-3">Bars 43-48: All Cells Polyrhythmically</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    Multiple cells play SIMULTANEOUSLY at different rhythms. Cell A in quarters, Cell C in eighths, 
                    Cell D sustaining. This is the complexity peak - like hearing three conversations at once.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    The "storm" moment - organized chaos that somehow remains beautiful.
                  </p>
                </div>

                <div className="bg-cyan-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">Bars 67-74: Cells A + B return (Resolution)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    After all transformations, the original cells return. But we hear them DIFFERENTLY now. 
                    They're not questions anymore - they're answers. Same notes, but meaning has changed through journey.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm italic">
                    Coming home after a long voyage. The house is the same, but you are not.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STORYTELLING - Mobile Responsive */}
        {activeView === 'storytelling' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-orange-300 mb-3 sm:mb-4 text-center sm:text-left">The Story: A Hero's Journey in Music</h2>
            
            <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-orange-500">
              <h3 className="text-xl sm:text-2xl font-bold text-orange-300 mb-3 sm:mb-4">📖 The Narrative Arc</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                This passacaglia tells a complete story in 74 bars. It follows the classic <strong className="text-orange-300">Hero's Journey</strong> 
                structure: departure from home, trials, transformation, return changed.
              </p>
              <p className="text-base sm:text-lg text-slate-300">
                The ground bass is TIME itself - unchanging, eternal. The melody is the HERO - transforming, learning, growing.
              </p>
            </div>

            {storyBeats.map((beat, idx) => (
              <div key={idx} className="bg-slate-800/70 rounded-lg p-4 sm:p-6 border-l-4 border-orange-500">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-orange-300">{beat.moment}</h3>
                    <span className="text-xs sm:text-sm text-slate-400">Bar {beat.bar}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">The Story</h4>
                    <p className="text-slate-200 leading-relaxed text-sm sm:text-base">{beat.description}</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-blue-900/30 rounded p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-bold text-blue-300 mb-1 sm:mb-2">Musical Technique</h4>
                      <p className="text-slate-200 text-xs sm:text-sm">{beat.musical}</p>
                    </div>
                    <div className="bg-purple-900/30 rounded p-3 sm:p-4">
                      <h4 className="text-xs sm:text-sm font-bold text-purple-300 mb-1 sm:mb-2">Emotional State</h4>
                      <p className="text-slate-200 text-xs sm:text-sm italic">{beat.emotional}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Three-Act Structure */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-4 sm:mb-6 text-center">The Three-Act Structure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-lg p-4 sm:p-6 border-2 border-green-500">
                  <h4 className="text-lg sm:text-xl font-bold text-green-300 mb-3 sm:mb-4 text-center">ACT I: Departure</h4>
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400">Bars 1-26</div>
                    <div className="text-xs sm:text-sm text-slate-400">The Ordinary World → Call to Adventure</div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-slate-200 text-xs sm:text-sm">
                    <p>• <strong className="text-green-300">1-2:</strong> Ground alone (the world before)</p>
                    <p>• <strong className="text-green-300">3-10:</strong> First melody (the call)</p>
                    <p>• <strong className="text-green-300">11-18:</strong> Companions join (support)</p>
                    <p>• <strong className="text-green-300">19-26:</strong> Octave ascent (crossing threshold)</p>
                  </div>
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-black/30 rounded text-center">
                    <p className="text-green-300 font-bold text-sm sm:text-base">Theme: Leaving Home</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-lg p-4 sm:p-6 border-2 border-red-500">
                  <h4 className="text-lg sm:text-xl font-bold text-red-300 mb-3 sm:mb-4 text-center">ACT II: Trials</h4>
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400">Bars 27-50</div>
                    <div className="text-xs sm:text-sm text-slate-400">Tests → Ordeal → Reward</div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-slate-200 text-xs sm:text-sm">
                    <p>• <strong className="text-red-300">27-34:</strong> Peak register (summit reached)</p>
                    <p>• <strong className="text-red-300">35-42:</strong> Descent (trial begins)</p>
                    <p>• <strong className="text-red-300">43-50:</strong> Polyrhythmic storm (the ordeal)</p>
                  </div>
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-black/30 rounded text-center">
                    <p className="text-red-300 font-bold text-sm sm:text-base">Theme: Transformation Through Struggle</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-lg p-4 sm:p-6 border-2 border-blue-500">
                  <h4 className="text-lg sm:text-xl font-bold text-blue-300 mb-3 sm:mb-4 text-center">ACT III: Return</h4>
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">Bars 51-74</div>
                    <div className="text-xs sm:text-sm text-slate-400">Return → Resurrection → Elixir</div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-slate-200 text-xs sm:text-sm">
                    <p>• <strong className="text-blue-300">51-58:</strong> Melody returns (recognition)</p>
                    <p>• <strong className="text-blue-300">59-66:</strong> Second bloom (wisdom)</p>
                    <p>• <strong className="text-blue-300">67-74:</strong> Resolution (homecoming)</p>
                  </div>
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-black/30 rounded text-center">
                    <p className="text-blue-300 font-bold text-sm sm:text-base">Theme: Return Changed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emotional Journey Graph */}
            <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-pink-300 mb-3 sm:mb-4">Emotional Intensity Over Time</h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={velocityArc}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="bar" stroke="#888" fontSize={10} />
                    <YAxis stroke="#888" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ec4899' }} />
                    <Area type="monotone" dataKey="velocity" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs sm:text-sm text-pink-300 text-center mt-2 sm:mt-3">
                Velocity follows emotional arc: quiet beginning → assertive middle → quiet wisdom at end
              </p>
            </div>
          </div>
        )}

        {/* RIGHT HAND ANALYSIS - Mobile Responsive */}
        {activeView === 'right-hand' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-300 mb-3 sm:mb-4 text-center sm:text-left">Right Hand: The Voice of Transformation</h2>
            
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-green-500">
              <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-3 sm:mb-4">🎹 Six Distinct Patterns</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                While the left hand never changes, the right hand employs <strong className="text-green-300">six different textural approaches</strong>. 
                Each creates a different emotional color while staying within the harmonic framework.
              </p>
            </div>

            {Object.entries(rightHandPatterns).map(([id, pattern]) => (
              <div key={id} className="bg-slate-800/70 rounded-lg p-4 sm:p-6 border-l-4 border-green-500">
                <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-3 sm:mb-4">{pattern.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-3 sm:mb-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">Technical Details</h4>
                    <div className="space-y-1 sm:space-y-2 text-slate-200 text-sm sm:text-base">
                      <p><strong className="text-cyan-300">Technique:</strong> {pattern.technique}</p>
                      <p><strong className="text-cyan-300">Notes:</strong> {pattern.notes}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Musical Function</h4>
                    <p className="text-slate-200 text-sm sm:text-base">{pattern.purpose}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">Locations</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {pattern.bars.map((bar, idx) => (
                      <span key={idx} className="bg-blue-900/40 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm text-blue-200">
                        Bar {bar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Pattern Combinations */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-3 sm:mb-4">Pattern Combinations: How They Layer</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-yellow-900/20 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-yellow-300 mb-2 sm:mb-3">Simple Texture (Bars 3-10)</h4>
                  <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                    <strong className="text-yellow-300">Pattern 1 only:</strong> Single melodic line above ground bass. 
                    Clean, clear, unambiguous. This is the "thesis" - the statement of the main idea.
                  </p>
                  <div className="bg-black/30 rounded p-2 sm:p-3">
                    <p className="text-slate-300 text-xs sm:text-sm">
                      <strong className="text-cyan-300">Voice count:</strong> 2 (melody + bass)
                    </p>
                  </div>
                </div>

                <div className="bg-orange-900/20 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-orange-300 mb-2 sm:mb-3">Supported Texture (Bars 11-18)</h4>
                  <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                    <strong className="text-orange-300">Pattern 1 + Pattern 2:</strong> Melody now has harmonic support. 
                    Sustained whole notes create "cushion" beneath the ascending line. Not solo anymore - accompanied.
                  </p>
                  <div className="bg-black/30 rounded p-2 sm:p-3">
                    <p className="text-slate-300 text-xs sm:text-sm">
                      <strong className="text-cyan-300">Voice count:</strong> 3-4 (melody + harmony + bass)
                    </p>
                  </div>
                </div>

                <div className="bg-red-900/20 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-red-300 mb-2 sm:mb-3">Complex Texture (Bars 43-48)</h4>
                  <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                    <strong className="text-red-300">Pattern 6 (Polyrhythmic):</strong> Multiple independent voices, 
                    each with own rhythm. Pattern 1 in quarters, Pattern 3 in eighths, Pattern 2 sustained whole notes. 
                    Like three conversations happening simultaneously.
                  </p>
                  <div className="bg-black/30 rounded p-2 sm:p-3">
                    <p className="text-slate-300 text-xs sm:text-sm">
                      <strong className="text-cyan-300">Voice count:</strong> 6-7 (maximum density)
                    </p>
                  </div>
                </div>

                <div className="bg-blue-900/20 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">Return Texture (Bars 67-74)</h4>
                  <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                    <strong className="text-blue-300">Pattern 2 emphasized:</strong> Sustained whole notes dominate. 
                    After all the complexity, we return to STILLNESS. Not silence - stillness. The music breathes, holds, waits.
                  </p>
                  <div className="bg-black/30 rounded p-2 sm:p-3">
                    <p className="text-slate-300 text-xs sm:text-sm">
                      <strong className="text-cyan-300">Voice count:</strong> 4-5 (reduced from peak, calm)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER EVOLUTION - Mobile Responsive */}
        {activeView === 'register' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-300 mb-3 sm:mb-4 text-center sm:text-left">Register Evolution: The Vertical Journey</h2>
            
            <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-indigo-500">
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-3 sm:mb-4">📊 Climbing and Descending</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                One of the passacaglia's most powerful storytelling devices is <strong className="text-indigo-300">register shift</strong>. 
                The same melody played at different octaves creates entirely different emotional effects.
              </p>
            </div>

            {/* Register Chart */}
            <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-3 sm:mb-4">Pitch Range Over Time</h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={registerEvolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="bar" stroke="#888" fontSize={10} />
                    <YAxis stroke="#888" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #6366f1' }} />
                    <Line type="monotone" dataKey="span" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs sm:text-sm text-indigo-300 text-center mt-2 sm:mt-3">
                Widest span at bar 43 (54 semitones) - covers nearly 5 octaves
              </p>
            </div>

            {/* Register Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {registerEvolution.map((item, idx) => (
                <div key={idx} className="bg-slate-800/70 rounded-lg p-3 sm:p-4 border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <span className="text-base sm:text-lg font-bold text-indigo-300">Bar {item.bar}</span>
                    <span className="text-xl sm:text-2xl font-bold text-violet-400">{item.span}</span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm text-slate-200">
                    <p><strong className="text-indigo-300">Range:</strong> {item.lowest} to {item.highest}</p>
                    <p><strong className="text-violet-300">Section:</strong> {item.section}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Octave Transposition Analysis */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4">The Octave Transposition Technique</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-purple-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Bars 3-10 vs. Bars 19-26: Exact Octave Copy</h4>
                  <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                    These sections are IDENTICAL except for register. Every note in bars 19-26 is exactly 12 semitones 
                    (one octave) higher than bars 3-10. Same intervals, same rhythm, same duration.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div className="bg-black/40 rounded p-2 sm:p-3">
                      <h5 className="text-xs sm:text-sm font-bold text-cyan-300 mb-1 sm:mb-2">Bars 3-10 (Original)</h5>
                      <p className="text-slate-300 text-xs">Middle register (C5-C6)</p>
                      <p className="text-slate-300 text-xs mt-1">Emotional: Intimate, questioning</p>
                    </div>
                    <div className="bg-black/40 rounded p-2 sm:p-3">
                      <h5 className="text-xs sm:text-sm font-bold text-blue-300 mb-1 sm:mb-2">Bars 19-26 (Transposed)</h5>
                      <p className="text-slate-300 text-xs">High register (C6-C7)</p>
                      <p className="text-slate-300 text-xs mt-1">Emotional: Ethereal, transcendent</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-indigo-300 mb-2 sm:mb-3">Why This Works: The Psychology of Pitch</h4>
                  <div className="space-y-2 sm:space-y-3 text-slate-200 text-sm sm:text-base">
                    <p>
                      <strong className="text-indigo-300">Low register:</strong> Grounded, earthly, human. 
                      Frequencies we associate with speaking voice and physical presence.
                    </p>
                    <p>
                      <strong className="text-violet-300">Middle register:</strong> Comfortable, natural. 
                      The "sweet spot" where melodies feel most singable.
                    </p>
                    <p>
                      <strong className="text-purple-300">High register:</strong> Celestial, distant, otherworldly. 
                      Beyond human voice range - enters realm of bells, glass, sky.
                    </p>
                    <p className="text-indigo-300 italic mt-3 sm:mt-4 text-sm">
                      By repeating the melody an octave higher, the composer tells us: "You know this journey. 
                      Now experience it from a higher perspective - literally and metaphorically."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Peak Moment */}
            <div className="bg-gradient-to-r from-rose-900/50 to-orange-900/50 rounded-lg p-4 sm:p-6 border-2 border-rose-500">
              <h3 className="text-xl sm:text-2xl font-bold text-rose-300 mb-3 sm:mb-4">🏔️ The Summit: Bars 27-34</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                This is the highest the melody ever reaches - F6 at bar 27. For context, this is near the top 
                of a piano's effective melodic range. Above this, notes become more percussive than singing.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                <div className="bg-rose-900/40 rounded p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-rose-300 mb-1 sm:mb-2">F6</div>
                  <div className="text-xs sm:text-sm text-slate-300">Highest note</div>
                </div>
                <div className="bg-orange-900/40 rounded p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-300 mb-1 sm:mb-2">50</div>
                  <div className="text-xs sm:text-sm text-slate-300">Semitone span</div>
                </div>
                <div className="bg-rose-900/40 rounded p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-rose-300 mb-1 sm:mb-2">36%</div>
                  <div className="text-xs sm:text-sm text-slate-300">Through piece</div>
                </div>
              </div>
              <p className="text-slate-300 mt-3 sm:mt-4 text-center italic text-sm sm:text-base">
                The peak comes at 36% of the way through (27/74 bars). Early enough to create 
                drama for the remaining journey, but not so early it feels rushed.
              </p>
            </div>
          </div>
        )}

        {/* HARMONY SECTION - Mobile Responsive */}
        {activeView === 'harmony' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-300 mb-3 sm:mb-4 text-center sm:text-left">Harmonic Architecture: The Unchanging Foundation</h2>
            
            <div className="bg-gradient-to-r from-teal-900/50 to-cyan-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-teal-500">
              <h3 className="text-xl sm:text-2xl font-bold text-teal-300 mb-3 sm:mb-4">🔄 The Harmonic Loop</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                Unlike most compositions that explore multiple keys and complex modulations, this passacaglia 
                stays firmly in <strong className="text-teal-300">A minor</strong> throughout. The same four-chord 
                progression repeats 9+ times.
              </p>
            </div>

            {/* Harmonic Journey Table */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-3 sm:mb-4">Harmonic Progression by Section</h3>
              <div className="space-y-2 sm:space-y-3">
                {harmonicJourney.map((section, idx) => (
                  <div key={idx} className="bg-cyan-900/20 rounded p-3 sm:p-4 border-l-4 border-cyan-500">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <h4 className="text-base sm:text-lg font-bold text-cyan-300">{section.section}</h4>
                      <span className="text-xs sm:text-sm bg-cyan-900/50 px-2 py-1 rounded">{section.progression}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <p className="text-slate-200"><strong className="text-blue-300">Function:</strong> {section.function}</p>
                      <p className="text-slate-200"><strong className="text-purple-300">Color:</strong> {section.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Analysis */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4">Modal Character: Natural Minor with Brief Major Touches</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-purple-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">Am (Tonic)</h4>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Appears:</strong> Bars 1-4 of each cycle</p>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Notes:</strong> A-C-E</p>
                  <p className="text-slate-300 text-xs">The home chord. Dark, introspective, melancholic. Pure natural minor sound.</p>
                </div>
                <div className="bg-blue-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">C (Relative Major)</h4>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Appears:</strong> Bars 5-6 of each cycle</p>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Notes:</strong> C-E-G</p>
                  <p className="text-slate-300 text-xs">Brief brightness. The "hope" moment. Same notes as Am scale but major triad.</p>
                </div>
                <div className="bg-teal-900/30 rounded p-3 sm:p-4">
                  <h4 className="text-base sm:text-lg font-bold text-teal-300 mb-2 sm:mb-3">E (Dominant)</h4>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Appears:</strong> Bars 7-8 of each cycle</p>
                  <p className="text-slate-200 text-xs sm:text-sm mb-1 sm:mb-2"><strong>Notes:</strong> E-G#-B</p>
                  <p className="text-slate-300 text-xs">The tension. G# is raised 7th (leading tone) - pulls back to A. Creates harmonic drive.</p>
                </div>
              </div>

              <div className="bg-teal-900/30 rounded p-3 sm:p-4 md:p-5 border-2 border-teal-500">
                <h4 className="text-lg sm:text-xl font-bold text-teal-300 mb-2 sm:mb-3">The G# Moment: Harmonic Pivot</h4>
                <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                  The most important note in the entire harmonic scheme is <strong className="text-teal-300">G#</strong> 
                  (bars 7-8 of each cycle). This is the only chromatic note - all others belong to A natural minor.
                </p>
                <p className="text-slate-200 mb-2 sm:mb-3 text-sm sm:text-base">
                  G# creates the <strong className="text-cyan-300">leading tone</strong> - a half-step below A. 
                  This half-step interval has MAGNETIC pull. When you hear G#, your ear EXPECTS A to follow.
                </p>
                <p className="text-slate-300 text-xs sm:text-sm italic">
                  This is why Cell E (F#→G#) appears at bar 9, 17, 25, etc. - always at the cycle's end. 
                  It's the harmonic signpost: "One cycle complete. Next cycle beginning."
                </p>
              </div>
            </div>

            {/* Voice Leading */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-3 sm:mb-4">Voice Leading: Smooth Harmonic Motion</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-green-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-green-300 mb-2 sm:mb-3">Am → Am (Bars 1-4)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-green-300">No change!</strong> Tonic sustained for 4 bars. 
                    This is highly unusual - most progressions change every 1-2 bars.
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Effect: Establishes A minor SO strongly that when C major appears, it feels like a 
                    brief visit, not a modulation. We never leave home - just look out the window.
                  </p>
                </div>

                <div className="bg-blue-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-blue-300 mb-2 sm:mb-3">Am → C (Bars 4-5)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-blue-300">Common tone:</strong> E (present in both chords).
                  </p>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-blue-300">Movement:</strong> A→C (up 3 semitones), C→E (up 4 semitones).
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Effect: Smooth stepwise motion. The E sustains (common tone) while A and C shift minimally. 
                    This is efficient voice leading - no big leaps.
                  </p>
                </div>

                <div className="bg-cyan-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3">C → E (Bars 6-7)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-cyan-300">Common tone:</strong> E again!
                  </p>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-cyan-300">Movement:</strong> C→B (down 1 semitone), G→G# (up 1 semitone).
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Effect: MOST important transition. The G→G# chromatic shift is what creates the "pull" 
                    back to A. Minimal motion (1 semitone) creates maximum harmonic effect.
                  </p>
                </div>

                <div className="bg-purple-900/30 rounded p-3 sm:p-4 md:p-5">
                  <h4 className="text-base sm:text-lg font-bold text-purple-300 mb-2 sm:mb-3">E → Am (Bars 8-1)</h4>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-purple-300">Resolution:</strong> The dominant (E) resolves to tonic (Am).
                  </p>
                  <p className="text-slate-200 mb-1 sm:mb-2 text-sm sm:text-base">
                    <strong className="text-purple-300">Movement:</strong> G#→A (up 1 semitone - leading tone resolution), 
                    B→C (up 1 semitone), E→E (stays).
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Effect: Classic V→i resolution. The G#→A movement is THE most satisfying harmonic motion 
                    in the entire piece. This is what makes the cycle feel complete.
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-green-900/40 to-cyan-900/40 rounded p-4 sm:p-6 border-2 border-green-500">
                <h4 className="text-lg sm:text-xl font-bold text-green-300 mb-2 sm:mb-3 text-center">
                  Why This Progression is Hypnotic
                </h4>
                <p className="text-slate-200 text-center text-base sm:text-lg">
                  The Am→Am→C→E→Am progression creates a feeling of <strong className="text-cyan-300">eternal return</strong>. 
                  You end where you began, but the journey between creates just enough variety to stay interesting. 
                  It's like breathing: inhale (tension with E), exhale (resolution to Am). Repeat forever.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MATHEMATICAL PATTERNS - Mobile Responsive */}
        {activeView === 'patterns' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-3 sm:mb-4 text-center sm:text-left">Mathematical Patterns: The Hidden Architecture</h2>
            
            <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-amber-500">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-300 mb-3 sm:mb-4">🔢 Numbers Don't Lie</h3>
              <p className="text-lg sm:text-xl text-slate-200 mb-3 sm:mb-4">
                This composition contains precise mathematical structures that create subconscious satisfaction. 
                The patterns are invisible to casual listening but FELT by the brain.
              </p>
            </div>

            {mathematicalPatterns.map((pattern, idx) => (
              <div key={idx} className="bg-slate-800/70 rounded-lg p-4 sm:p-6 border-l-4 border-amber-500">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-300 mb-3 sm:mb-4">{pattern.pattern}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-amber-900/30 rounded p-3 sm:p-4">
                    <h4 className="text-base sm:text-lg font-bold text-amber-300 mb-2 sm:mb-3">Discovery</h4>
                    <p className="text-slate-200 text-sm sm:text-base">{pattern.discovery}</p>
                  </div>
                  
                  <div className="bg-orange-900/30 rounded p-3 sm:p-4">
                    <h4 className="text-base sm:text-lg font-bold text-orange-300 mb-2 sm:mb-3">Significance</h4>
                    <p className="text-slate-200 text-sm sm:text-base">{pattern.significance}</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 bg-black/40 rounded p-3 sm:p-4">
                  <p className="text-slate-300 text-xs sm:text-sm">
                    <strong className="text-amber-300">Formula:</strong> {pattern.formula}
                  </p>
                </div>
              </div>
            ))}

            {/* Texture Density Chart */}
            <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-3 sm:mb-4">Texture Density Evolution</h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={textureDensity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="bar" stroke="#888" fontSize={10} />
                    <YAxis stroke="#888" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }} />
                    <Bar dataKey="complexity" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs sm:text-sm text-cyan-300 text-center mt-2 sm:mt-3">
                Complexity peaks at bar 43 (polyrhythmic climax), then gradually simplifies
              </p>
            </div>

            {/* Golden Ratio Analysis */}
            <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 rounded-lg p-4 sm:p-6 border-2 border-yellow-500">
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-3 sm:mb-4">📐 The Golden Ratio Moment</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-yellow-900/40 rounded p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-1 sm:mb-2">0.618</div>
                  <div className="text-xs sm:text-sm text-slate-300">Golden Ratio (φ)</div>
                </div>
                <div className="bg-amber-900/40 rounded p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-300 mb-1 sm:mb-2">46</div>
                  <div className="text-xs sm:text-sm text-slate-300">Bar at φ (74 × 0.618)</div>
                </div>
                <div className="bg-yellow-900/40 rounded p-3 sm:p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-1 sm:mb-2">43-48</div>
                  <div className="text-xs sm:text-sm text-slate-300">Complexity peak</div>
                </div>
              </div>
              <p className="text-slate-200 text-center text-sm sm:text-base">
                The most complex section (bars 43-48) occurs almost exactly at the golden ratio point. 
                This creates the most satisfying dramatic arc - not too early, not too late, but 
                at the mathematically "perfect" moment of maximum impact.
              </p>
            </div>
          </div>
        )}

        {/* SUMMARY - Mobile Responsive */}
        {activeView === 'summary' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-rose-300 mb-3 sm:mb-4 text-center">Summary: Why This Works</h2>
            
            <div className="bg-gradient-to-br from-rose-900/70 via-pink-900/70 to-purple-900/70 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-rose-500">
              <h3 className="text-2xl sm:text-3xl font-bold text-rose-300 mb-4 sm:mb-6 text-center">🎯 The Core Genius</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-black/40 rounded-lg p-3 sm:p-4 md:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-cyan-300 mb-3 sm:mb-4">What NEVER Changes</h4>
                  <ul className="space-y-1 sm:space-y-2 text-slate-200 text-sm sm:text-base">
                    <li>• <strong className="text-cyan-300">Ground bass pattern:</strong> 8-bar cycle, always identical</li>
                    <li>• <strong className="text-cyan-300">Harmonic progression:</strong> Am-Am-C-E-Am, never deviates</li>
                    <li>• <strong className="text-cyan-300">Bass velocity:</strong> 31 only, subtle and constant</li>
                    <li>• <strong className="text-cyan-300">Time signature:</strong> 4/4 throughout</li>
                    <li>• <strong className="text-cyan-300">Left hand role:</strong> Pure foundation, never melodic</li>
                  </ul>
                  <p className="text-cyan-300 mt-3 sm:mt-4 italic text-sm sm:text-base">= The eternal foundation</p>
                </div>

                <div className="bg-black/40 rounded-lg p-3 sm:p-4 md:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-pink-300 mb-3 sm:mb-4">What CONSTANTLY Changes</h4>
                  <ul className="space-y-1 sm:space-y-2 text-slate-200 text-sm sm:text-base">
                    <li>• <strong className="text-pink-300">Melodic cells:</strong> 5 different patterns that recombine</li>
                    <li>• <strong className="text-pink-300">Register:</strong> Climbs from middle to high, descends, rises again</li>
                    <li>• <strong className="text-pink-300">Texture:</strong> From 2 voices to 7, simple to polyrhythmic</li>
                    <li>• <strong className="text-pink-300">Emotional arc:</strong> Question→answer→struggle→wisdom→peace</li>
                    <li>• <strong className="text-pink-300">Right hand patterns:</strong> 6 different textural approaches</li>
                  </ul>
                  <p className="text-pink-300 mt-3 sm:mt-4 italic text-sm sm:text-base">= The transforming journey</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 sm:p-6 border-2 border-purple-400">
                <h4 className="text-lg sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4 text-center">The Paradox of Limitation</h4>
                <p className="text-lg sm:text-xl text-slate-200 text-center leading-relaxed">
                  By <strong className="text-purple-300">LOCKING the harmony</strong>, the composer freed the melody. 
                  By <strong className="text-blue-300">REPEATING the bass</strong>, they created infinite variation above. 
                  By <strong className="text-cyan-300">CONSTRAINING the foundation</strong>, they enabled boundless imagination.
                </p>
                <p className="text-slate-300 text-center mt-3 sm:mt-4 italic text-base sm:text-lg">
                  This is the essence of the passacaglia form: limitation as liberation.
                </p>
              </div>
            </div>

            {/* Final Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg p-3 sm:p-4 text-center border-2 border-cyan-500">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300 mb-1 sm:mb-2">9+</div>
                <div className="text-xs sm:text-sm text-slate-300">Complete cycles</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-3 sm:p-4 text-center border-2 border-purple-500">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-300 mb-1 sm:mb-2">5</div>
                <div className="text-xs sm:text-sm text-slate-300">Melodic cells</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-3 sm:p-4 text-center border-2 border-green-500">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-300 mb-1 sm:mb-2">50+</div>
                <div className="text-xs sm:text-sm text-slate-300">Semitone span</div>
              </div>
              <div className="bg-gradient-to-br from-rose-900/50 to-orange-900/50 rounded-lg p-3 sm:p-4 text-center border-2 border-rose-500">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-rose-300 mb-1 sm:mb-2">74</div>
                <div className="text-xs sm:text-sm text-slate-300">Total bars</div>
              </div>
            </div>

            {/* Why It's Mesmerizing */}
            <div className="bg-slate-800/70 rounded-lg p-4 sm:p-6 md:p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-4 sm:mb-6 text-center">Why This Gets Billions of Streams</h3>
              
              <div className="space-y-3 sm:space-y-4 text-slate-200 text-base sm:text-lg">
                <p>
                  <strong className="text-amber-300">1. Instant Recognition, Infinite Discovery:</strong> The ground bass 
                  creates familiarity - your brain quickly learns the 8-bar pattern. But the melody above NEVER repeats 
                  exactly the same way. You recognize the structure while discovering new details.
                </p>
                <p>
                  <strong className="text-orange-300">2. Perfect for Background Listening:</strong> The unchanging harmony 
                  means you don't need to "follow" chord changes. It works for studying, relaxing, or active listening. 
                  The same piece serves multiple purposes.
                </p>
                <p>
                  <strong className="text-rose-300">3. Emotional Universality:</strong> The piece tells a story everyone 
                  understands without words: departure, struggle, transformation, return. The hero's journey is built 
                  into the register evolution.
                </p>
                <p>
                  <strong className="text-purple-300">4. Mathematical Satisfaction:</strong> The 8-bar cycles, golden 
                  ratio climax, and symmetrical arch form create subconscious pleasure. Your brain LOVES patterns, 
                  and this piece is pattern perfection.
                </p>
                <p>
                  <strong className="text-cyan-300">5. Timeless Form, Modern Sound:</strong> Passacaglia is 400+ years old 
                  (Baroque era), but this feels contemporary. By using minimalist techniques (repetition, gradual variation) 
                  with classical form, it bridges centuries.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-900/40 to-rose-900/40 rounded-lg border-2 border-amber-500">
                <p className="text-xl sm:text-2xl text-amber-300 font-bold text-center mb-3 sm:mb-4">
                  The Ultimate Achievement
                </p>
                <p className="text-lg sm:text-xl text-slate-200 text-center leading-relaxed">
                  To create something that's simultaneously <strong className="text-cyan-300">simple enough for anyone</strong> 
                  to enjoy and <strong className="text-purple-300">complex enough for musicians</strong> 
                  to study - that's the mark of genius. This passacaglia achieves exactly that.
                </p>
                <p className="text-base sm:text-lg text-slate-300 text-center mt-3 sm:mt-4 italic">
                  74 bars. One bass line. Infinite beauty.
                </p>
              </div>
            </div>

            {/* The Eternal Quality */}
            <div className="bg-gradient-to-br from-blue-900/70 via-cyan-900/70 to-teal-900/70 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-blue-500">
              <h3 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-4 sm:mb-6 text-center">🌊 The Eternal Quality</h3>
              
              <div className="space-y-4 sm:space-y-6 text-slate-200 text-base sm:text-lg">
                <p className="text-center leading-relaxed">
                  The final bars don't "end" - they simply stop. The ground bass could continue forever. 
                  This is intentional. The passacaglia represents cyclical time: the waves on a beach, 
                  the turning of seasons, the heartbeat, the breath.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-6">
                  <div className="bg-blue-900/40 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌊</div>
                    <div className="font-bold text-blue-300 text-sm sm:text-base">Like Waves</div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-1 sm:mt-2">Each cycle crashes and recedes</div>
                  </div>
                  <div className="bg-cyan-900/40 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🫁</div>
                    <div className="font-bold text-cyan-300 text-sm sm:text-base">Like Breathing</div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-1 sm:mt-2">Inhale tension, exhale release</div>
                  </div>
                  <div className="bg-teal-900/40 rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💫</div>
                    <div className="font-bold text-teal-300 text-sm sm:text-base">Like Seasons</div>
                    <div className="text-xs sm:text-sm text-slate-300 mt-1 sm:mt-2">Always returning, never identical</div>
                  </div>
                </div>

                <p className="text-center leading-relaxed">
                  The piece could loop back to bar 1 and continue. In fact, many listeners DO loop it - 
                  and it works seamlessly. This is music that doesn't impose a beginning or end, 
                  but invites you to join and leave whenever you wish.
                </p>

                <div className="bg-black/40 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
                  <p className="text-xl sm:text-2xl text-cyan-300 font-bold text-center mb-2 sm:mb-3">
                    "The ground bass is not a repetition - it's a constant."
                  </p>
                  <p className="text-slate-300 text-center italic text-sm sm:text-base">
                    Like gravity, like time, like the earth beneath your feet. It doesn't repeat because it never stops.
                  </p>
                </div>
              </div>
            </div>

            {/* Final Wisdom */}
            <div className="bg-gradient-to-r from-purple-900/70 to-pink-900/70 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-purple-500">
              <h3 className="text-2xl sm:text-3xl font-bold text-purple-300 mb-4 sm:mb-6 text-center">🎼 Lessons from the Passacaglia</h3>
              
              <div className="space-y-3 sm:space-y-4 text-slate-200">
                <div className="bg-black/40 rounded-lg p-3 sm:p-4 md:p-5">
                  <p className="text-lg sm:text-xl font-bold text-purple-300 mb-1 sm:mb-2">For Composers:</p>
                  <p className="text-sm sm:text-base">Constraint breeds creativity. Lock down ONE element (harmony, rhythm, structure) 
                  and you free everything else. The ground bass is not a prison - it's a platform from which to soar.</p>
                </div>

                <div className="bg-black/40 rounded-lg p-3 sm:p-4 md:p-5">
                  <p className="text-lg sm:text-xl font-bold text-pink-300 mb-1 sm:mb-2">For Listeners:</p>
                  <p className="text-sm sm:text-base">The most profound experiences often come from simple materials, endlessly varied. 
                  You don't need complex harmony to create complex emotions. Sometimes, depth comes from 
                  repetition + transformation.</p>
                </div>

                <div className="bg-black/40 rounded-lg p-3 sm:p-4 md:p-5">
                  <p className="text-lg sm:text-xl font-bold text-blue-300 mb-1 sm:mb-2">For Everyone:</p>
                  <p className="text-sm sm:text-base">Life itself is a passacaglia. The days cycle, the seasons return, the heart beats. 
                  The foundation is constant, but what we build above it - the melody of our days - 
                  that's where the art happens. Same structure, infinite variations.</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 bg-gradient-to-r from-rose-900/50 to-orange-900/50 rounded-lg p-4 sm:p-6 border-2 border-rose-500">
                <p className="text-2xl sm:text-3xl text-rose-300 font-bold text-center mb-3 sm:mb-4">
                  Final Verdict: 98/100
                </p>
                <p className="text-lg sm:text-xl text-slate-200 text-center mb-3 sm:mb-4">
                  A masterclass in how to create infinite variety from minimal materials.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  <div className="bg-rose-900/40 rounded p-2 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-rose-300">100</div>
                    <div className="text-xs text-slate-300">Form Mastery</div>
                  </div>
                  <div className="bg-orange-900/40 rounded p-2 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-300">98</div>
                    <div className="text-xs text-slate-300">Melodic Craft</div>
                  </div>
                  <div className="bg-yellow-900/40 rounded p-2 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-300">100</div>
                    <div className="text-xs text-slate-300">Architecture</div>
                  </div>
                  <div className="bg-green-900/40 rounded p-2 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-300">95</div>
                    <div className="text-xs text-slate-300">Emotional Arc</div>
                  </div>
                  <div className="bg-blue-900/40 rounded p-2 sm:p-3 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-300">97</div>
                    <div className="text-xs text-slate-300">Listenability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Passacaglia;