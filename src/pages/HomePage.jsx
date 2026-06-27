import React from 'react'

const tools = [
  {
    name: 'Text → MIDI Converter',
    path: 'text-midi-converter',
    icon: '🎵',
    desc: 'Convert Text files to MIDI format',
    color: 'from-red-500 to-red-600',
  },
  {
    name: 'MIDI → Text Converter',
    path: 'midi-to-text-converter',
    icon: '🎶',
    desc: 'Convert MIDI files to Text format',
    color: 'from-rose-500 to-rose-600',
  },
  {
    name: "Comptine d'un autre été",
    path: 'comptine-dun',
    icon: '🎼',
    desc: "Detailed breakdown of Comptine d'un autre été",
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    name: 'Primavera',
    path: 'primavera',
    icon: '🌸',
    desc: 'A tool for Primavera analysis',
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Passacaglia',
    path: 'passacaglia',
    icon: '🎻',
    desc: 'Detailed breakdown of Passacaglia',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'OOP Study Guide',
    path: 'oop-study-guide',
    icon: '📘',
    desc: 'Comprehensive guide to Object-Oriented Programming concepts',
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Text → JSON',
    path: 'text-to-json',
    icon: '📄',
    desc: 'Convert MIDI text notation into Generation JSON for RAG knowledge base',
    color: 'from-emerald-500 to-cyan-600',
  },
  {
    name: 'JSON → Text',
    path: 'json-to-text',
    icon: '🔄',
    desc: 'Convert LLM Generation JSON back into your exact MIDI text format',
    color: 'from-pink-500 to-purple-600',
  },
  {
    name: 'JSON → MIDI',
    path: 'json-to-midi',
    icon: '🎹',
    desc: 'Convert Generation JSON directly into a downloadable .mid file',
    color: 'from-orange-500 to-amber-600',
  },
  {
    name: 'MIDI → JSON',
    path: 'midi-to-json',
    icon: '📂',
    desc: 'Upload a .mid file and extract its contents as Generation JSON',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    name: 'STRING → MIDI',
    path: 'string-to-midi',
    icon: '🎹',
    desc: 'Convert Generation String directly into a downloadable .mid file',
    color: 'from-orange-500 to-amber-600',
  },
  {
    name: 'MIDI → STRING',
    path: 'midi-to-string',
    icon: '📂',
    desc: 'Upload a .mid file and extract its contents as Generation String',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    name: 'Ai dev mastery',
    path: 'ai-dev-mastery',
    icon: '📂',
    desc: 'learn new dev',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    name: 'Mixing',
    path: 'mixing',
    icon: '📂',
    desc: 'mixing tips',
    color: 'from-teal-500 to-cyan-600',
  },
]

const ToolCard = ({ tool, onNavigate, index }) => (
  <div
    onClick={() => onNavigate(tool.path)}
    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-200 hover:scale-105"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div
      className={`w-14 h-14 bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
    >
      <span className="text-white text-2xl">{tool.icon}</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
      {tool.name}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed">{tool.desc}</p>
    <div className="mt-4 flex items-center text-red-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
      Use now <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
    </div>
  </div>
)

const ToolsGrid = ({ onNavigate }) => (
  <section id="tools" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-800 bg-clip-text text-transparent mb-4">
          My Personal Audio Tools & Track Breakdowns
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A small collection of personal audio file converters and detailed musical analyses of popular tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <ToolCard key={tool.path} tool={tool} onNavigate={onNavigate} index={index} />
        ))}
      </div>
    </div>
  </section>
)

const HomePage = ({ onNavigate }) => (
  <div className="min-h-screen bg-white">
    <ToolsGrid onNavigate={onNavigate} />
  </div>
)

export default HomePage