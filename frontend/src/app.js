import { api } from './api.js';
import { livestockName, escapeHTML as e, number, date, remaining, filterSupplies, supplyPayload } from './domain.js';

const $ = (selector) => document.querySelector(selector);
const state = { supplies: [], sales: [], offals: [], errors: {}, loading: true, editing: null, deleting: null, saving: false };
const pages = {
  supplies: ['Поставки', 'От поступления до остатка — все партии в одном месте.', 'Реестр поставок', 'Все зарегистрированные партии сырья'],
  sales: ['Продажи', 'Реализация сырья по зарегистрированным поставкам.', 'Реестр продаж', 'Продажи, зарегистрированные в системе'],
  offals: ['Субпродукты', 'Справочник субпродуктов для комплектации поставок.', 'Справочник субпродуктов', 'Доступные позиции для новых партий'],
};
let toastTimer;
const page = () => Object.hasOwn(pages, location.hash.slice(1)) ? location.hash.slice(1) : 'supplies';
const filtered = () => filterSupplies(state.supplies, Object.fromEntries(new FormData($('#filters'))));

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 5000);
}

function empty(title, description, retry = false) {
  return `<div class="empty"><span class="empty-icon" aria-hidden="true">▤</span><h3>${e(title)}</h3><p>${e(description)}</p>${retry ? '<button class="button secondary" data-action="retry">Повторить загрузку</button>' : ''}</div>`;
}

function renderMetrics() {
  const weight = state.supplies.reduce((sum, item) => sum + item.weight, 0);
  const sold = state.sales.reduce((sum, item) => sum + item.weight, 0);
  $('#metric-count').textContent = state.errors.supplies || state.loading ? '—' : number(state.supplies.length);
  $('#supply-count').textContent = state.errors.supplies || state.loading ? '—' : number(state.supplies.length);
  $('#metric-weight').textContent = state.errors.supplies || state.loading ? '—' : number(weight);
  $('#metric-sold').textContent = state.errors.sales || state.loading ? '—' : number(sold);
  $('#metric-remaining').textContent = state.errors.supplies || state.errors.sales || state.loading ? '—' : number(weight - sold);
}

function render() {
  const current = page();
  const config = pages[current];
  document.title = `${config[0]} — МясоПром CRM`;
  $('#page-title').textContent = config[0];
  $('#breadcrumb-current').textContent = config[0];
  $('#page-description').textContent = config[1];
  $('#table-description').textContent = config[3];
  $('#table-title').firstChild.textContent = `${config[2]} `;
  document.querySelectorAll('[data-page]').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === current);
    if (link.dataset.page === current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('#filters').hidden = current !== 'supplies';
  $('#add-supply').hidden = current !== 'supplies';
  $('#add-supply').disabled = state.loading || state.saving;
  $('#refresh').disabled = state.loading;
  $('#table-container').setAttribute('aria-busy', String(state.loading));
  renderMetrics();
  const errors = Object.entries(state.errors).map(([key, message]) => `${pages[key]?.[0] || key}: ${message}`);
  $('#load-error').hidden = !errors.length;
  $('#load-error').textContent = errors.join(' ');
  if (state.loading) {
    $('#table-container').innerHTML = empty('Загружаем данные', 'Получаем информацию с сервера…');
    $('#table-summary').textContent = 'Загружаем данные…';
    $('#result-count').textContent = '—';
    return;
  }
  if (state.errors[current]) {
    $('#table-container').innerHTML = empty('Не удалось загрузить данные', 'Проверьте доступность API и повторите попытку.', true);
    $('#result-count').textContent = '—';
    $('#table-summary').textContent = 'Данные недоступны';
    return;
  }
  if (current === 'supplies') renderSupplies();
  else if (current === 'sales') renderSales();
  else renderOffals();
}

