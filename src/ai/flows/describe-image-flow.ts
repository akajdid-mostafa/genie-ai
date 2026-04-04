// src/ai/flows/describe-image-flow.ts
'use server';

/**
 * @fileOverview An AI agent that describes an image.
 *
 * - describeImage - A function that handles the image description process.
 * - DescribeImageInput - The input type for the describeImage function.
 * - DescribeImageOutput - The return type for the describeImage function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const DescribeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to describe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  apiKey: z.string().describe('User-provided Google AI API key.'),
});
export type DescribeImageInput = z.infer<typeof DescribeImageInputSchema>;

const DescribeImageOutputSchema = z.object({
  description: z.string().describe('A concise description of the image.'),
});
export type DescribeImageOutput = z.infer<typeof DescribeImageOutputSchema>;

export async function describeImage(input: DescribeImageInput): Promise<DescribeImageOutput> {
  const ai = genkit({
    plugins: [googleAI({apiKey: input.apiKey, apiVersion: 'v1beta'})],
  });

  const promptTemplate = `Briefly describe the main subject and setting of this image in one concise sentence. This description will be used as context for an AI image editor.

Image: {{media url=photoDataUri}}`;

  const prompt = ai.definePrompt({
    name: 'describeImagePrompt',
    model: 'googleai/gemini-1.5-pro-latest',
    input: {schema: DescribeImageInputSchema},
    output: {schema: DescribeImageOutputSchema},
    prompt: promptTemplate,
  });
  
  const {output} = await prompt(input);
  return output!;
}
