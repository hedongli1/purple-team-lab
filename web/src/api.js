async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `请求失败（${res.status}）`);
  return data;
}

export const api = {
  scenarios: () => request('/scenarios'),
  rules: () => request('/rules'),
  createRun: (scenarios) => request('/runs', { method: 'POST', body: JSON.stringify({ scenarios }) }),
  runs: () => request('/runs'),
  run: (id) => request(`/runs/${id}`),
  report: () => request('/report'),
};