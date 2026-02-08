import { useState, useEffect, useRef, useCallback } from "react";

// Heart animation component
function FallingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 20 + 15,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-fall text-red-500"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            fontSize: `${heart.size}px`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}

// Navigation dots component
function NavigationDots({ total, current, onNavigate }: { total: number; current: number; onNavigate: (index: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-40 flex-wrap justify-center max-w-[90vw] px-4">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === current
              ? "bg-pink-500 w-6"
              : "bg-white/50 hover:bg-white/80"
          }`}
        />
      ))}
    </div>
  );
}

// Glass card component
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl ${className}`}>
      {children}
    </div>
  );
}

export function App() {
  const [stage, setStage] = useState<"home" | "wrong" | "gallery" | "question" | "final">("home");
  const [name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [clickedNoOnce, setClickedNoOnce] = useState(false);
  const [showBadChoice, setShowBadChoice] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");
  const [showHearts, setShowHearts] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalPages = 35;
  const minSwipeDistance = 50;

  // Load captions from file
  useEffect(() => {
    fetch("./captions.txt")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split("\n").filter((line) => line.trim() !== "");
        setCaptions(lines);
      })
      .catch(() => {
        // Fallback captions if file not found
        setCaptions(Array.from({ length: 35 }, (_, i) => `Caption for photo ${i + 1}`));
      });
  }, []);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio("./song.mp3");
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.toLowerCase() === "prisha") {
      setStage("gallery");
      if (audioRef.current && !isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setStage("wrong");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (isRightSwipe && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else if (isLeftSwipe && currentPage === totalPages - 1) {
      setStage("question");
    }
  }, [touchStart, touchEnd, currentPage]);

  useEffect(() => {
    onTouchEnd();
  }, [touchEnd, onTouchEnd]);

  const handleYes = () => {
    if (clickedNoOnce) {
      setFinalMessage("Don't be a bad girl. Be the good pookie that you are. Okay, I will be your valentine too!");
    } else {
      setFinalMessage("Of course you will. I love you ❤️");
    }
    setStage("final");
    setShowHearts(true);
  };

  const handleNo = () => {
    setClickedNoOnce(true);
    setShowBadChoice(true);
  };

  const handleGoBack = () => {
    setShowBadChoice(false);
  };

  // Home page
  if (stage === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 30 + 20}px`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
        <GlassCard className="w-full max-w-md p-8 animate-fadeIn">
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">💕</div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Hey there! Who's this?
              </h1>
              <p className="text-white/80 text-sm">Enter your name to continue...</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 text-white placeholder-white/60 text-center text-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white text-pink-600 font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Enter ❤️
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  // Wrong name page
  if (stage === "wrong") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 animate-fadeIn">
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">😢</div>
            <h1 className="text-2xl font-bold text-white">
              This was not meant for you sadly
            </h1>
            <p className="text-white/60 text-sm">Redirecting...</p>
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-loading" />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Gallery page
  if (stage === "gallery") {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 flex flex-col items-center justify-center p-4 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {/* Music toggle button */}
        <button
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
        >
          {isPlaying ? "🔊" : "🔇"}
        </button>

        {/* Page indicator */}
        <div className="fixed top-4 left-4 z-50 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm">
          {currentPage + 1} / {totalPages}
        </div>

        <GlassCard className="w-full max-w-md mx-auto overflow-hidden animate-fadeIn">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl">
            <img
              src={`./${currentPage + 1}.jpg`}
              alt={`Photo ${currentPage + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Try jpeg if jpg fails
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.jpg')) {
                  target.src = `./${currentPage + 1}.jpeg`;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <div className="p-6 text-center">
            <p className="text-white text-lg font-medium leading-relaxed">
              {captions[currentPage] || `Memory ${currentPage + 1}`}
            </p>
          </div>
        </GlassCard>

        {/* Swipe hint */}
        <div className="mt-6 text-white/80 text-sm animate-pulse flex items-center gap-2">
          <span>←</span>
          <span>Swipe to navigate</span>
          <span>→</span>
        </div>

        {/* Navigation arrows for desktop */}
        <div className="fixed inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
          {currentPage > 0 && (
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              ←
            </button>
          )}
          <div />
          {currentPage < totalPages - 1 ? (
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              →
            </button>
          ) : (
            <button
              onClick={() => setStage("question")}
              className="pointer-events-auto px-4 py-2 rounded-full bg-white text-pink-600 font-bold hover:bg-white/90 transition-all"
            >
              Next ❤️
            </button>
          )}
        </div>

        <NavigationDots
          total={totalPages}
          current={currentPage}
          onNavigate={setCurrentPage}
        />
      </div>
    );
  }

  // Question page
  if (stage === "question") {
    if (showBadChoice) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-8 animate-fadeIn">
            <div className="text-center space-y-6">
              <div className="text-5xl mb-4">🤔</div>
              <h1 className="text-2xl font-bold text-white">
                Bad choice. Think carefully about your decision
              </h1>
              <button
                onClick={handleGoBack}
                className="w-full py-4 rounded-2xl bg-white text-pink-600 font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                Go Back 💭
              </button>
            </div>
          </GlassCard>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 40 + 20}px`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
        <GlassCard className="w-full max-w-md p-8 animate-fadeIn">
          <div className="text-center space-y-8">
            <div className="text-6xl mb-4 animate-bounce">💝</div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Will you be my Valentine?
            </h1>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleYes}
                className="flex-1 py-4 rounded-2xl bg-white text-pink-600 font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                Yes 💕
              </button>
              <button
                onClick={handleNo}
                className="flex-1 py-4 rounded-2xl bg-white/20 border border-white/40 text-white font-bold text-lg hover:bg-white/30 transition-all"
              >
                No 💔
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Final page
  if (stage === "final") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 flex items-center justify-center p-4 overflow-hidden">
        {showHearts && <FallingHearts />}
        <GlassCard className="w-full max-w-md p-8 animate-fadeIn z-10">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">💖</div>
            <h1 className="text-2xl font-bold text-white leading-relaxed">
              {finalMessage}
            </h1>
            <div className="text-4xl animate-pulse">
              ❤️ 💕 ❤️
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return null;
}
