export interface EvidenceFileMeta {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: number;
}

interface EvidenceFileRecord extends EvidenceFileMeta {
  blob: Blob;
}

const DB_NAME = 'alerta-evidence';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// Monotonic counter used purely to preserve insertion order when listing
// files — not a wall-clock timestamp, since two files added in the same
// millisecond would otherwise tie and make ordering non-deterministic.
let sequence = 0;

function nextId(): string {
  sequence += 1;
  return `${Date.now()}-${sequence}-${Math.random().toString(36).slice(2)}`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não está disponível neste navegador.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function toMeta(record: EvidenceFileRecord): EvidenceFileMeta {
  const { blob: _blob, ...meta } = record;
  return meta;
}

export async function addEvidenceFile(file: File): Promise<EvidenceFileMeta> {
  const db = await openDatabase();
  const record: EvidenceFileRecord = {
    id: nextId(),
    name: file.name,
    type: file.type,
    size: file.size,
    addedAt: sequence,
    blob: file,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
  return toMeta(record);
}

export async function listEvidenceFiles(): Promise<EvidenceFileMeta[]> {
  try {
    const db = await openDatabase();
    const records = await new Promise<EvidenceFileRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as EvidenceFileRecord[]);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return records.map(toMeta).sort((a, b) => a.addedAt - b.addedAt);
  } catch {
    return [];
  }
}

export async function getEvidenceFileBlob(id: string): Promise<Blob | undefined> {
  const db = await openDatabase();
  const record = await new Promise<EvidenceFileRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as EvidenceFileRecord | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record?.blob;
}

export async function removeEvidenceFile(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function clearEvidenceFiles(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
