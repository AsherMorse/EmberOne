/**
 * AI Module Configuration
 * Configures LangChain and GPT-4o mini for the ticket management system.
 * @module ai/config
 */

import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * GPT-4o mini model instance configured for ticket management tasks.
 * Uses a lower temperature for more focused and consistent responses.
 */
export const gpt4oMini = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.2, // Lower temperature for more focused responses
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * GPT-4o model instance configured for more complex ticket management tasks.
 * Uses a moderate temperature for balanced creativity and consistency.
 */
export const gpt4o = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.3, // Moderate temperature for balanced responses
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Base chain configuration options
export const baseChainConfig = {
  verbose: process.env.NODE_ENV === 'development',
  returnIntermediateSteps: true,
}; 