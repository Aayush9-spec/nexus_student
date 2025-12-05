
'use server';
/**
 * @fileOverview Placeholder for the reputation and gamification system.
 *
 * This flow will be triggered after a successful sale or a new review.
 * It calculates and updates a seller's XP, level, and badges based on their activity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ReputationUpdateInputSchema = z.object({
  sellerId: z.string().describe("The UID of the seller to update."),
  triggerEvent: z.enum(['sale_completed', 'new_review', 'daily_login']).describe("The event that triggered the update."),
  eventData: z.any().optional().describe("Data related to the event, e.g., transaction amount or review rating."),
});
export type ReputationUpdateInput = z.infer<typeof ReputationUpdateInputSchema>;

const ReputationUpdateOutputSchema = z.object({
  success: z.boolean(),
  newXp: z.number(),
  newLevel: z.string(),
  newBadges: z.array(z.string()),
});
export type ReputationUpdateOutput = z.infer<typeof ReputationUpdateOutputSchema>;

export async function updateReputation(input: ReputationUpdateInput): Promise<ReputationUpdateOutput> {
  console.log("Received reputation update request:", input);

  const { adminFirestore } = await import('@/lib/firebase-admin');
  const firestore = adminFirestore();

  if (!firestore) {
    console.warn("Firebase Admin not initialized, skipping reputation update.");
    return { success: false, newXp: 0, newLevel: "Unknown", newBadges: [] };
  }

  const userRef = firestore.collection('users').doc(input.sellerId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error("User not found for reputation update:", input.sellerId);
    return { success: false, newXp: 0, newLevel: "Unknown", newBadges: [] };
  }

  const userData = userDoc.data();
  let currentXp = userData?.xpPoints || 0;
  let currentLevel = userData?.sellerLevel || 'Newbie';
  let currentBadges = userData?.badges || [];

  // Calculate XP
  let xpGain = 0;
  if (input.triggerEvent === 'sale_completed') {
    xpGain = 50; // 50 XP for a sale
  } else if (input.triggerEvent === 'new_review') {
    const rating = input.eventData?.rating || 0;
    xpGain = rating * 5; // 5 XP per star
  } else if (input.triggerEvent === 'daily_login') {
    xpGain = 10;
  }

  const newXp = currentXp + xpGain;

  // Calculate Level
  let newLevel = currentLevel;
  if (newXp > 1000) newLevel = 'Expert';
  else if (newXp > 500) newLevel = 'Intermediate';
  else if (newXp > 100) newLevel = 'Novice';

  // Badges (Simple logic)
  const newBadges = [...currentBadges];
  if (newXp >= 100 && !newBadges.includes('First 100 XP')) {
    newBadges.push('First 100 XP');
  }
  if (input.triggerEvent === 'sale_completed' && !newBadges.includes('First Sale')) {
    newBadges.push('First Sale');
  }

  // Update Firestore
  await userRef.update({
    xpPoints: newXp,
    sellerLevel: newLevel,
    badges: newBadges,
  });

  return {
    success: true,
    newXp,
    newLevel,
    newBadges,
  };
}

const reputationFlow = ai.defineFlow(
  {
    name: 'reputationFlow',
    inputSchema: ReputationUpdateInputSchema,
    outputSchema: ReputationUpdateOutputSchema,
  },
  async (input: ReputationUpdateInput) => {
    return updateReputation(input);
  }
);

