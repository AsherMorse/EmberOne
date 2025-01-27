/**
 * AI Module Configuration
 * Configures LangChain and GPT-4o mini for the ticket management system.
 * @module ai/config
 */

import { ChatOpenAI } from 'langchain/chat_models/openai';
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

// Base chain configuration options
export const baseChainConfig = {
  verbose: process.env.NODE_ENV === 'development',
  returnIntermediateSteps: true,
}; 