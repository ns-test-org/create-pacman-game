'use client';

import { useEffect, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const INITIAL_PACMAN = { x: 10, y: 10 };
const INITIAL_GHOSTS = [
  { x: 5, y: 5, color: 'red' },
  { x: 15, y: 5, color: 'pink' },
  { x: 5, y: 15, color: 'cyan' },
  { x: 15, y: 15, color: 'orange' }
];

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function PacmanGame() {
  const [pacman, setPacman] = useState(INITIAL_PACMAN);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [ghosts, setGhosts] = useState(INITIAL_GHOSTS);
  const [pellets, setPellets] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize pellets
  useEffect(() => {
    const initialPellets = new Set<string>();
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (x !== INITIAL_PACMAN.x || y !== INITIAL_PACMAN.y) {
          initialPellets.add(`${x},${y}`);
        }
      }
    }
    setPellets(initialPellets);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || gameWon) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
          setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameWon]);

  // Move Pac-Man
  useEffect(() => {
    if (gameOver || gameWon) return;

    const interval = setInterval(() => {
      setPacman(prev => {
        let newX = prev.x;
        let newY = prev.y;

        switch (direction) {
          case 'UP':
            newY = Math.max(0, prev.y - 1);
            break;
          case 'DOWN':
            newY = Math.min(GRID_SIZE - 1, prev.y + 1);
            break;
          case 'LEFT':
            newX = Math.max(0, prev.x - 1);
            break;
          case 'RIGHT':
            newX = Math.min(GRID_SIZE - 1, prev.x + 1);
            break;
        }

        // Check pellet collision
        const key = `${newX},${newY}`;
        if (pellets.has(key)) {
          setPellets(prev => {
            const newPellets = new Set(prev);
            newPellets.delete(key);
            return newPellets;
          });
          setScore(s => s + 10);
        }

        return { x: newX, y: newY };
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, gameOver, gameWon, pellets]);

  // Move ghosts
  useEffect(() => {
    if (gameOver || gameWon) return;

    const interval = setInterval(() => {
      setGhosts(prev => prev.map(ghost => {
        const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as Direction[];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        
        let newX = ghost.x;
        let newY = ghost.y;

        switch (randomDir) {
          case 'UP':
            newY = Math.max(0, ghost.y - 1);
            break;
          case 'DOWN':
            newY = Math.min(GRID_SIZE - 1, ghost.y + 1);
            break;
          case 'LEFT':
            newX = Math.max(0, ghost.x - 1);
            break;
          case 'RIGHT':
            newX = Math.min(GRID_SIZE - 1, ghost.x + 1);
            break;
        }

        return { ...ghost, x: newX, y: newY };
      }));
    }, 300);

    return () => clearInterval(interval);
  }, [gameOver, gameWon]);

  // Check collisions
  useEffect(() => {
    const collision = ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y);
    if (collision) {
      setGameOver(true);
    }

    if (pellets.size === 0 && !gameWon) {
      setGameWon(true);
    }
  }, [pacman, ghosts, pellets, gameWon]);

  const resetGame = () => {
    setPacman(INITIAL_PACMAN);
    setDirection('RIGHT');
    setGhosts(INITIAL_GHOSTS);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    
    const initialPellets = new Set<string>();
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (x !== INITIAL_PACMAN.x || y !== INITIAL_PACMAN.y) {
          initialPellets.add(`${x},${y}`);
        }
      }
    }
    setPellets(initialPellets);
  };

  return (
    <div className="min-h-screen bg-purple-500 flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-white text-2xl font-bold">
        Score: {score}
      </div>
      
      <div 
        className="relative bg-gray-900 border-4 border-blue-500 shadow-2xl"
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Pellets */}
        {Array.from(pellets).map(key => {
          const [x, y] = key.split(',').map(Number);
          return (
            <div
              key={key}
              className="absolute bg-yellow-300 rounded-full"
              style={{
                left: x * CELL_SIZE + CELL_SIZE / 2 - 2,
                top: y * CELL_SIZE + CELL_SIZE / 2 - 2,
                width: 4,
                height: 4
              }}
            />
          );
        })}

        {/* Pac-Man */}
        <div
          className="absolute bg-yellow-400 rounded-full transition-all duration-150"
          style={{
            left: pacman.x * CELL_SIZE,
            top: pacman.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2
          }}
        />

        {/* Ghosts */}
        {ghosts.map((ghost, i) => (
          <div
            key={i}
            className="absolute rounded-t-full transition-all duration-300"
            style={{
              left: ghost.x * CELL_SIZE,
              top: ghost.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: ghost.color
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {(gameOver || gameWon) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <div className="text-white text-3xl font-bold mb-4">
              {gameWon ? '🎉 YOU WIN! 🎉' : 'GAME OVER'}
            </div>
            <div className="text-white text-xl mb-4">
              Final Score: {score}
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        <div className="mb-2">Use Arrow Keys or WASD to move</div>
        <div className="text-sm text-gray-400">Collect all pellets and avoid the ghosts!</div>
      </div>
    </div>
  );
}






