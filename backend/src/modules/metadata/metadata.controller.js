import { getPropertyTypes, getLocations, getModelHealth } from './metadata.service.js';

export function propertyTypes(_req, res) {
  res.json(getPropertyTypes());
}

export function locations(_req, res) {
  res.json(getLocations());
}

export function modelHealth(_req, res) {
  res.json(getModelHealth());
}
