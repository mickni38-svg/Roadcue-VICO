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

/**
 * Explicit end word for a driver utterance. Requiring an end word prevents
 * background speech and incidental recognition results from being submitted
 * to the agent merely because the cabin becomes quiet.
 */
export const END_WORDS = ['SKIFTER'] as const;

/**
 * How long the conversation stays "hot" after the last exchange before
 * VICO requires the wake word again. ~2.5 minutes matches the UX spec:
 * during an active conversation the user should not have to say "VICO"
 * before every message, but after a long pause the wake word is required
 * to prevent accidental activations.
 */
export const CONVERSATION_IDLE_MS = 150_000;

/** Short spoken acknowledgement when the wake word is detected. */
export const WAKE_ACK = 'Ja';
