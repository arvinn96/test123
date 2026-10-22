const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

// Disable a button while its request is in flight
async function withButton(button, fn) {
  button.disabled = true;
  try {
    await fn();
  } catch (err) {
    alert(err.message);
  } finally {
    button.disabled = false;
  }
}

// Status
async function loadStatus() {
  try {
    const health = await api('/health');
    $('health').textContent = health.status;
    $('health').className = 'ok';
    const info = await api('/api/info');
    $('env').textContent = `${info.environment} · Node ${info.node}`;
  } catch {
    $('health').textContent = 'unreachable';
  }
}

// Counter
function showCounter(data) {
  $('counter').textContent = data.value;
}

$('increment').addEventListener('click', (e) =>
  withButton(e.currentTarget, async () => showCounter(await api('/api/counter/increment', { method: 'POST' })))
);

$('reset').addEventListener('click', (e) =>
  withButton(e.currentTarget, async () => showCounter(await api('/api/counter/reset', { method: 'POST' })))
);

// Tasks
function renderTasks(tasks) {
  const list = $('tasks');
  list.replaceChildren();
  $('tasks-empty').hidden = tasks.length > 0;

  for (const task of tasks) {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.title}" as done`);
    checkbox.addEventListener('change', async () => {
      await api(`/api/tasks/${task.id}`, { method: 'PATCH' });
      loadTasks();
    });

    const title = document.createElement('span');
    title.textContent = task.title;

    const del = document.createElement('button');
    del.className = 'link';
    del.textContent = 'Delete';
    del.addEventListener('click', (e) =>
      withButton(e.currentTarget, async () => {
        await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
        loadTasks();
      })
    );

    li.append(checkbox, title, del);
    list.append(li);
  }
}

async function loadTasks() {
  renderTasks(await api('/api/tasks'));
}

$('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('task-title');
  const error = $('task-error');
  const button = e.currentTarget.querySelector('button');
  button.disabled = true;
  error.hidden = true;
  try {
    await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title: input.value }) });
    input.value = '';
    await loadTasks();
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
    input.focus();
  }
});

// Tip
$('get-tip').addEventListener('click', (e) =>
  withButton(e.currentTarget, async () => {
    $('tip').textContent = (await api('/api/tip')).tip;
  })
);

// Initial load
loadStatus();
api('/api/counter').then(showCounter).catch(() => {});
loadTasks().catch(() => {});
