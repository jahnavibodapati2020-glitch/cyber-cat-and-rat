import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
  { x: 5, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const SPEED = 100;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 14, y: 10 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [leaderboard, setLeaderboard] = useState<{initials: string, score: number}[]>([]);
  const [initials, setInitials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const directionRef = useRef(direction);
  const foodRef = useRef(food);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    if (currentSnake.length >= GRID_SIZE * GRID_SIZE) return; // You win!
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  useEffect(() => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(err => console.error(err));
  }, []);

  const submitScore = async () => {
    if (!initials || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initials, score })
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.highScores);
        setScoreSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setHasStarted(true);
    setIsPaused(false);
    setGlitch(false);
    setScoreSubmitted(false);
    setInitials('');
    generateFood(INITIAL_SNAKE);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showMenu) return; // Ignore inputs when in menu
      if (gameOver) return; // Allow typing in the input field when game is over

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }

      if (!hasStarted && !gameOver) {
        setHasStarted(true);
      }

      if (e.key === ' ' || e.key === 'Escape') {
        setIsPaused(p => !p);
        return;
      }

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, gameOver, showMenu]);

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted || showMenu) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          setScore(s => s + 16); // 16 bytes
          setGlitch(true);
          setTimeout(() => setGlitch(false), 150); // Short glitch on eat
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, SPEED);
    return () => clearInterval(intervalId);
  }, [gameOver, isPaused, hasStarted, generateFood]);

  const getRotation = (dir: Point) => {
    if (dir.x === 1) return '0deg';
    if (dir.x === -1) return '180deg';
    if (dir.y === 1) return '90deg';
    if (dir.y === -1) return '-90deg';
    return '0deg';
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-glitch-gray rounded-none border-4 border-glitch-cyan relative ${glitch ? 'screen-tear' : ''}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-glitch-magenta opacity-50" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-glitch-cyan opacity-50" />
      
      <div className="flex justify-between w-full mb-4 px-2 border-b-2 border-glitch-magenta pb-2">
        <h2 className="text-2xl font-bold text-glitch-cyan uppercase tracking-widest text-glitch-cyan">SECTOR_01</h2>
        <div className="text-xl font-mono text-glitch-magenta">
          BYTES: {score.toString().padStart(4, '0')}
        </div>
      </div>

      <div 
        className="relative bg-black border-2 border-glitch-cyan overflow-hidden"
        style={{
          width: `${GRID_SIZE * 20}px`,
          height: `${GRID_SIZE * 20}px`,
        }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--color-glitch-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--color-glitch-cyan) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Food (Rat) */}
        <div
          className="absolute flex items-center justify-center text-xl animate-wiggle z-0"
          style={{
            width: '20px',
            height: '20px',
            left: `${food.x * 20}px`,
            top: `${food.y * 20}px`,
            filter: 'drop-shadow(0 0 10px var(--color-glitch-magenta))',
          }}
        >
          🐭
        </div>

        {/* Snake (Cat) */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`absolute flex items-center justify-center ${isHead ? 'z-10 text-xl' : 'rainbow-body rounded-full'}`}
              style={{
                width: '20px',
                height: '20px',
                left: `${segment.x * 20}px`,
                top: `${segment.y * 20}px`,
                opacity: 1 - (index * 0.02),
                transform: isHead 
                  ? `rotate(${getRotation(direction)}) ${glitch ? 'scale(1.2)' : 'scale(1)'}` 
                  : 'scale(0.7)',
                filter: isHead ? 'drop-shadow(0 0 10px var(--color-glitch-cyan))' : 'none',
              }}
            >
              {isHead ? '🐱' : ''}
            </div>
          );
        })}

        {/* Overlays */}
        {showMenu && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
            <h3 className="text-4xl font-bold text-glitch-cyan mb-8 glitch-text" data-text="CYBER CAT">CYBER CAT</h3>
            <button
              onClick={() => {
                resetGame();
                setShowMenu(false);
              }}
              className="px-8 py-3 bg-glitch-black border-2 border-glitch-magenta text-glitch-magenta hover:bg-glitch-magenta hover:text-black transition-colors font-bold tracking-widest uppercase mb-4"
            >
              HUNT_RATS
            </button>
            {leaderboard.length > 0 && (
              <div className="mt-4 w-48">
                <h4 className="text-glitch-cyan text-center mb-2 border-b border-glitch-cyan pb-1 text-sm">HIGH SCORES</h4>
                {leaderboard.slice(0, 3).map((entry, i) => (
                  <div key={i} className="flex justify-between text-gray-400 text-xs my-1">
                    <span>{i + 1}. {entry.initials}</span>
                    <span>{entry.score}B</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasStarted && !gameOver && !showMenu && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center border-2 border-glitch-cyan p-4 bg-glitch-gray">
              <p className="text-glitch-cyan text-xl mb-2 animate-pulse">AWAITING INPUT</p>
              <p className="text-xs text-gray-400">INITIATE SEQUENCE</p>
            </div>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <p className="text-glitch-magenta text-3xl font-bold tracking-widest text-glitch-magenta">SUSPENDED</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center screen-tear z-50">
            <h3 className="text-5xl font-bold text-glitch-magenta mb-2 glitch-text" data-text="FATAL_ERR">FATAL_ERR</h3>
            <p className="text-xl text-glitch-cyan mb-4">DATA CORRUPTED: {score}B</p>
            
            {score > 0 && !scoreSubmitted && (
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm text-gray-400 mb-2">ENTER INITIALS</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={3} 
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    className="w-20 bg-transparent border-b-2 border-glitch-cyan text-center text-2xl text-glitch-cyan outline-none uppercase"
                    autoFocus
                  />
                  <button 
                    onClick={submitScore}
                    disabled={isSubmitting || initials.length === 0}
                    className="px-4 py-1 bg-glitch-cyan text-black font-bold disabled:opacity-50"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            )}

            {scoreSubmitted && leaderboard.length > 0 && (
              <div className="mb-6 w-64">
                <h4 className="text-glitch-magenta text-center mb-2 border-b border-glitch-magenta pb-1">TOP SCORES</h4>
                {leaderboard.map((entry, i) => (
                  <div key={i} className="flex justify-between text-glitch-cyan text-sm my-1">
                    <span>{i + 1}. {entry.initials}</span>
                    <span>{entry.score}B</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-glitch-black border-2 border-glitch-cyan text-glitch-cyan hover:bg-glitch-cyan hover:text-black transition-colors font-bold tracking-wider uppercase"
              >
                RESTART
              </button>
              <button
                onClick={() => {
                  setShowMenu(true);
                  setGameOver(false);
                }}
                className="px-6 py-2 bg-glitch-black border-2 border-glitch-magenta text-glitch-magenta hover:bg-glitch-magenta hover:text-black transition-colors font-bold tracking-wider uppercase"
              >
                MAIN_MENU
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-gray-500 text-xs flex gap-4 uppercase tracking-widest">
        <span><kbd className="border border-glitch-cyan text-glitch-cyan px-1">W,A,S,D</kbd> NAVIGATE</span>
        <span><kbd className="border border-glitch-magenta text-glitch-magenta px-1">SPACE</kbd> HALT</span>
      </div>
    </div>
  );
}
