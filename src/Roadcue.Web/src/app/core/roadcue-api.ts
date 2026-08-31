import { environment } from '../../environments/environment';

export function roadcueApiUrl(path: string): string {
  const base = environment.roadcueApiBaseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
