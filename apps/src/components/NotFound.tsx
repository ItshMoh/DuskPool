import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative -mt-14">
      {/* Large 404 Text */}
      <h1
        className="text-[20vw] md:text-[25vw] font-black text-white leading-none tracking-tighter select-none"
        style={{
          textShadow: '0 0 100px rgba(255,255,255,0.1)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        404
      </h1>

      {/* Error Message */}
      <div className="text-center -mt-4 md:-mt-8">
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white mb-4">
          OOPS! PAGE NOT FOUND
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto px-4">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Go to Homepage Button */}
      <button
        onClick={() => navigate('/')}
        className="mt-10 group relative px-8 py-3 border border-white/20 bg-transparent hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-3"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-xs font-bold tracking-[0.2em] uppercase">
          Go to Homepage
        </span>
      </button>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Corner brackets */}
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border-l border-t border-white/5" />
        <div className="absolute top-1/4 right-1/4 w-20 h-20 border-r border-t border-white/5" />
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 border-l border-b border-white/5" />
        <div className="absolute bottom-1/4 right-1/4 w-20 h-20 border-r border-b border-white/5" />
      </div>
    </div>
  );
};

export default NotFound;
