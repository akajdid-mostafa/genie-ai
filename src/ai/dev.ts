import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-prompt.ts';
import '@/ai/flows/improve-prompt-clarity.ts';
import '@/ai/flows/edit-image-flow.ts';
import '@/ai/flows/describe-image-flow.ts';
