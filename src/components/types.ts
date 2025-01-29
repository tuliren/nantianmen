import { RewardType } from '@/components/rewards';

export interface MoneyBag {
  x: number;
  y: number;
  type: RewardType;
}

export interface Bomb {
  x: number;
  y: number;
}

export interface GameState {
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

export interface GameParams {
  cartSpeed: number;
  cartFriction: number;
  cartMaxSpeed: number;
  itemFallSpeed: number;
  moneySpawnRate: number;
  bombSpawnRate: number;
}
