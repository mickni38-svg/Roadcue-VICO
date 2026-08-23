export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export const VOICE_EMOJI: Record<VoiceState, string> = {
  idle: '🙂',
  listening: '👂',
  processing: '🤔',
  speaking: '🗣️',
  error: '😕',
};

export const VOICE_LABEL: Record<VoiceState, string> = {
  idle: 'Klar',
  listening: 'Lytter',
  processing: 'Behandler',
  speaking: 'Taler',
  error: 'Fejl – tryk for at prøve igen',
};
