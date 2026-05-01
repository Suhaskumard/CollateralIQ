import { v4 as uuid } from 'uuid';
import { createStore } from '../../utils/fileStore.js';

const store = createStore('portfolio.json');

export async function getAllCases() {
  return store.read();
}

export async function saveCase(caseData) {
  const cases = await store.read();
  const entry = { id: uuid(), date: new Date().toISOString(), ...caseData };
  cases.unshift(entry);
  await store.write(cases);
  return entry;
}

export async function deleteCase(id) {
  const cases  = await store.read();
  const filtered = cases.filter(c => c.id !== id);
  if (filtered.length === cases.length) return false;
  await store.write(filtered);
  return true;
}
