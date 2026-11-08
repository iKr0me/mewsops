/** HTTP contract at repository main fc7b0e7. Response payload types are compile-time only. */
export type ReportStatus = 'received' | 'processing' | 'needs_review' | 'completed' | 'failed';
export type ReportInput = { clientRequestId: string; text: string; mediaIds: string[]; selectedColonyId?: string; demoLocationId?: string; observedAt?: string };
export type DecisionInput = { decision: 'approve' | 'reject'; expectedVersion: number; reason: string; selectedCatId?: string };
export type Colony = { id: string; name: string; exactLocation?: unknown; contact?: unknown };
export type ColonySummary = { colony: Colony; confirmedCats: number; fixed: number; vetReviewNeeded: number; tnrNeeded: number; tnrUnknown: number; pendingObservations: number; lastFeedingAt: string | null; lastFeederId?: string | null };
export type AggregateSummary = Omit<ColonySummary, 'colony' | 'lastFeedingAt' | 'lastFeederId'> & { colonyCount: number };
export type Observation = { id: string; reportId: string; catId: string | null; kind: string; statement: string; source: string; evidenceIds: string[] };
export type Alert = { id: string; reportId: string; colonyId: string | null; level: string; statement: string; verified: boolean; createdAt: string; status?: 'open' | 'resolved'; evidenceIds?: string[] };
export type Review = { id: string; reportId: string; action: 'link_observation' | 'confirm_new_cat' | 'merge_cats' | 'mark_adopted' | 'mark_missing'; status: 'pending' | 'approved' | 'rejected'; version: number; proposedChange: Record<string, unknown>; evidenceIds: string[] };
export type ReportDetail = ReportInput & { id: string; actorId: string; colonyId: string | null; receivedAt: string; status: ReportStatus; observations: Observation[]; reviews: Review[]; alerts: Alert[] };
export type ReportListItem = { id: string; colonyId: string | null; receivedAt: string; text: string; status: ReportStatus };
export type Cat = { id: string; colonyId: string; name: string; lifecycle: 'active' | 'adopted' | 'missing'; sterilization: 'unknown' | 'fixed' | 'not_fixed'; confirmed: boolean; canonicalId: string | null; version: number; vetReviewStatus?: 'none' | 'needed' | 'reviewed'; observations?: Observation[] };
export type Health = { ok: true; analysis: 'synthetic_fixture' | 'adapter' | 'unavailable' };
export type RequestOptions = { signal?: AbortSignal };
export type ApiOptions = { baseURL: string; credentials?: RequestCredentials; fetch?: typeof fetch };

export class ApiError extends Error {
  constructor(public readonly kind: 'network' | 'http' | 'protocol', message: string, public readonly status?: number, public readonly code?: string, public readonly requestId?: string) {
    super(message); this.name = 'ApiError';
  }
}

/** An abort is propagated unchanged. Failed writes may have reached the server: do not blindly retry. */
export function createMewsApi(options: ApiOptions) {
  const base = new URL(options.baseURL);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
    throw new Error('baseURL must be an HTTP(S) origin without credentials, path, query, or fragment');
  }
  const transport = options.fetch ?? fetch;
  const idPath = (id: string) => {
    if (!id || id === '.' || id === '..' || /[/\\]/.test(id)) throw new Error('Invalid resource ID');
    return encodeURIComponent(id);
  };
  async function response(path: string, init: RequestInit = {}): Promise<Response> {
    let result: Response;
    try {
      result = await transport(`${base.origin}${path}`, { ...init, credentials: options.credentials ?? 'same-origin' });
    } catch (error) {
      if (init.signal?.aborted) throw error;
      throw new ApiError('network', 'Network request failed; the server outcome may be unknown.');
    }
    if (!result.ok) {
      let payload: unknown;
      try { payload = await result.json(); } catch { /* An HTTP error may not be JSON. */ }
      const envelope = payload && typeof payload === 'object' && 'error' in payload ? (payload as { error?: unknown }).error : undefined;
      const detail = envelope && typeof envelope === 'object' ? envelope as Record<string, unknown> : {};
      throw new ApiError('http', typeof detail.message === 'string' ? detail.message : `HTTP ${result.status}`, result.status, typeof detail.code === 'string' ? detail.code : undefined, typeof detail.requestId === 'string' ? detail.requestId : result.headers.get('x-request-id') ?? undefined);
    }
    return result;
  }
  async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
    const result = await response(path, init);
    let payload: unknown;
    try { payload = await result.json(); } catch { throw new ApiError('protocol', 'Expected a JSON response.', result.status); }
    if (!payload || typeof payload !== 'object' || !('data' in payload)) throw new ApiError('protocol', 'Expected a data envelope.', result.status);
    return (payload as { data: T }).data;
  }
  const get = <T>(path: string, opt?: RequestOptions) => json<T>(path, { signal: opt?.signal });
  const post = <T>(path: string, body: unknown, opt?: RequestOptions) => json<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: opt?.signal });
  return {
    health: (opt?: RequestOptions) => get<Health>('/api/health', opt),
    listColonies: (opt?: RequestOptions) => get<Colony[]>('/api/colonies', opt),
    getColony: (id: string, opt?: RequestOptions) => get<ColonySummary>(`/api/colonies/${idPath(id)}`, opt),
    getCat: (id: string, opt?: RequestOptions) => get<Cat>(`/api/cats/${idPath(id)}`, opt),
    submitReport: (input: ReportInput, opt?: RequestOptions) => post<ReportDetail>('/api/reports', input, opt),
    listReports: (opt?: RequestOptions) => get<ReportListItem[]>('/api/reports', opt),
    getReport: (id: string, opt?: RequestOptions) => get<ReportDetail>(`/api/reports/${idPath(id)}`, opt),
    processReport: (id: string, opt?: RequestOptions) => json<ReportDetail>(`/api/reports/${idPath(id)}/process`, { method: 'POST', signal: opt?.signal }),
    listReviews: (opt?: RequestOptions) => get<Review[]>('/api/reviews', opt),
    decideReview: (id: string, input: DecisionInput, opt?: RequestOptions) => post<{ reviewId: string; status: string; version: number; catId?: string }>(`/api/reviews/${idPath(id)}/decision`, input, opt),
    listAlerts: (opt?: RequestOptions) => get<Alert[]>('/api/alerts', opt),
    resolveAlert: (id: string, reason: string, opt?: RequestOptions) => post<{ alertId: string; status: 'resolved' }>(`/api/alerts/${idPath(id)}/resolve`, { reason }, opt),
    getSummary: (opt?: RequestOptions) => get<AggregateSummary>('/api/summary', opt),
    uploadMedia: (body: Blob, contentType: 'image/jpeg' | 'image/png', opt?: RequestOptions) => json<{ id: string; contentType: 'image/png' }>('/api/media', { method: 'POST', headers: { 'Content-Type': contentType }, body, signal: opt?.signal }),
    getMedia: async (id: string, opt?: RequestOptions) => (await response(`/api/media/${idPath(id)}`, { signal: opt?.signal })).blob(),
  };
}
