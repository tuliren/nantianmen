import { FC, useCallback, useEffect, useRef, useState } from 'react';

import GameDashboard from '@/components/GameDashboard';
import {
  BOMB_SIZE,
  CART_HEIGHT,
  CART_WIDTH,
  DefaultGameParams,
  DefaultGameState,
  GAME_HEIGHT,
  GAME_WIDTH,
  MONEY_SIZE,
} from '@/components/constants';
import { RewardMap, RewardType, getRandomReward } from '@/components/rewards';
import { GameParams, GameState } from '@/components/types';

const MoneyGame: FC = () => {
  const [gameParams, setGameParams] = useState<GameParams>(DefaultGameParams);
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
    <GameDashboard
      gameState={gameState}
      gameParams={gameParams}
      setGameParams={setGameParams}
      restartGame={restartGame}
    />
  );
};

export default MoneyGame;
