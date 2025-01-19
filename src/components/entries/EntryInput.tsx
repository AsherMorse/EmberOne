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
}

/** Form component for submitting new text entries */
export default function EntryInput({ onSubmit }: EntryInputProps): ReactElement {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);

    try {
      await onSubmit?.(content);
      setContent(''); // Clear input on success
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
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
      {/* Submit button with loading state */}
      <Button type="submit" loading={loading} disabled={!!error}>
        Submit Entry
      </Button>
    </form>
  );
}
