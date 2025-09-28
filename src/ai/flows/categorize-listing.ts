'use server';

/**
 * @fileOverview Automatically categorizes a listing into one of the predefined categories.
 *
 * - categorizeListing - A function that categorizes a listing.
 * - CategorizeListingInput - The input type for the categorizeListing function.
 * - CategorizeListingOutput - The return type for the categorizeListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ListingCategorySchema = z.enum([
  'Physical Products',
  'Digital Products',
  'Services',
  'Community/Collaboration',
]);

const CategorizeListingInputSchema = z.object({
  title: z.string().describe('The title of the listing.'),
  description: z.string().describe('The description of the listing.'),
});
export type CategorizeListingInput = z.infer<typeof CategorizeListingInputSchema>;

const CategorizeListingOutputSchema = z.object({
  category: ListingCategorySchema.describe('The predicted category of the listing.'),
});
export type CategorizeListingOutput = z.infer<typeof CategorizeListingOutputSchema>;

export async function categorizeListing(input: CategorizeListingInput): Promise<CategorizeListingOutput> {
  return categorizeListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeListingPrompt',
  input: {schema: CategorizeListingInputSchema},
  output: {schema: CategorizeListingOutputSchema},
  prompt: `You are an expert at categorizing listings for a student marketplace.

  Given the title and description of a listing, determine the most appropriate category from the following list:
  - Physical Products
  - Digital Products
  - Services
  - Community/Collaboration

  Return ONLY the category name.

  Title: {{{title}}}
  Description: {{{description}}}
  Category: `,
});

const categorizeListingFlow = ai.defineFlow(
  {
    name: 'categorizeListingFlow',
    inputSchema: CategorizeListingInputSchema,
    outputSchema: CategorizeListingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
