import React, { useState, useEffect, Suspense, lazy } from 'react';
import HomePage from './pages/HomePage';

// --- Lazy-loaded Tool Components ---
const TextMidiConverter  = lazy(() => import('./Components/TextMidiConverter'));
const MidiToTextConverter= lazy(() => import('./Components/MidiToTextConverter'));
const ComptineDun        = lazy(() => import('./Components/ComptineDun'));
const Primavera          = lazy(() => import('./Components/Primavera'));
const Passacaglia        = lazy(() => import('./Components/Passacaglia'));
const OOPStudyGuide      = lazy(() => import('./Components/OOPStudyGuide'));
const Texttojson         = lazy(() => import('./Components/Texttojson'));
const Jsontotext         = lazy(() => import('./Components/Jsontotext'));
const Jsontomidi         = lazy(() => import('./Components/Jsontomidi'));
const Miditojson         = lazy(() => import('./Components/Miditojson'));
const Aidevmastery       = lazy(() => import('./Components/Aidevmastery'));
const Mixing             = lazy(() => import('./Components/Mixing'));    

// Placeholder for missing / coming-soon components
const PlaceholderTool = ({ title }) => (
  <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">{title}</h2>
      <p className="text-lg text-gray-600">This tool is coming soon or does not exist.</p>
    </div>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex justify-center items-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-700">Loading tool...</p>
    </div>
  </div>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // Initialise page from URL on first load
  useEffect(() => {
    const path = decodeURIComponent(window.location.pathname.substring(1)) || 'home';
    setCurrentPage(path);
  }, []);

  // Navigation handler
  const handleNavigate = (page) => {
    setCurrentPage(page);
    const pathSegment = page === 'home' ? '' : encodeURIComponent(page);
    window.history.pushState({}, '', `/${pathSegment}`);
    window.scrollTo(0, 0);
  };

  // Handle browser back / forward
  useEffect(() => {
    const handlePopState = () => {
      const path = decodeURIComponent(window.location.pathname.substring(1)) || 'home';
      setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route map
  const routes = {
    'home':                   () => <HomePage onNavigate={handleNavigate} />,
    'text-midi-converter':    () => <TextMidiConverter />,
    'midi-to-text-converter': () => <MidiToTextConverter />,
    'comptine-dun':           () => <ComptineDun />,
    'primavera':              () => <Primavera />,
    'passacaglia':            () => <Passacaglia />,
    'oop-study-guide':        () => <OOPStudyGuide />,
    'text-to-json':           () => <Texttojson />,
    'json-to-text':           () => <Jsontotext />,
    'json-to-midi':           () => <Jsontomidi />,
    'midi-to-json':           () => <Miditojson />,
    'ai-dev-mastery':         () => <Aidevmastery/>,
    'mixing':                 () => <Mixing/>,
  };

  const RenderedComponent = routes[currentPage]
    ? routes[currentPage]
    : () => <PlaceholderTool title="Page Not Found" />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RenderedComponent onNavigate={handleNavigate} />
    </Suspense>
  );
};

export default App;