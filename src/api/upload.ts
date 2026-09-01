import axios from 'axios';
import apiClient from './client';

interface SignedUrlPayload {
  uploadUrl: string;
  fileUrl: string;
}

/**
 * Upload a file to S3 via the backend-issued signed URL.
 * Returns the permanent public fileUrl to store in the profile.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const { data } = await apiClient.post<{ data: SignedUrlPayload }>('/upload/signed-url', {
    fileName: file.name,
    fileType: file.type,
    folder,
  });

  // Upload directly to S3 — no Authorization header here
  await axios.put(data.data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });

  return data.data.fileUrl;
}
