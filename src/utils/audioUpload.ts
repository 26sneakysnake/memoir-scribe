import { backendService } from '@/services/backendService';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export interface UploadProgress {
  uploadProgress: number;
  isUploading: boolean;
  isProcessing: boolean;
  error?: string;
}

export const uploadAudioFile = async (
  audioBlob: Blob,
  chapterId: string,
  filename: string,
  onProgress?: (progress: UploadProgress) => void
) => {
  try {
    onProgress?.({ uploadProgress: 0, isUploading: true, isProcessing: false });

    // Convert blob to file-like object
    const audioFile = new File([audioBlob], filename, {
      type: audioBlob.type || 'audio/webm'
    });

    // Initiate upload
    const { uploadId, chunkSize } = await backendService.initiateUpload(
      audioFile.name,
      audioFile.size,
      chapterId
    );

    const effectiveChunkSize = chunkSize || CHUNK_SIZE;
    const totalChunks = Math.ceil(audioFile.size / effectiveChunkSize);

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * effectiveChunkSize;
      const end = Math.min(start + effectiveChunkSize, audioFile.size);
      const chunk = audioFile.slice(start, end);

      await backendService.uploadChunk(uploadId, i, chunk);

      // Update progress
      const uploadProgress = Math.round(((i + 1) / totalChunks) * 100);
      onProgress?.({ 
        uploadProgress, 
        isUploading: true, 
        isProcessing: false 
      });
    }

    // Complete upload
    const result = await backendService.completeUpload(uploadId);
    
    onProgress?.({ 
      uploadProgress: 100, 
      isUploading: false, 
      isProcessing: true 
    });

    return result;
  } catch (error) {
    onProgress?.({ 
      uploadProgress: 0, 
      isUploading: false, 
      isProcessing: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
    throw error;
  }
};

export const pollProcessingStatus = async (
  taskId: string,
  onStatusUpdate?: (status: string, progress?: number) => void,
  onComplete?: (result: any) => void,
  onError?: (error: string) => void
) => {
  const checkStatus = async () => {
    try {
      const status = await backendService.getUploadStatus(taskId);
      
      onStatusUpdate?.(status.status, status.progress);

      if (status.status === 'completed') {
        onComplete?.(status.result);
      } else if (status.status === 'failed') {
        onError?.(status.error || 'Processing failed');
      } else if (status.status === 'processing') {
        setTimeout(checkStatus, 2000);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Status check failed');
    }
  };

  checkStatus();
};