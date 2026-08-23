import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  AGENT_CHAT_ENDPOINT,
  AgentChatService,
} from './agent-chat.service';

describe('AgentChatService', () => {
  let service: AgentChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AgentChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends first request with thread_id=null and stores returned thread_id', async () => {
    const promise = service.sendMessage('Hej VICO');
    const req = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ message: 'Hej VICO', thread_id: null });
    req.flush({ answer: 'Hej', thread_id: 'abc-123' });
    await promise;
    expect(service.threadId()).toBe('abc-123');
  });

  it('reuses stored thread_id on follow-up requests', async () => {
    const p1 = service.sendMessage('Første');
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'a', thread_id: 'tid-1' });
    await p1;

    const p2 = service.sendMessage('Anden');
    const req2 = httpMock.expectOne(AGENT_CHAT_ENDPOINT);
    expect(req2.request.body).toEqual({ message: 'Anden', thread_id: 'tid-1' });
    req2.flush({ answer: 'b', thread_id: 'tid-1' });
    await p2;
    expect(service.threadId()).toBe('tid-1');
  });

  it('preserves thread_id when HTTP fails', async () => {
    const p1 = service.sendMessage('Første');
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush({ answer: 'a', thread_id: 'tid-9' });
    await p1;

    const p2 = service.sendMessage('Fejlkald').catch(() => undefined);
    httpMock
      .expectOne(AGENT_CHAT_ENDPOINT)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    await p2;
    expect(service.threadId()).toBe('tid-9');
  });
});
