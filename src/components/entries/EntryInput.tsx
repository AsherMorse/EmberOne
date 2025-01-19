'use client';

/** Text input component for creating new entries */

import { useState } from 'react';
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
}

/** Form component for submitting new text entries */
export default function EntryInput({
  onSubmit,
  isLoading = false,
  successMessage,
}: EntryInputProps): ReactElement {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
      <Button type="submit" loading={isLoading} disabled={!!error || isLoading}>
        Submit Entry
      </Button>
    </form>
  );
}
