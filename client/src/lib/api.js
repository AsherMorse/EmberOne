export async function executeCommand(command) {
  const response = await fetch('/api/admin/tickets/command', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: command,
      type: 'natural_language',
      preview: false
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to execute command');
  }

  return response.json();
}

export async function executeChanges(changes) {
  const response = await fetch('/api/admin/tickets/execute-changes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ changes: changes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to execute changes');
  }

  return response.json();
} 