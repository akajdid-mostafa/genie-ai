// src/ai/flows/generate-initial-prompt.ts
'use server';

/**
 * @fileOverview Generates initial prompt suggestions for image editing based on a given image.
 *
 * - generateInitialPrompt - A function that generates initial prompt suggestions.
 * - GenerateInitialPromptInput - The input type for the generateInitialPrompt function.
 * - GenerateInitialPromptOutput - The return type for the generateInitialPrompt function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateInitialPromptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate initial prompts for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    language: z.enum(['en', 'id', 'zh']).optional().default('en').describe('The language for the suggested prompts (e.g., "en", "id", "zh").'),
    apiKey: z.string().describe('User-provided Google AI API key.'),
});
export type GenerateInitialPromptInput = z.infer<typeof GenerateInitialPromptInputSchema>;

const GenerateInitialPromptOutputSchema = z.object({
  prompts: z
    .array(z.string())
    .describe('An array of 5 suggested prompts for editing the image.'),
});
export type GenerateInitialPromptOutput = z.infer<typeof GenerateInitialPromptOutputSchema>;

export async function generateInitialPrompt(input: GenerateInitialPromptInput): Promise<GenerateInitialPromptOutput> {
  const genAI = genkit({
    plugins: [googleAI({ apiKey: input.apiKey, apiVersion: 'v1beta' })],
  });

  const promptTemplate = `You are an AI assistant that suggests initial prompts for an image editing tool.
The tool allows users to remove objects, change aspects of the image, or remove the background using text prompts.
Given the following image, suggest 5 creative and useful prompts that a user could use to edit the image.
The prompts should be simple and specific. Focus on common image editing tasks.

Include "Remove background" as one of the suggestions if the image has a clear subject and background.
Other examples include removing specific objects, changing colors, or adding details.

IMPORTANT: Generate the prompts in the following language: {{{language}}}.

Image: {{media url=photoDataUri}}

Respond as a JSON array of strings containing exactly 5 prompts.
`;

  const prompt = genAI.definePrompt({
      name: 'generateInitialPromptPrompt',
      model: 'googleai/gemini-1.5-pro-latest',
      input: {schema: GenerateInitialPromptInputSchema},
      output: {schema: GenerateInitialPromptOutputSchema},
      prompt: promptTemplate,
  });

  const {output} = await prompt(input);
  return output!;
}
