import { FC, Fragment, useCallback, useEffect, useRef, useState } from 'react';

import { RewardMap, RewardType, SortedRewards, getRandomReward } from '@/components/rewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MoneyBag {
  x: number;
  y: number;
  type: RewardType;
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
  collection: Record<RewardType, number>;
}

interface GameParams {
  cartSpeed: number;
  cartFriction: number;
  cartMaxSpeed: number;
  itemFallSpeed: number;
  moneySpawnRate: number;
  bombSpawnRate: number;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const CART_WIDTH = 100;
const CART_HEIGHT = 60;
const MONEY_SIZE = 40;
const BOMB_SIZE = 30;

const DEFAULT_PARAMS: GameParams = {
  cartSpeed: 0.5,
  cartFriction: 0.98,
  cartMaxSpeed: 5,
  itemFallSpeed: 3,
  moneySpawnRate: 0.02,
  bombSpawnRate: 0.01,
};

const DefaultGameState: GameState = {
  isGameOver: false,
  score: 0,
  cartX: GAME_WIDTH / 2,
  cartVelocity: 0,
  moneyBags: [],
  bombs: [],
  goblinX: 0,
  goblinDirection: 1,
  collection: SortedRewards.reduce((acc, reward) => {
    acc[reward.type] = 0;
    return acc;
  }, {} as Record<RewardType, number>),
};

const MoneyGame: FC = () => {
  const [gameParams, setGameParams] = useState<GameParams>(DEFAULT_PARAMS);
  const [gameState, setGameState] = useState<GameState>({ ...DefaultGameState });

  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') {
        setIsMovingLeft(true);
      }
      if (e.key === 'ArrowRight') {
        setIsMovingRight(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') {
        setIsMovingLeft(false);
      }
      if (e.key === 'ArrowRight') {
        setIsMovingRight(false);
      }
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
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      lastTimeRef.current = timestamp;

      setGameState((prevState) => {
        if (prevState.isGameOver) {
          return prevState;
        }

        // Update cart velocity with inertia
        let newVelocity = prevState.cartVelocity;
        if (isMovingLeft) {
          newVelocity -= gameParams.cartSpeed;
        }
        if (isMovingRight) {
          newVelocity += gameParams.cartSpeed;
        }
        newVelocity *= gameParams.cartFriction;
        newVelocity = Math.max(Math.min(newVelocity, gameParams.cartMaxSpeed), -gameParams.cartMaxSpeed);

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
        if (Math.random() < gameParams.moneySpawnRate) {
          const newReward = getRandomReward();
          newMoneyBags.push({
            x: Math.random() * (GAME_WIDTH - MONEY_SIZE),
            y: -MONEY_SIZE,
            type: newReward.type,
          });
        }

        // Spawn bombs from goblin
        const newBombs = [...prevState.bombs];
        if (Math.random() < gameParams.bombSpawnRate) {
          newBombs.push({
            x: newGoblinX,
            y: BOMB_SIZE,
          });
        }

        // Update positions and check collisions
        let newScore = prevState.score;
        let gameOver = false;
        const collection: Record<RewardType, number> = Object.values(RewardType).reduce((acc, type) => {
          acc[type] = prevState.collection[type];
          return acc;
        }, {} as Record<RewardType, number>);

        // Update money bags
        const updatedMoneyBags = newMoneyBags.filter((bag) => {
          bag.y += gameParams.itemFallSpeed;

          // Check collision with cart
          if (
            bag.y + MONEY_SIZE > GAME_HEIGHT - CART_HEIGHT &&
            bag.x + MONEY_SIZE > newCartX - CART_WIDTH / 2 &&
            bag.x < newCartX + CART_WIDTH / 2
          ) {
            newScore += RewardMap[bag.type].value;
            collection[bag.type]++;
            return false;
          }

          return bag.y < GAME_HEIGHT;
        });

        // Update bombs
        const updatedBombs = newBombs.filter((bomb) => {
          bomb.y += gameParams.itemFallSpeed;

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
          collection,
        };
      });

      gameLoopRef.current = requestAnimationFrame(updateGame);
    },
    [isMovingLeft, isMovingRight, gameParams]
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
    setGameState({ ...DefaultGameState });
    lastTimeRef.current = 0;
  };

  return (
    <div className="flex flex-col justify-center p-4">
      {/* Game Area */}
      <div className="flex flex-col items-center">
        <div className="mb-2 text-2xl font-bold">Score: {gameState.score}</div>
        <div
          className="relative bg-blue-100 rounded-lg overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2" style={{ fontSize: '40px' }}>
            💰
          </div>

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
              {RewardMap[bag.type].emoji}
            </div>
          ))}

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

        <div className="m-4 text-gray-600">Use left and right arrow keys to move the cart</div>
        <div className="flex gap-8" style={{ width: `${GAME_WIDTH}px` }}>
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Game Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cart Speed</label>
                <Slider
                  value={[gameParams.cartSpeed * 100]}
                  onValueChange={(value) =>
                    setGameParams((prev) => ({
                      ...prev,
                      cartSpeed: value[0] / 100,
                    }))
                  }
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cart Max Speed</label>
                <Slider
                  value={[gameParams.cartMaxSpeed * 10]}
                  onValueChange={(value) =>
                    setGameParams((prev) => ({
                      ...prev,
                      cartMaxSpeed: value[0] / 10,
                    }))
                  }
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Fall Speed</label>
                <Slider
                  value={[gameParams.itemFallSpeed * 10]}
                  onValueChange={(value) =>
                    setGameParams((prev) => ({
                      ...prev,
                      itemFallSpeed: value[0] / 10,
                    }))
                  }
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Money Spawn Rate</label>
                <Slider
                  value={[gameParams.moneySpawnRate * 1000]}
                  onValueChange={(value) =>
                    setGameParams((prev) => ({
                      ...prev,
                      moneySpawnRate: value[0] / 1000,
                    }))
                  }
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bomb Spawn Rate</label>
                <Slider
                  value={[gameParams.bombSpawnRate * 1000]}
                  onValueChange={(value) =>
                    setGameParams((prev) => ({
                      ...prev,
                      bombSpawnRate: value[0] / 1000,
                    }))
                  }
                  max={100}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Collection Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(gameState.collection).map(([type, count], index) => (
                <Fragment key={type}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span style={{ fontSize: '24px' }}>{RewardMap[type as RewardType].emoji}</span>
                      {RewardMap[type as RewardType].name}
                    </span>
                    <span className="font-bold">{count}</span>
                  </div>
                  {index < Object.keys(gameState.collection).length - 1 && <Separator />}
                </Fragment>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoneyGame;
