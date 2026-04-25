const NAMESPACE = "aaocab_form_";
const QUEUE_KEY = "aaocab_upload_queue";

// ---- Form progress ----

export function saveFormProgress(
  step: string,
  data: Record<string, unknown>
): void {
  try {
    localStorage.setItem(NAMESPACE + step, JSON.stringify(data));
  } catch {
    // Storage unavailable — silently ignore
  }
}

export function loadFormProgress(
  step: string
): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(NAMESPACE + step);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function clearFormProgress(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(NAMESPACE)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage unavailable — silently ignore
  }
}

// ---- Upload queue ----

interface QueuedUpload {
  fileName: string;
  fileType: string;
  fileDataBase64: string;
  metadata: Record<string, string>;
  queuedAt: string;
}

export function queueUpload(
  file: File,
  metadata: Record<string, string>
): void {
  try {
    const existing = getQueuedUploadsRaw();
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1] ?? "";
      const entry: QueuedUpload = {
        fileName: file.name,
        fileType: file.type,
        fileDataBase64: base64,
        metadata,
        queuedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify([...existing, entry])
      );
    };
    reader.readAsDataURL(file);
  } catch {
    // Storage unavailable — silently ignore
  }
}

function getQueuedUploadsRaw(): QueuedUpload[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedUpload[];
  } catch {
    return [];
  }
}

export function getQueuedUploads(): Array<{
  file: File;
  metadata: Record<string, string>;
}> {
  const raw = getQueuedUploadsRaw();
  return raw.map((entry) => {
    const bytes = Uint8Array.from(atob(entry.fileDataBase64), (c) =>
      c.charCodeAt(0)
    );
    const file = new File([bytes], entry.fileName, { type: entry.fileType });
    return { file, metadata: entry.metadata };
  });
}

export async function processUploadQueue(): Promise<void> {
  const queue = getQueuedUploadsRaw();
  if (queue.length === 0) return;

  // In production this would POST to an upload endpoint.
  // For now: clear the queue when online (uploads happen inline elsewhere).
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    // Storage unavailable — silently ignore
  }
}

// ---- Network status ----

export function isOnline(): boolean {
  return navigator.onLine;
}
