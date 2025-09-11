import React from 'react'

const HeroSection = () => {
  return (
    <section className="relative pt-20 pb-12 bg-gradient-to-br from-gray-50 via-white to-red-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 bg-red-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-5 right-10 w-48 h-48 bg-red-400 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-3 py-1.5 bg-red-100 text-red-800 text-sm font-medium rounded-full mb-4">
          🛠️ My Personal Dev Tools
        </span>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-red-800 bg-clip-text text-transparent mb-4 leading-tight">
          Client-Side <span className="text-red-600">File Converters</span>
        </h1>
      </div>
    </section>
  )
}

const ToolsGrid = ({ onNavigate }) => {
  const tools = [
    { name: 'Text-Midi Converter', path: 'text-midi-converter', icon: '🎵', desc: 'Convert Text files to MIDI format', color: 'from-red-500 to-red-600' },
    { name: 'Midi-Text Converter', path: 'midi-to-text-converter', icon: '🎵', desc: 'Convert MIDI files to Text format', color: 'from-red-500 to-red-600' },
    { name: 'Audio-Midi Converter', path: 'audio-midi-converter', icon: '🎶', desc: 'Convert Audio files to MIDI format', color: 'from-red-500 to-red-600' },
  ]

  return (
    <section id="tools" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-red-800 bg-clip-text text-transparent mb-4">
            Audio Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A small collection of personal audio file converters
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <div
              key={tool.path}
              onClick={() => onNavigate(tool.path)}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-200 hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <span className="text-white text-2xl">{tool.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{tool.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{tool.desc}</p>
              <div className="mt-4 flex items-center text-red-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Use now <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ToolsGrid onNavigate={onNavigate} />
    </div>
  )
}

export default HomePage