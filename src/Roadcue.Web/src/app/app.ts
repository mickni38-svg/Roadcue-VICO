import { Component, ChangeDetectionStrategy } from '@angular/core';
import { VoiceComponent } from './voice/voice.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoiceComponent],
  template: '<app-voice />',
})
export class App {}
