import React, { useState, useEffect, Suspense, lazy } from 'react';
import { SEOManager } from './utils/SEOManager';
import HomePage from './pages/HomePage'; // This remains eagerly loaded for the entry point

// --- Lazy-loaded Tool Components ---
const PdfToImageConverter = lazy(() => import('./Components/PdfToImageConverter'));
const PdfToTextConverter = lazy(() => import('./Components/PdfToTextConverter'));
const TextMidiConverter = lazy(() => import('./Components/TextMidiConverter'));
const MidiToTextConverter = lazy(() => import('./Components/MidiToTextConverter'));
const AudioMidiConverter = lazy(() => import('./Components/AudioMidiConverter'));

// Placeholder for missing components
const PlaceholderTool = ({ title }) => (
  <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-4 text-gray-800">{title}</h2>
      <p className="text-lg text-gray-600">This tool is coming soon or does not exist.</p>
    </div>
  </div>
);

// Main App component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // Initialize page based on URL
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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = decodeURIComponent(window.location.pathname.substring(1)) || 'home';
      setCurrentPage(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route components mapping
  const routes = {
    home: () => <HomePage onNavigate={handleNavigate} />,
    'pdf-to-image': () => <PdfToImageConverter />,
    'pdf-to-text': () => <PdfToTextConverter />,
    'text-midi-converter': () => <TextMidiConverter />,
    'midi-to-text-converter': () => <MidiToTextConverter />,
    'audio-midi-converter': () => <AudioMidiConverter />,
  };

  // Get current component. Render a 404 if not found.
  const RenderedComponent = routes[currentPage] ? routes[currentPage] : () => <PlaceholderTool title="Page Not Found" />;

  // Render the current page with SEO management and a suspense fallback
  return (
    <>
      <SEOManager pageKey={currentPage} />
      <Suspense
        fallback={
          <div className="min-h-screen flex justify-center items-center bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-700">Loading tool...</p>
            </div>
          </div>
        }
      >
        {<RenderedComponent onNavigate={handleNavigate} />}
      </Suspense>
    </>
  );
};

export default App;