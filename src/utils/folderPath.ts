import { pb } from '../db/pocketbase';
import { workflowApi } from '../hooks/useWorkflowData';

export async function getPhotoFolderPath(registrationId: string) {
  const { path } = await pb.send<{ path: string }>(`${workflowApi}/photo-folder/${registrationId}`, { method: 'POST' });
  return path;
}

/**
 * Copies folder path to clipboard.
 */
export async function copyFolderPathToClipboard(path: string): Promise<boolean> {
  try {
    // The Clipboard API exists only on HTTPS or localhost, not on LAN stations
    // opened at http://<server-ip>:8090.
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(path);
      return true;
    }
  } catch {
    // Fall through to the legacy copy below.
  }
  return copyWithSelection(path);
}

function copyWithSelection(text: string): boolean {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
  }
}
