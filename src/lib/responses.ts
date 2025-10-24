export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code?: string };


export const ok = <T>(data: T): ApiSuccess<T> => ({ success: true, data });
export const fail = (error: string, code?: string): ApiError => ({ success: false, error, code });