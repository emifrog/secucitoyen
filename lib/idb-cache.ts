'use client';

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'secucitoyen';
const DB_VERSION = 1;

// Stores
const STORE_FICHES = 'fiches_secours';
const STORE_ALERTES = 'alertes_cache';
const STORE_DAE = 'defibrillateurs_cache';

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // durée de vie en ms
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Fiches secours consultées (offline)
        if (!db.objectStoreNames.contains(STORE_FICHES)) {
          db.createObjectStore(STORE_FICHES, { keyPath: 'key' });
        }
        // Cache alertes
        if (!db.objectStoreNames.contains(STORE_ALERTES)) {
          db.createObjectStore(STORE_ALERTES, { keyPath: 'key' });
        }
        // Cache défibrillateurs
        if (!db.objectStoreNames.contains(STORE_DAE)) {
          db.createObjectStore(STORE_DAE, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ========================
// API générique
// ========================

async function cacheGet<T>(store: string, key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const entry = await db.get(store, key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Vérifier le TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      await db.delete(store, key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

async function cacheSet<T>(store: string, key: string, data: T, ttlMs: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry<T> = { key, data, timestamp: Date.now(), ttl: ttlMs };
    await db.put(store, entry);
  } catch {
    // Silently fail — cache is optional
  }
}

async function cacheClear(store: string): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(store);
  } catch {
    // Silently fail
  }
}

// ========================
// Fiches secours (offline)
// ========================

const FICHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 jours

export async function cacheFiche<T>(id: string, data: T): Promise<void> {
  return cacheSet(STORE_FICHES, id, data, FICHE_TTL);
}

export async function getCachedFiche<T>(id: string): Promise<T | null> {
  return cacheGet<T>(STORE_FICHES, id);
}

export async function getAllCachedFiches<T>(): Promise<T[]> {
  try {
    const db = await getDB();
    const entries = await db.getAll(STORE_FICHES) as CacheEntry<T>[];
    const now = Date.now();
    return entries
      .filter((e) => now - e.timestamp <= e.ttl)
      .map((e) => e.data);
  } catch {
    return [];
  }
}

// ========================
// Alertes (cache court)
// ========================

const ALERTE_TTL = 5 * 60 * 1000; // 5 minutes

export async function cacheAlertes<T>(dept: string, data: T): Promise<void> {
  return cacheSet(STORE_ALERTES, `alertes-${dept}`, data, ALERTE_TTL);
}

export async function getCachedAlertes<T>(dept: string): Promise<T | null> {
  return cacheGet<T>(STORE_ALERTES, `alertes-${dept}`);
}

// ========================
// Défibrillateurs (cache moyen)
// ========================

const DAE_TTL = 60 * 60 * 1000; // 1 heure

export async function cacheDAE<T>(key: string, data: T): Promise<void> {
  return cacheSet(STORE_DAE, key, data, DAE_TTL);
}

export async function getCachedDAE<T>(key: string): Promise<T | null> {
  return cacheGet<T>(STORE_DAE, key);
}

// ========================
// Nettoyage
// ========================

export async function clearAllCaches(): Promise<void> {
  await Promise.all([
    cacheClear(STORE_FICHES),
    cacheClear(STORE_ALERTES),
    cacheClear(STORE_DAE),
  ]);
}

/**
 * Vérifie si IndexedDB est disponible dans le navigateur
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  } catch {
    return false;
  }
}
