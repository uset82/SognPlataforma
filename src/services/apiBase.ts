const configuredBase = (import.meta.env.VITE_SIMULATOR_URL as string | undefined)?.trim();

/**
 * Base URL for the shared SOGN SAFE hub.
 * Empty locally, where Vite proxies /api to http://localhost:4000.
 */
export const API_BASE = configuredBase ? configuredBase.replace(/\/$/, '') : '';

export const apiUrl = (path: string): string => `${API_BASE}${path}`;
