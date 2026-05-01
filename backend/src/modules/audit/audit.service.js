import { v4 as uuid } from 'uuid';
import { createStore } from '../../utils/fileStore.js';

const store = createStore('audit.json');

export async function getAuditTrail(limit = 100) {
  const events = await store.read();
  return events.slice(0, limit);
}

export async function logEvent({ action, user = 'analyst', details = {} }) {
  const events = await store.read();
  const entry  = { id: uuid(), timestamp: new Date().toISOString(), action, user, details };
  events.unshift(entry);
  if (events.length > 1000) events.splice(1000);
  await store.write(events);
  return entry;
}

// Alias for controller
export { logEvent as logAuditEvent };
