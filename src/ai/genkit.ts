import {genkit} from 'genkit';
// We don't import or initialize googleAI here because it's configured
// dynamically within each flow using the user-provided API key.
// This prevents startup errors when no global API key is set.

export const ai = genkit({
  plugins: [],
});
