export function getFastSupabaseFetch() {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.href
        : (input as Request).url;

    if (urlStr.includes('mock-project.supabase.co')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({ message: 'Mock Supabase Environment: Fast-fail response' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }

    const timeoutSignal = AbortSignal.timeout(4000);
    const signal = init?.signal
      ? (AbortSignal as any).any
        ? (AbortSignal as any).any([init.signal, timeoutSignal])
        : init.signal
      : timeoutSignal;

    return fetch(input, { ...init, signal });
  };
}
