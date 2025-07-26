import { getAuth } from 'firebase/auth';

const API_URL = 'http://localhost:8000/api/v1';

// Get current user's Firebase token
const getCurrentUserToken = async (): Promise<string> => {
  const auth = getAuth();
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  throw new Error('User not authenticated');
};

export interface UploadInitResponse {
  uploadId: string;
  chunkSize: number;
}

export interface UploadCompleteResponse {
  taskId: string;
  recordingId: string;
  status: string;
}

export interface UploadStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    transcription: string;
    duration: number;
  };
  error?: string;
}

export interface CompileResponse {
  taskId: string;
  status: string;
}

export interface CompileStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    compiledText: string;
    summary: string;
    keyPoints: string[];
  };
  error?: string;
}

export const backendService = {
  // Check if backend is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  // Initiate chunked upload
  async initiateUpload(filename: string, fileSize: number, chapterId: string): Promise<UploadInitResponse> {
    const token = await getCurrentUserToken();
    const response = await fetch(`${API_URL}/upload/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filename, fileSize, chapterId })
    });

    if (!response.ok) {
      throw new Error(`Upload initiation failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Upload a chunk
  async uploadChunk(uploadId: string, chunkIndex: number, chunkData: Blob): Promise<void> {
    const token = await getCurrentUserToken();
    const response = await fetch(`${API_URL}/upload/chunk/${uploadId}/${chunkIndex}`, {
      method: 'PUT',
      body: chunkData,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      }
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }
  },

  // Complete upload
  async completeUpload(uploadId: string): Promise<UploadCompleteResponse> {
    const token = await getCurrentUserToken();
    const response = await fetch(`${API_URL}/upload/complete/${uploadId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Upload completion failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Get upload/processing status
  async getUploadStatus(taskId: string): Promise<UploadStatusResponse> {
    const token = await getCurrentUserToken();
    const response = await fetch(`${API_URL}/upload/status/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Compile chapter
  async compileChapter(chapterId: string): Promise<CompileResponse> {
    const token = await getCurrentUserToken();
    const response = await fetch(`${API_URL}/chapters/${chapterId}/compile`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Compilation failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Get compilation status
  async getCompileStatus(taskId: string): Promise<CompileStatusResponse> {
    const token = await getCurrentUserToken();
    const response = await fetch(`${API_URL}/compile/status/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Compile status check failed: ${response.statusText}`);
    }

    return response.json();
  }
};