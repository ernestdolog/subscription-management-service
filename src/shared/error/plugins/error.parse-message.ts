export const toMessage = (error: unknown) =>
    !!error && typeof error === 'object' && 'message' in error
        ? error.message
        : typeof error === 'object'
          ? JSON.stringify(error)
          : error;
