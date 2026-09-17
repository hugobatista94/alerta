// @vitest-environment node
//
// Run in the Node environment rather than jsdom: jsdom's Blob/File
// polyfill does not round-trip correctly through fake-indexeddb's
// structured-clone algorithm, which is a test-tooling limitation, not a
// real-browser one (native IndexedDB preserves Blob/File content and
// metadata faithfully).
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addEvidenceFile,
  listEvidenceFiles,
  getEvidenceFileBlob,
  removeEvidenceFile,
  clearEvidenceFiles,
} from './evidenceFiles';

function makeFile(name: string, content: string, type: string): File {
  return new File([content], name, { type });
}

describe('evidence file storage', () => {
  beforeEach(async () => {
    await clearEvidenceFiles();
  });

  it('starts empty', async () => {
    expect(await listEvidenceFiles()).toEqual([]);
  });

  it('stores a file and returns its metadata', async () => {
    const file = makeFile('print.png', 'fake-image-bytes', 'image/png');
    const meta = await addEvidenceFile(file);
    expect(meta.name).toBe('print.png');
    expect(meta.type).toBe('image/png');
    expect(meta.size).toBe(file.size);
    expect(typeof meta.id).toBe('string');
    expect(meta.id.length).toBeGreaterThan(0);
  });

  it('lists stored files in the order they were added', async () => {
    await addEvidenceFile(makeFile('a.png', 'a', 'image/png'));
    await addEvidenceFile(makeFile('b.pdf', 'b', 'application/pdf'));
    const files = await listEvidenceFiles();
    expect(files.map((f) => f.name)).toEqual(['a.png', 'b.pdf']);
  });

  it('retrieves the stored blob for a file id', async () => {
    const file = makeFile('note.txt', 'hello evidence', 'text/plain');
    const meta = await addEvidenceFile(file);
    const blob = await getEvidenceFileBlob(meta.id);
    expect(blob).toBeDefined();
    const text = await blob!.text();
    expect(text).toBe('hello evidence');
  });

  it('returns undefined for a file id that does not exist', async () => {
    expect(await getEvidenceFileBlob('does-not-exist')).toBeUndefined();
  });

  it('removes a single file by id without affecting the others', async () => {
    const meta = await addEvidenceFile(makeFile('a.png', 'a', 'image/png'));
    await addEvidenceFile(makeFile('b.png', 'b', 'image/png'));
    await removeEvidenceFile(meta.id);
    const files = await listEvidenceFiles();
    expect(files.map((f) => f.name)).toEqual(['b.png']);
  });

  it('clears all files', async () => {
    await addEvidenceFile(makeFile('a.png', 'a', 'image/png'));
    await addEvidenceFile(makeFile('b.png', 'b', 'image/png'));
    await clearEvidenceFiles();
    expect(await listEvidenceFiles()).toEqual([]);
  });
});
