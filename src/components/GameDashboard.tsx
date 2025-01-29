import { Dispatch, FC, Fragment, SetStateAction } from 'react';

import { RewardMap, RewardType } from '@/components/rewards';
import { GameParams, GameState } from '@/components/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

import { BOMB_SIZE, CART_HEIGHT, CART_WIDTH, GAME_HEIGHT, GAME_WIDTH, MONEY_SIZE } from './constants';

interface GameDashboardProps {
  gameState: GameState;
  gameParams: GameParams;
  setGameParams: Dispatch<SetStateAction<GameParams>>;

  restartGame(): void;
}

const GameDashboard: FC<GameDashboardProps> = ({ gameState, gameParams, setGameParams, restartGame }) => {
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

export default GameDashboard;
