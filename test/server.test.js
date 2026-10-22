const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let server;
let base;

test.before(() => {
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

const call = (path, options = {}) =>
  fetch(base + path, { headers: { 'Content-Type': 'application/json' }, ...options });

test('GET /health returns ok', async () => {
  const res = await call('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
});

test('counter increments and resets', async () => {
  await call('/api/counter/reset', { method: 'POST' });
  await call('/api/counter/increment', { method: 'POST' });
  const res = await call('/api/counter/increment', { method: 'POST' });
  assert.strictEqual((await res.json()).value, 2);

  const reset = await call('/api/counter/reset', { method: 'POST' });
  assert.strictEqual((await reset.json()).value, 0);
});

test('tasks can be added, toggled and deleted', async () => {
  const created = await call('/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'Test task' }) });
  assert.strictEqual(created.status, 201);
  const task = await created.json();
  assert.strictEqual(task.done, false);

  const toggled = await call(`/api/tasks/${task.id}`, { method: 'PATCH' });
  assert.strictEqual((await toggled.json()).done, true);

  const deleted = await call(`/api/tasks/${task.id}`, { method: 'DELETE' });
  assert.strictEqual(deleted.status, 204);

  const list = await (await call('/api/tasks')).json();
  assert.ok(!list.some((t) => t.id === task.id));
});

test('adding a task without a title is rejected', async () => {
  const res = await call('/api/tasks', { method: 'POST', body: JSON.stringify({ title: '   ' }) });
  assert.strictEqual(res.status, 400);
});

test('unknown task returns 404', async () => {
  const res = await call('/api/tasks/99999', { method: 'DELETE' });
  assert.strictEqual(res.status, 404);
});

test('GET /api/tip returns a tip', async () => {
  const res = await call('/api/tip');
  assert.ok((await res.json()).tip.length > 0);
});
