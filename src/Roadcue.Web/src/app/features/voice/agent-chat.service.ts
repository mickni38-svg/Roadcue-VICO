import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AgentChatRequest {
  message: string;
  thread_id: string | null;
}

export interface AgentChatResponse {
  answer: string;
  thread_id: string;
}

declare global {
  interface Window {
    __roadcueConfig?: {
      agentChatEndpoint?: string;
      roadcueApiBaseUrl?: string;
    };
  }
}

export function getAgentChatEndpoint(): string {
  return window.__roadcueConfig?.agentChatEndpoint || '/api/agent/chat';
}

@Injectable({ providedIn: 'root' })
export class AgentChatService {
  private readonly http = inject(HttpClient);
  private readonly _threadId = signal<string | null>(null);

  readonly threadId = this._threadId.asReadonly();

  async sendMessage(message: string): Promise<AgentChatResponse> {
    const payload: AgentChatRequest = {
      message,
      thread_id: this._threadId(),
    };
    const response = await firstValueFrom(
      this.http.post<AgentChatResponse>(getAgentChatEndpoint(), payload),
    );
    if (response?.thread_id) {
      this._threadId.set(response.thread_id);
    }
    return response;
  }

  reset(): void {
    this._threadId.set(null);
  }
}
