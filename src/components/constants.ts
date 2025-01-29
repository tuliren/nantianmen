import { RewardType, SortedRewards } from '@/components/rewards';
import { GameParams, GameState } from '@/components/types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;
export const CART_WIDTH = 100;
export const CART_HEIGHT = 60;
export const MONEY_SIZE = 40;
export const BOMB_SIZE = 30;

export const DefaultGameParams: GameParams = {
  cartSpeed: 0.5,
  cartFriction: 0.98,
  cartMaxSpeed: 5,
  itemFallSpeed: 3,
  moneySpawnRate: 0.02,
  bombSpawnRate: 0.01,
};

export const DefaultGameState: GameState = {
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
