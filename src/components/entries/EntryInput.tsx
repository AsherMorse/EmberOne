'use client';

/** Text input component for creating new entries */

import { useEffect, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createEntrySchema } from '@/server/schemas/entry';

interface EntryInputProps {
  /** Called when a new entry is submitted */
  onSubmit?: (content: string) => Promise<void>;
  /** Whether the form is currently submitting */
  isLoading?: boolean;
  /** Success message to display */
  successMessage?: string;
  /** Rate limit in milliseconds */
  rateLimit?: number;
}

/** Form component for submitting new text entries */
export default function EntryInput({
  onSubmit,
  isLoading = false,
  successMessage,
  rateLimit = 5000, // 5 seconds default rate limit
}: EntryInputProps): ReactElement {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [timeUntilNextSubmit, setTimeUntilNextSubmit] = useState(0);

  /** Update time until next submit */
  useEffect(() => {
    if (timeUntilNextSubmit <= 0) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, lastSubmitTime + rateLimit - Date.now());
      setTimeUntilNextSubmit(remaining);
    }, 100);

    return (): void => {
      clearInterval(timer);
    };
  }, [lastSubmitTime, rateLimit, timeUntilNextSubmit]);

  /** Validate entry content */
  const validateContent = (value: string): string => {
    const result = createEntrySchema.safeParse({ content: value });
    if (!result.success) {
      return result.error.errors[0]?.message || 'Invalid entry';
    }
    return '';
  };

  /** Handle content change */
  const handleChange = (value: string): void => {
    setContent(value);
    setError(validateContent(value));
    setShowSuccess(false);
  };

  /** Handle form submission */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check rate limit
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    if (timeSinceLastSubmit < rateLimit) {
      const remaining = Math.ceil((rateLimit - timeSinceLastSubmit) / 1000);
      setError(`Please wait ${remaining} seconds before submitting again`);
      setTimeUntilNextSubmit(rateLimit - timeSinceLastSubmit);
      return;
    }

    const validationError = validateContent(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setShowSuccess(false);

    try {
      await onSubmit?.(content);
      setContent(''); // Clear input on success
      setShowSuccess(true);
      setLastSubmitTime(Date.now());
      setTimeUntilNextSubmit(rateLimit);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    /* Entry submission form */
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Text input for new entry content */}
      <Input
        label="New Entry"
        id="entry-content"
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type your entry here..."
        required
        error={error}
      />
      {/* Success message */}
      {showSuccess && successMessage && (
        <p className="text-green-500 text-sm mt-1">{successMessage}</p>
      )}
      {/* Submit button with loading state */}
      <Button
        type="submit"
        loading={isLoading}
        disabled={!!error || isLoading || timeUntilNextSubmit > 0}
      >
        {timeUntilNextSubmit > 0
          ? `Wait ${Math.ceil(timeUntilNextSubmit / 1000)}s`
          : 'Submit Entry'}
      </Button>
    </form>
  );
}
