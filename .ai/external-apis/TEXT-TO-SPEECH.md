# Text to Speech

## Approved provider
Azure AI Speech

## Language
Danish (`da-DK`)

## Approved voices
- da-DK-ChristelNeural
- da-DK-JeppeNeural

## POC cost
Use Azure Speech F0 tier.

Current free allowance:
500,000 neural TTS characters/month.

## Architecture
Azure Speech must be called through a Roadcue backend service.

Angular must not contain Azure Speech credentials.

## Testing
All Azure Speech API calls must be mocked.
Automated tests must never call live Azure Speech.