function renderSupplies() {
  const items = filtered();
  $('#result-count').textContent = number(items.length);
  $('#table-summary').textContent = `Показано ${number(items.length)} из ${number(state.supplies.length)} поставок`;
  if (!items.length) {
    $('#table-container').innerHTML = state.supplies.length
      ? empty('Поставки не найдены', 'Измените поисковый запрос или сбросьте фильтры.')
      : empty('Первая поставка — начало порядка', 'Нажмите «Новая поставка», чтобы зарегистрировать первую партию сырья.');
    return;
  }
  $('#table-container').innerHTML = `<table><thead><tr><th>№ поставки</th><th>Поставщик</th><th>Вид сырья</th><th>Поступление</th><th class="numeric">Вес, кг</th><th class="numeric">Остаток, кг</th><th>Субпродукты</th><th><span class="sr-only">Действия</span></th></tr></thead><tbody>${items.map((item) => `<tr>
    <td class="record-id">#${e(item.id)}</td><td class="supplier" title="${e(item.commingFrom)}">${e(item.commingFrom || 'Не указан')}</td>
    <td><span class="badge ${['cattle', 'pig', 'sheep', 'poultry'].includes(item.livestockType) ? item.livestockType : ''}">${e(livestockName(item.livestockType))}</span></td>
    <td>${e(date(item.dateOfReceipt))}</td><td class="numeric">${number(item.weight)}</td><td class="numeric">${state.errors.sales ? '—' : number(remaining(item, state.sales))}</td>
    <td title="${e((item.offals || []).map((offal) => offal.name).join(', '))}">${item.offals?.length ? `${item.offals.length} поз.` : '—'}</td>
    <td><div class="row-actions"><button class="icon-button" data-action="edit" data-id="${e(item.id)}" aria-label="Редактировать поставку ${e(item.id)}" title="Редактировать" ${state.errors.offals ? 'disabled' : ''}>✎</button><button class="icon-button" data-action="delete" data-id="${e(item.id)}" aria-label="Удалить поставку ${e(item.id)}" title="Удалить">×</button></div></td></tr>`).join('')}</tbody></table>`;
}

function renderSales() {
  const items = [...state.sales].sort((a, b) => b.date - a.date || b.id - a.id);
  $('#result-count').textContent = number(items.length);
  $('#table-summary').textContent = `Всего продаж: ${number(items.length)}`;
  $('#table-container').innerHTML = !items.length ? empty('Продаж пока нет', 'Здесь появятся продажи, зарегистрированные через API.')
    : `<table><thead><tr><th>№ продажи</th><th>Поставка</th><th>Дата продажи</th><th class="numeric">Вес, кг</th></tr></thead><tbody>${items.map((sale) => `<tr><td class="record-id">#${e(sale.id)}</td><td>#${e(sale.supplyId)}</td><td>${e(date(sale.date))}</td><td class="numeric">${number(sale.weight)}</td></tr>`).join('')}</tbody></table>`;
}

function renderOffals() {
  $('#result-count').textContent = number(state.offals.length);
  $('#table-summary').textContent = `Позиций в справочнике: ${number(state.offals.length)}`;
  $('#table-container').innerHTML = !state.offals.length ? empty('Справочник пока пуст', 'Добавьте позиции в справочник на стороне сервера.')
    : `<table><thead><tr><th>Код</th><th>Наименование</th></tr></thead><tbody>${state.offals.map((offal) => `<tr><td class="record-id">#${e(offal.id)}</td><td class="supplier">${e(offal.name)}</td></tr>`).join('')}</tbody></table>`;
}

async function load() {
  if (state.loading && state.initialized) return;
  state.initialized = true;
  state.loading = true;
  state.errors = {};
  render();
  const keys = ['supplies', 'sales', 'offals'];
  const results = await Promise.allSettled(keys.map((key) => api[key]()));
  results.forEach((result, index) => {
    const key = keys[index];
    if (result.status === 'fulfilled' && (result.value === null || Array.isArray(result.value))) state[key] = result.value || [];
    else {
      state[key] = [];
      state.errors[key] = result.reason?.message || 'Сервер вернул некорректный формат данных.';
    }
  });
  state.loading = false;
  render();
}

