'use server';

/**
 * @fileOverview Analyzes a listing to provide an AI-powered summary and price analysis.
 *
 * - analyzeListing - A function that analyzes a listing.
 * - AnalyzeListingInput - The input type for the analyzeListing function.
 * - AnalyzeListingOutput - The return type for the analyzeListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeListingInputSchema = z.object({
  title: z.string().describe('The title of the listing.'),
  description: z.string().describe('The description of the listing.'),
  price: z.number().describe('The price of the listing in INR.'),
  category: z.string().describe('The category of the listing.'),
});
export type AnalyzeListingInput = z.infer<typeof AnalyzeListingInputSchema>;

const PriceAnalysisSchema = z.enum(['Great Deal', 'Good Deal', 'Fair Price', 'A bit pricey', 'Overpriced']);

export const AnalyzeListingOutputSchema = z.object({
  summary: z.string().describe('A concise, one-sentence summary of the product for a potential buyer.'),
  valueScore: PriceAnalysisSchema.describe(
    'An assessment of how good the value is for the price, considering the product and category.'
  ),
  priceAnalysis: z
    .string()
    .describe('A brief explanation for the value score, explaining why the price is fair or not.'),
});
export type AnalyzeListingOutput = z.infer<typeof AnalyzeListingOutputSchema>;

export async function analyzeListing(input: AnalyzeListingInput): Promise<AnalyzeListingOutput> {
  return analyzeListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeListingPrompt',
  input: {schema: AnalyzeListingInputSchema},
  output: {schema: AnalyzeListingOutputSchema},
  prompt: `You are an expert product analyst for a student marketplace in India. Your goal is to help students make informed purchasing decisions.

  Analyze the following product listing based on its title, description, category, and price (in INR).

  **Listing Details:**
  - **Title:** {{{title}}}
  - **Description:** {{{description}}}
  - **Category:** {{{category}}}
  - **Price:** ₹{{{price}}}

  **Your Task:**
  1.  **Summary:** Write a one-sentence summary of what the product is.
  2.  **Value Score:** Evaluate if the price is fair for a student marketplace in India. Choose one of the following value scores: Great Deal, Good Deal, Fair Price, A bit pricey, Overpriced.
  3.  **Price Analysis:** Briefly explain your reasoning for the value score. For example, if it's a "Great Deal", explain why (e.g., "Textbooks are usually more expensive"). If it's "A bit pricey", suggest what a fairer price might be.

  Provide your analysis in the required JSON format.`,
});

const analyzeListingFlow = ai.defineFlow(
  {
    name: 'analyzeListingFlow',
    inputSchema: AnalyzeListingInputSchema,
    outputSchema: AnalyzeListingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
