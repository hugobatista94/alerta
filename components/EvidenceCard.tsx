'use client';

import { useEffect, useRef, useState } from 'react';
import type { Category } from '@/lib/types';
import {
  addEvidenceFile,
  listEvidenceFiles,
  removeEvidenceFile,
  type EvidenceFileMeta,
} from '@/lib/evidenceFiles';

interface EvidenceCardProps {
  categories: Category[];
  freeText: string;
  evidenceNotes: string;
  reportDraft: string;
  onEvidenceNotesChange: (value: string) => void;
  onReportDraftChange: (value: string) => void;
}

const ACCEPTED_FILE_TYPES = 'image/*,application/pdf,.doc,.docx';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceCard({
  categories,
  freeText,
  evidenceNotes,
  reportDraft,
  onEvidenceNotesChange,
  onReportDraftChange,
}: EvidenceCardProps) {
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [files, setFiles] = useState<EvidenceFileMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listEvidenceFiles().then(setFiles);
  }, []);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
    // Reset the input's value only after snapshotting the files into a plain
    // array: event.target.files is a live FileList tied to the input's
    // value, so clearing the value here (to allow re-selecting the same
    // file later) would otherwise empty the very list we just captured.
    event.target.value = '';
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        await addEvidenceFile(file);
      }
      setFiles(await listEvidenceFiles());
      setUploadError(null);
    } catch {
      setUploadError('Não foi possível anexar o arquivo agora. Tente novamente em instantes.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveFile(id: string) {
    await removeEvidenceFile(id);
    setFiles(await listEvidenceFiles());
  }

  async function handleDraft() {
    setIsDrafting(true);
    try {
      const response = await fetch('/api/draft-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories, freeText, evidenceNotes }),
      });
      const result = await response.json();
      onReportDraftChange(result.draft);
      setDraftError(null);
    } catch {
      setDraftError('Não foi possível gerar o rascunho agora. Tente novamente em instantes.');
    } finally {
      setIsDrafting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-alerta-charcoal p-5 sm:p-6 text-alerta-light shadow-lg">
      <h2 className="text-lg font-bold">Reúna suas evidências</h2>
      <p className="mt-1 text-sm text-alerta-light/80">
        Anote capturas de tela, links, nomes e datas relevantes.
      </p>
      <textarea
        value={evidenceNotes}
        onChange={(event) => onEvidenceNotesChange(event.target.value)}
        rows={3}
        className="mt-3 w-full rounded-lg bg-alerta-black p-3 text-base outline-none ring-1 ring-alerta-light/20 focus:ring-alerta-red"
        placeholder="Ex: print de 12/09 do perfil @exemplo, link: ..."
      />

      <p className="mt-4 text-sm text-alerta-light/80">
        Anexe prints, imagens ou documentos (ficam salvos só neste
        dispositivo):
      </p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFilesSelected}
        disabled={isUploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mt-2 min-h-[44px] rounded-lg border border-alerta-light/30 bg-alerta-light/10 px-4 py-2 text-sm font-medium text-alerta-light hover:bg-alerta-light/20 disabled:opacity-50"
      >
        {isUploading ? 'Anexando...' : 'Escolher arquivos'}
      </button>
      {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}

      {files.length === 0 && !isUploading && (
        <p className="mt-3 text-sm text-alerta-light/50">
          Nenhum arquivo anexado ainda.
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-alerta-black/60 px-3 py-2 text-sm"
            >
              <span className="truncate">
                {file.name}{' '}
                <span className="text-alerta-light/50">
                  ({formatFileSize(file.size)})
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.id)}
                className="-m-2 shrink-0 p-2 text-alerta-light/60 hover:text-alerta-red"
                aria-label={`Remover anexo ${file.name}`}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleDraft}
        disabled={isDrafting}
        className="mt-3 min-h-[44px] rounded-lg bg-alerta-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isDrafting ? 'Redigindo...' : 'Ajude-me a redigir minha denúncia'}
      </button>
      {draftError && (
        <p className="mt-3 text-sm text-red-400">
          {draftError}
        </p>
      )}
      {reportDraft && (
        <textarea
          value={reportDraft}
          onChange={(event) => onReportDraftChange(event.target.value)}
          rows={6}
          className="mt-3 w-full rounded-lg bg-white p-3 text-base text-alerta-black outline-none"
        />
      )}
    </section>
  );
}
