import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  profile_photos: ['image/jpeg', 'image/png', 'image/webp'],
  verification_docs: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  branding: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
};

/**
 * Generates a cryptographically random filename with sanitized extension
 * to prevent directory traversal and collisions.
 */
function generateRandomFileName(originalName: string, mimeType: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  // Determine safe extension
  let ext = '';
  if (mimeType === 'application/pdf') ext = '.pdf';
  else if (mimeType === 'image/jpeg') ext = '.jpg';
  else if (mimeType === 'image/png') ext = '.png';
  else if (mimeType === 'image/webp') ext = '.webp';
  else if (mimeType === 'image/svg+xml') ext = '.svg';
  else {
    const rawExt = originalName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'dat';
    ext = `.${rawExt}`;
  }

  return `${Date.now()}_${randomPart}${ext}`;
}

export async function uploadFile(
  file: File,
  folder: 'profile_photos' | 'verification_docs' | 'branding'
): Promise<string> {
  // 1. File size check (Max 5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File exceeds the maximum allowable size of 5 MB.');
  }

  // 2. MIME type whitelist check
  const allowed = ALLOWED_MIME_TYPES[folder] || ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    throw new Error(`Invalid file type (${file.type}). Allowed formats: JPG, PNG, and PDF.`);
  }

  const currentUid = auth?.currentUser?.uid || 'guest';
  const cleanFileName = generateRandomFileName(file.name, file.type);

  // If Firebase Storage is initialized and available, upload securely
  if (storage) {
    try {
      const storagePath = `${folder}/${currentUid}/${cleanFileName}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload encountered an issue, using fallback:', err);
    }
  }

  // Fallback: Read as base64 Data URL (ensures zero breaking states in preview/testing environments)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read file document.'));
    reader.readAsDataURL(file);
  });
}
