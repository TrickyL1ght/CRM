import test from 'node:test';
import assert from 'node:assert/strict';
import { filterSupplies, remaining, supplyPayload, escapeHTML } from '../src/domain.js';

const supplies = [
  { id: 1, commingFrom: 'Агроферма', livestockType: 'cattle', dateOfReceipt: 1793700000, weight: 500 },
  { id: 2, commingFrom: 'Север', livestockType: 'pig', dateOfReceipt: 1793786400, weight: 700 },
];

test('Поиск без учёта регистра, вид сырья и даты работают вместе', () => {
  assert.deepEqual(filterSupplies(supplies, { query: '  АГРО  ', type: 'cattle', from: '2026-11-03', to: '2026-11-03' }).map((s) => s.id), [1]);
  assert.deepEqual(filterSupplies(supplies, { query: 'КРС' }).map((s) => s.id), [1]);
  assert.deepEqual(filterSupplies(supplies, { type: 'sheep' }), []);
  assert.deepEqual(filterSupplies(supplies, {}).map((s) => s.id), [2, 1]);
});

test('Остаток учитывает только продажи соответствующей поставки', () => {
  assert.equal(remaining(supplies[0], [{ supplyId: 1, weight: 80 }, { supplyId: 1, weight: 20 }, { supplyId: 2, weight: 300 }]), 400);
  assert.equal(remaining(supplies[0], []), 500);
});

function form(weight = '500') {
  const result = new FormData();
  for (const [key, value] of Object.entries({ weight, commingFrom: '  Агроферма  ', livestockType: 'cattle', dateOfReceipt: '2026-11-04', offals: '2' })) result.set(key, value);
  return result;
}

test('Payload соответствует текущим JSON-полям API и сохраняет продажи при правке', () => {
  const sale = [{ id: 7, supplyId: 1, weight: 10, date: 1793786400 }];
  const payload = supplyPayload(form(), [{ id: 2, name: 'Печень' }, { id: 3, name: 'Хвосты' }], { id: 1, sale });
  assert.equal(payload.id, 1);
  assert.equal(payload.commingFrom, 'Агроферма');
  assert.equal(payload.weight, 500);
  assert.ok(payload.dateOfReceipt > 1e9 && payload.dateOfReceipt < 1e10);
  assert.deepEqual(payload.offals, [{ id: 2, name: 'Печень' }]);
  assert.deepEqual(payload.sale, sale);
  assert.equal('id' in supplyPayload(form(), [], null), false);
});

test('Некорректный вес и пустой поставщик не отправляются', () => {
  for (const weight of ['0', '-1', '0.5', 'NaN', '2147483648']) assert.throws(() => supplyPayload(form(weight), []));
  const input = form();
  input.set('commingFrom', '   ');
  assert.throws(() => supplyPayload(input, []));
});

test('Данные из API экранируются перед вставкой в HTML', () => {
  assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
