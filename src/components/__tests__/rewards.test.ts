import { AllRewards, RewardType, getRandomReward, Probabilities } from '../rewards';

describe('getRandomReward', () => {
  test('returns valid reward', () => {
    const reward = getRandomReward();
    expect(AllRewards).toContain(reward);
  });

  test('distributes rewards according to inverse value probability', () => {
    const counts = {
      [RewardType.Bill]: 0,
      [RewardType.Treasure]: 0,
      [RewardType.Gem]: 0,
    };

    const iterations = 10000;
    for (let i = 0; i < iterations; i++) {
      const reward = getRandomReward();
      counts[reward.type]++;
    }

    const coinPercentage = counts[RewardType.Bill] / iterations;
    const treasurePercentage = counts[RewardType.Treasure] / iterations;
    const gemPercentage = counts[RewardType.Gem] / iterations;

    expect(coinPercentage).toBeCloseTo(Probabilities[0], 1);
    expect(treasurePercentage).toBeCloseTo(Probabilities[1], 1);
    expect(gemPercentage).toBeCloseTo(Probabilities[2], 1);
  });
});