function localDate(timestamp = Date.now()) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function openForm(id) {
  const existing = id === undefined ? null : state.supplies.find((item) => item.id === id);
  if (id !== undefined && !existing) return;
  state.editing = existing;
  const form = $('#supply-form');
  form.reset();
  $('#form-error').hidden = true;
  $('#form-title').textContent = existing ? `Поставка #${existing.id}` : 'Новая поставка';
  form.elements.commingFrom.value = existing?.commingFrom || '';
  form.elements.livestockType.value = existing?.livestockType || '';
  form.elements.dateOfReceipt.value = localDate(existing?.dateOfReceipt ? existing.dateOfReceipt * 1000 : Date.now());
  form.elements.weight.value = existing?.weight ?? '';
  // Keep selected legacy positions even if the current dictionary no longer lists them.
  const options = [...state.offals, ...(existing?.offals || []).filter((offal) => !state.offals.some((o) => o.id === offal.id))];
  $('#offal-options').innerHTML = options.map((offal) => `<label><input type="checkbox" name="offals" value="${e(offal.id)}" ${existing?.offals?.some((o) => o.id === offal.id) ? 'checked' : ''}>${e(offal.name)}</label>`).join('');
  $('#offal-hint').textContent = state.errors.offals
    ? 'Не удалось загрузить справочник субпродуктов. Закройте форму и нажмите «Обновить», чтобы повторить загрузку.'
    : options.length ? 'Отметьте субпродукты, входящие в партию.' : 'В справочнике пока нет субпродуктов.';
  $('#supply-dialog').showModal();
}

function lockForm(busy) {
  state.saving = busy;
  $('#supply-form').querySelectorAll('input, button').forEach((input) => { input.disabled = busy; });
  $('#save-supply').textContent = busy ? 'Сохраняем…' : 'Сохранить поставку';
}

$('#supply-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (state.saving) return;
  $('#form-error').hidden = true;
  try {
    const options = [...state.offals, ...(state.editing?.offals || []).filter((offal) => !state.offals.some((o) => o.id === offal.id))];
    const payload = supplyPayload(new FormData(event.currentTarget), options, state.editing);
    lockForm(true);
    await (state.editing ? api.update(payload) : api.create(payload));
    $('#supply-dialog').close();
    toast(state.editing ? 'Изменения сохранены' : 'Поставка зарегистрирована');
    await load();
  } catch (error) {
    $('#form-error').textContent = error.message;
    $('#form-error').hidden = false;
  } finally { lockForm(false); }
});

$('#confirm-delete').addEventListener('click', async () => {
  if (!state.deleting || state.saving) return;
  state.saving = true;
  $('#delete-error').hidden = true;
  $('#delete-dialog').querySelectorAll('button').forEach((button) => { button.disabled = true; });
  try {
    await api.remove(state.deleting.id);
    $('#delete-dialog').close();
    toast('Поставка удалена');
    await load();
  } catch (error) {
    $('#delete-error').textContent = error.message;
    $('#delete-error').hidden = false;
  } finally {
    state.saving = false;
    $('#delete-dialog').querySelectorAll('button').forEach((button) => { button.disabled = false; });
  }
});

$('#table-container').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  if (button.dataset.action === 'retry') return load();
  const id = Number(button.dataset.id);
  if (button.dataset.action === 'edit') return openForm(id);
  state.deleting = state.supplies.find((item) => item.id === id);
  if (!state.deleting) return;
  $('#delete-description').textContent = `Поставка #${id} от «${state.deleting.commingFrom}» будет удалена. Это действие нельзя отменить.`;
  $('#delete-error').hidden = true;
  $('#delete-dialog').showModal();
});

$('#add-supply').addEventListener('click', () => openForm());
$('#refresh').addEventListener('click', load);
$('#filters').addEventListener('submit', (event) => event.preventDefault());
$('#filters').addEventListener('input', render);
$('#filters').addEventListener('change', render);
$('#filters').addEventListener('reset', () => setTimeout(render, 0));
document.querySelectorAll('.close-dialog').forEach((button) => button.addEventListener('click', () => $('#supply-dialog').close()));
['#cancel-delete', '#close-delete'].forEach((selector) => $(selector).addEventListener('click', () => $('#delete-dialog').close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('cancel', (event) => { if (state.saving) event.preventDefault(); }));
window.addEventListener('hashchange', render);
window.addEventListener('beforeunload', (event) => { if (state.saving) event.preventDefault(); });
$('#today').textContent = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
load();
