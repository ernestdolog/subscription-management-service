export const isInternalError = (error: unknown) =>
    error && typeof error === 'object' && 'type' in error && error.type === 'InternalServerError';
