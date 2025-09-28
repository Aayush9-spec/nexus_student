'use server';
/**
 * @fileOverview Generates a default profile picture for new students.
 *
 * - generateDefaultProfilePicture - A function that generates a default profile picture.
 * - GenerateDefaultProfilePictureInput - The input type for the generateDefaultProfilePicture function.
 * - GenerateDefaultProfilePictureOutput - The return type for the generateDefaultProfilePicture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDefaultProfilePictureInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
});
export type GenerateDefaultProfilePictureInput = z.infer<typeof GenerateDefaultProfilePictureInputSchema>;

const GenerateDefaultProfilePictureOutputSchema = z.object({
  profilePictureDataUri: z
    .string()
    .describe(
      'A data URI containing the generated profile picture, in PNG format with Base64 encoding. Expected format: \'data:image/png;base64,<encoded_data>\'.' /* The profile picture as a data URI. */
    ),
});
export type GenerateDefaultProfilePictureOutput = z.infer<typeof GenerateDefaultProfilePictureOutputSchema>;

export async function generateDefaultProfilePicture(
  input: GenerateDefaultProfilePictureInput
): Promise<GenerateDefaultProfilePictureOutput> {
  return generateDefaultProfilePictureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDefaultProfilePicturePrompt',
  input: {schema: GenerateDefaultProfilePictureInputSchema},
  output: {schema: GenerateDefaultProfilePictureOutputSchema},
  prompt: `Generate a professional-looking profile picture for a student named {{{studentName}}}. The image should be suitable for use on a student marketplace platform, conveying a sense of trustworthiness and competence. The image MUST be returned as a data URI, in PNG format with Base64 encoding, and MUST be less than 1MB in size.
`,
});

const generateDefaultProfilePictureFlow = ai.defineFlow(
  {
    name: 'generateDefaultProfilePictureFlow',
    inputSchema: GenerateDefaultProfilePictureInputSchema,
    outputSchema: GenerateDefaultProfilePictureOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: `Generate a professional-looking profile picture for a student named ${input.studentName}. The image should be suitable for use on a student marketplace platform, conveying a sense of trustworthiness and competence. The image MUST be returned as a data URI, in PNG format with Base64 encoding, and MUST be less than 1MB in size.`,
      model: 'googleai/imagen-4.0-fast-generate-001',
    });
    return {profilePictureDataUri: media.url!};
  }
);
