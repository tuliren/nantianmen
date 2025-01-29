import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MoneyBag {
  x: number;
  y: number;
  value: number;
}

interface Bomb {
  x: number;
  y: number;
}

interface GameState {
  isGameOver: boolean;
  score: number;
  cartX: number;
  cartVelocity: number;
  moneyBags: MoneyBag[];
  bombs: Bomb[];
  goblinX: number;
  goblinDirection: number;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CART_WIDTH = 100;
const CART_HEIGHT = 60;
const MONEY_SIZE = 40;
const BOMB_SIZE = 30;
const CART_SPEED = 0.5;
const CART_FRICTION = 0.98;
const CART_MAX_SPEED = 5;
const ITEM_FALL_SPEED = 3;

const MoneyGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    isGameOver: false,
    score: 0,
    cartX: GAME_WIDTH / 2,
    cartVelocity: 0,
    moneyBags: [],
    bombs: [],
    goblinX: 0,
    goblinDirection: 1,
  });

  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') setIsMovingLeft(true);
      if (e.key === 'ArrowRight') setIsMovingRight(true);
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') setIsMovingLeft(false);
      if (e.key === 'ArrowRight') setIsMovingRight(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const updateGame = useCallback(
    (timestamp: number): void => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;

      setGameState((prevState) => {
        if (prevState.isGameOver) return prevState;

        // Update cart velocity with inertia
        let newVelocity = prevState.cartVelocity;
        if (isMovingLeft) newVelocity -= CART_SPEED;
        if (isMovingRight) newVelocity += CART_SPEED;
        newVelocity *= CART_FRICTION;
        newVelocity = Math.max(Math.min(newVelocity, CART_MAX_SPEED), -CART_MAX_SPEED);

        // Update cart position
        let newCartX = prevState.cartX + newVelocity;
        newCartX = Math.max(CART_WIDTH / 2, Math.min(newCartX, GAME_WIDTH - CART_WIDTH / 2));

        // Update goblin position
        let newGoblinX = prevState.goblinX + prevState.goblinDirection * 2;
        let newGoblinDirection = prevState.goblinDirection;
        if (newGoblinX <= 0 || newGoblinX >= GAME_WIDTH) {
          newGoblinDirection *= -1;
          newGoblinX = prevState.goblinX + newGoblinDirection * 2;
        }

        // Spawn new money bags randomly
        const newMoneyBags = [...prevState.moneyBags];
        if (Math.random() < 0.02) {
          newMoneyBags.push({
            x: Math.random() * (GAME_WIDTH - MONEY_SIZE),
            y: -MONEY_SIZE,
            value: Math.floor(Math.random() * 3) + 1, // 1 to 3 value
          });
        }

        // Spawn bombs from goblin
        const newBombs = [...prevState.bombs];
        if (Math.random() < 0.01) {
          newBombs.push({
            x: newGoblinX,
            y: BOMB_SIZE,
          });
        }

        // Update positions and check collisions
        let newScore = prevState.score;
        let gameOver = false;

        // Update money bags
        const updatedMoneyBags = newMoneyBags.filter((bag) => {
          bag.y += ITEM_FALL_SPEED;

          // Check collision with cart
          if (
            bag.y + MONEY_SIZE > GAME_HEIGHT - CART_HEIGHT &&
            bag.x + MONEY_SIZE > newCartX - CART_WIDTH / 2 &&
            bag.x < newCartX + CART_WIDTH / 2
          ) {
            newScore += bag.value;
            return false;
          }

          return bag.y < GAME_HEIGHT;
        });

        // Update bombs
        const updatedBombs = newBombs.filter((bomb) => {
          bomb.y += ITEM_FALL_SPEED;

          // Check collision with cart
          if (
            bomb.y + BOMB_SIZE > GAME_HEIGHT - CART_HEIGHT &&
            bomb.x + BOMB_SIZE > newCartX - CART_WIDTH / 2 &&
            bomb.x < newCartX + CART_WIDTH / 2
          ) {
            gameOver = true;
            return false;
          }

          return bomb.y < GAME_HEIGHT;
        });

        return {
          ...prevState,
          cartX: newCartX,
          cartVelocity: newVelocity,
          moneyBags: updatedMoneyBags,
          bombs: updatedBombs,
          goblinX: newGoblinX,
          goblinDirection: newGoblinDirection,
          score: newScore,
          isGameOver: gameOver,
        };
      });

      gameLoopRef.current = requestAnimationFrame(updateGame);
    },
    [isMovingLeft, isMovingRight]
  );

  // Start/stop game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateGame]);

  const restartGame = (): void => {
    setGameState({
      isGameOver: false,
      score: 0,
      cartX: GAME_WIDTH / 2,
      cartVelocity: 0,
      moneyBags: [],
      bombs: [],
      goblinX: 0,
      goblinDirection: 1,
    });
    lastTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="mb-4 text-2xl font-bold">Score: {gameState.score}</div>
      <div
        className="relative bg-blue-100 rounded-lg overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Money God (static at top) */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2" style={{ fontSize: '40px' }}>
          💰
        </div>

        {/* Goblin */}
        <div
          className="absolute"
          style={{
            left: gameState.goblinX,
            top: '20px',
            fontSize: '30px',
            transform: `scaleX(${gameState.goblinDirection})`,
          }}
        >
          👺
        </div>

        {/* Money Bags */}
        {gameState.moneyBags.map((bag, index) => (
          <div
            key={`money-${index}`}
            className="absolute"
            style={{
              left: bag.x,
              top: bag.y,
              fontSize: `${MONEY_SIZE}px`,
            }}
          >
            {bag.value === 3 ? '💎' : bag.value === 2 ? '💵' : '💰'}
          </div>
        ))}

        {/* Bombs */}
        {gameState.bombs.map((bomb, index) => (
          <div
            key={`bomb-${index}`}
            className="absolute"
            style={{
              left: bomb.x,
              top: bomb.y,
              fontSize: `${BOMB_SIZE}px`,
            }}
          >
            💣
          </div>
        ))}

        {/* Cart */}
        <div
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{
            left: gameState.cartX,
            width: CART_WIDTH,
            height: CART_HEIGHT,
            fontSize: '40px',
          }}
        >
          🛒
        </div>

        {/* Game Over Screen */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="mb-4">Final Score: {gameState.score}</p>
              <button onClick={restartGame} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-gray-600">Use left and right arrow keys to move the cart</div>
    </div>
  );
};

export default MoneyGame;
