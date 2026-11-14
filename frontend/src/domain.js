export const livestockNames = { cattle: 'КРС', pig: 'Свинина', sheep: 'Баранина', poultry: 'Птица' };
export const livestockName = (type) => livestockNames[type] || type || 'Не указан';
export const number = (value) => new Intl.NumberFormat('ru-RU').format(value);
export const date = (timestamp) => timestamp
  ? new Date(timestamp * 1000).toLocaleDateString('ru-RU') : '—';
export const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function remaining(supply, sales) {
  return supply.weight - sales.filter((sale) => sale.supplyId === supply.id)
    .reduce((sum, sale) => sum + sale.weight, 0);
}

export function filterSupplies(supplies, { query = '', type = '', from = '', to = '' }) {
  const search = query.trim().toLocaleLowerCase('ru');
  return supplies.filter((supply) => {
    const text = `${supply.id} ${supply.commingFrom || ''} ${livestockName(supply.livestockType)}`.toLocaleLowerCase('ru');
    const received = Number(supply.dateOfReceipt) * 1000;
    return (!search || text.includes(search)) && (!type || supply.livestockType === type)
      && (!from || received >= new Date(`${from}T00:00:00`).getTime())
      && (!to || received <= new Date(`${to}T23:59:59.999`).getTime());
  }).sort((a, b) => b.dateOfReceipt - a.dateOfReceipt || b.id - a.id);
}

export function supplyPayload(form, offals, existing) {
  const weight = Number(form.get('weight'));
  const timestamp = Math.floor(new Date(`${form.get('dateOfReceipt')}T12:00:00`).getTime() / 1000);
  const supplier = String(form.get('commingFrom') || '').trim();
  const type = String(form.get('livestockType') || '').trim();
  if (!supplier || supplier.length > 255) throw new Error('Укажите поставщика: от 1 до 255 символов.');
  if (!type || type.length > 25) throw new Error('Укажите вид сырья: до 25 символов.');
  if (!Number.isSafeInteger(weight) || weight < 1 || weight > 2147483647) {
    throw new Error('Вес должен быть целым числом от 1 до 2 147 483 647 кг.');
  }
  if (!Number.isFinite(timestamp) || timestamp <= 0) throw new Error('Укажите корректную дату поступления.');
  const selected = new Set(form.getAll('offals').map(Number));
  return {
    ...(existing ? { id: existing.id } : {}),
    livestockType: type, dateOfReceipt: timestamp, commingFrom: supplier, weight,
    offals: offals.filter((offal) => selected.has(offal.id)),
    sale: existing?.sale ?? [],
  };
}
