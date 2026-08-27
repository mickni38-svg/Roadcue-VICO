export type VoiceState =
  | 'idle'
  | 'waiting-wake'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export const VOICE_EMOJI: Record<VoiceState, string> = {
  idle: '🙂',
  'waiting-wake': '😊',
  listening: '👂',
  processing: '🤔',
  speaking: '🗣️',
  error: '😕',
};

export const VOICE_LABEL: Record<VoiceState, string> = {
  idle: 'Tryk for at starte',
  'waiting-wake': "Sig 'VICO' for at tale til mig",
  listening: "Jeg lytter – afslut med 'SKIFTER'",
  processing: 'Behandler',
  speaking: 'Taler',
  error: 'Fejl – tryk for at prøve igen',
};

export const WAKE_WORDS = ['VICO', 'VIGGO', 'VIGO'] as const;
export const END_WORD = 'SKIFTER';
