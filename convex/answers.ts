import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const BASE_POINTS = 100;
const SPEED_BONUS_MAX = 50; // Max bonus for fast answers

export const submit = mutation({
  args: {
    questionId: v.id("questions"),
    playerId: v.id("players"),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    // Check if already answered
    const existing = await ctx.db
      .query("answers")
      .withIndex("by_question_and_player", (q) =>
        q.eq("questionId", args.questionId).eq("playerId", args.playerId)
      )
      .first();

    if (existing) {
      throw new Error("Already answered this question");
    }

    const answeredAt = Date.now();

    await ctx.db.insert("answers", {
      questionId: args.questionId,
      playerId: args.playerId,
      optionIndex: args.optionIndex,
      answeredAt,
    });

    // Calculate points if there's a correct answer (quiz mode)
    if (question.correctOptionIndex !== undefined) {
      if (args.optionIndex === question.correctOptionIndex) {
        // Get all answers for this question to calculate speed bonus
        const allAnswers = await ctx.db
          .query("answers")
          .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
          .collect();

        // Speed bonus: earlier answers get more points
        // Simple formula: bonus decreases with each answer
        const answerPosition = allAnswers.length;
        const speedBonus = Math.max(0, SPEED_BONUS_MAX - answerPosition * 5);
        const points = BASE_POINTS + speedBonus;

        await ctx.db.patch(args.playerId, {
          score: player.score + points,
        });

        return { correct: true, points };
      }
      return { correct: false, points: 0 };
    }

    // For poll mode (no correct answer), everyone gets participation points
    await ctx.db.patch(args.playerId, {
      score: player.score + 10,
    });
    return { correct: null, points: 10 };
  },
});

export const getByQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
  },
});

export const getByPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("answers")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .collect();
  },
});

export const hasAnswered = query({
  args: {
    questionId: v.id("questions"),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const answer = await ctx.db
      .query("answers")
      .withIndex("by_question_and_player", (q) =>
        q.eq("questionId", args.questionId).eq("playerId", args.playerId)
      )
      .first();

    return answer !== null;
  },
});

export const getResults = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) return null;

    const answers = await ctx.db
      .query("answers")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();

    // Count votes per option
    const counts: number[] = question.options.map(() => 0);
    for (const answer of answers) {
      const idx = answer.optionIndex;
      if (idx >= 0 && idx < counts.length) {
        counts[idx] = (counts[idx] ?? 0) + 1;
      }
    }

    return {
      totalAnswers: answers.length,
      optionCounts: counts,
      correctOptionIndex: question.correctOptionIndex,
    };
  },
});
