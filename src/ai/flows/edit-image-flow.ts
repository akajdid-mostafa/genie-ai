
// src/ai/flows/edit-image-flow.ts
'use server';

/**
 * @fileOverview An AI agent that edits an image based on a prompt and a mask.
 *
 * - editImage - A function that handles the image editing process.
 * - EditImageInput - The input type for the editImage function.
 * - EditImageOutput - The return type for the editImage function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const EditImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  maskDataUri: z
    .string()
    .describe(
      "A mask indicating the area to edit, as a data URI that must include a MIME type and use Base64 encoding. The mask should be the same dimensions as the photo. White pixels indicate the area to be edited, and black pixels indicate the area to be preserved."
    ),
  prompt: z.string().describe('The desired edit.'),
  apiKey: z.string().describe('User-provided Google AI API key.'),
});
export type EditImageInput = z.infer<typeof EditImageInputSchema>;

const EditImageOutputSchema = z.object({
  editedPhotoDataUri: z.string().describe('The edited image as a data URI.'),
});
export type EditImageOutput = z.infer<typeof EditImageOutputSchema>;

export async function editImage(input: EditImageInput): Promise<EditImageOutput> {
  const { photoDataUri, maskDataUri, prompt, apiKey } = input;
  
  const genAI = genkit({
    plugins: [googleAI({ apiKey, apiVersion: 'v1beta' })],
  });
  
  let finalPrompt: string;

  if (prompt === '__REMOVE_OBJECT__') {
    // For object removal, frame it as a specific instruction for the masked area.
    // This is more effective than a simple fill command.
    finalPrompt = `Following the user's instruction, edit only the masked area of the image. User's instruction: "Realistically fill in the masked area based on the surrounding image."`;
  } else {
    // For other edits, frame it as an instruction for the masked area to prevent global changes.
    finalPrompt = `Following the user's instruction, edit only the masked area of the image. User's instruction: "${prompt}"`;
  }
  
  const { media } = await genAI.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: [
      { text: finalPrompt },
      { media: { url: photoDataUri } },
      { media: { url: maskDataUri } },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      // Safety settings are relaxed to allow for a wider range of creative edits.
      safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
        ],
    },
  });

  if (!media || !media.url) {
      throw new Error("The AI failed to generate an image.");
  }
  
  return { editedPhotoDataUri: media.url };
}
