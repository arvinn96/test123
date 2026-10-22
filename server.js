const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const startedAt = new Date();

// In-memory store: resets when the service restarts or redeploys
const store = {
  counter: 0,
  tasks: [],
  nextTaskId: 1,
};

const TIPS = [
  'Map the current process before automating it - automating a broken process just breaks it faster.',
  'Define the KPI before the dashboard. A chart without a decision behind it is decoration.',
  'Start with the highest-volume, lowest-variance task: that is where automation pays back first.',
  'Every automated control still needs an owner, evidence of operation and a review cadence.',
  'Pilot with real users early. Adoption, not technology, is usually the binding constraint.',
  'Keep an audit trail by design: who changed what, when, and why.',
  'Document exceptions. The 5% of cases that break the bot drive 50% of the support effort.',
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Railway health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'test123',
    node: process.version,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'local',
    serverTime: new Date().toISOString(),
  });
});

// Counter
app.get('/api/counter', (req, res) => {
  res.json({ value: store.counter });
});

app.post('/api/counter/increment', (req, res) => {
  store.counter += 1;
  res.json({ value: store.counter });
});

app.post('/api/counter/reset', (req, res) => {
  store.counter = 0;
  res.json({ value: store.counter });
});

// Tasks
app.get('/api/tasks', (req, res) => {
  res.json(store.tasks);
});

app.post('/api/tasks', (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or fewer' });
  }
  const task = {
    id: store.nextTaskId++,
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  store.tasks.push(task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = store.tasks.find((t) => t.id === Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  task.done = !task.done;
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = store.tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  store.tasks.splice(index, 1);
  res.status(204).end();
});

// Random tip
app.get('/api/tip', (req, res) => {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  res.json({ tip });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`test123 listening on port ${PORT}`));
}

module.exports = app;
