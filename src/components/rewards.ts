export enum RewardType {
  Bill = 'coin',
  Treasure = 'treasure',
  Gem = 'gem',
}

export interface RewardDefinition {
  type: RewardType;
  name: string;
  value: number;
  emoji: string;
}

export const RewardMap: Record<RewardType, RewardDefinition> = {
  [RewardType.Bill]: {
    type: RewardType.Bill,
    name: 'Bill',
    value: 1,
    emoji: '💵',
  },
  [RewardType.Treasure]: {
    type: RewardType.Treasure,
    name: 'Treasure',
    value: 3,
    emoji: '💰',
  },
  [RewardType.Gem]: {
    type: RewardType.Gem,
    name: 'Gem',
    value: 10,
    emoji: '💎',
  },
};

export const SortedRewards: RewardDefinition[] = Object.values(RewardMap).sort((a, b) => a.value - b.value);

// Calculate total value
const TotalValues: number = SortedRewards.reduce((sum, reward) => sum + reward.value, 0);

// Calculate inverse probabilities
const InverseValues: number[] = SortedRewards.map((reward) => TotalValues / reward.value);
const TotalInverse: number = InverseValues.reduce((sum, val) => sum + val, 0);

// Normalize probabilities
export const Probabilities: number[] = InverseValues.map((val) => val / TotalInverse);
console.debug('Probabilities:', Probabilities);

export const getRandomReward = (): RewardDefinition => {
  // Generate random number
  const random = Math.random();

  // Select reward based on probability
  let cumulativeProbability = 0;
  for (let i = 0; i < Probabilities.length; i++) {
    cumulativeProbability += Probabilities[i];
    if (random < cumulativeProbability) {
      return SortedRewards[i];
    }
  }

  // Fallback to last reward (this line won't be reached unless there's floating point precision issues)
  return SortedRewards[0];
};
