import { redisClient } from "../config/redis";

export const updateLeaderboardRealtime = async (
  userId: string,
  score: number
): Promise<void> => {
  if (!redisClient.isOpen) return;

  await redisClient.zIncrBy("leaderboard:all", score, userId);
};
