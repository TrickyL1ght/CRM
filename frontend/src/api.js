export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте соединение и повторите попытку.');
  }
  const body = await response.text();
  let data;
  try { data = body ? JSON.parse(body) : null; } catch { data = null; }
  if (!response.ok) {
    const detail = typeof data?.error === 'string' ? data.error : data?.message;
    throw new Error(typeof detail === 'string' ? detail : `Сервер вернул ошибку ${response.status}. Попробуйте ещё раз.`);
  }
  return data;
}

export const api = {
  supplies: () => request('/supply'),
  offals: () => request('/offal'),
  sales: () => request('/sales'),
  create: (supply) => request('/supply', { method: 'POST', body: JSON.stringify(supply) }),
  update: (supply) => request(`/supply/${supply.id}`, { method: 'PUT', body: JSON.stringify(supply) }),
  remove: (id) => request(`/supply/${id}`, { method: 'DELETE' }),
};
