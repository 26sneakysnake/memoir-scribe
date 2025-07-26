import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadAudioFile, pollProcessingStatus, UploadProgress } from '@/utils/audioUpload';

export interface Recording {
  id: string;
  title: string;
  duration: number;
  chapterId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  audioUrl?: string; // Firebase Storage URL (legacy)
  transcription?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  taskId?: string; // Backend processing task ID
}

export const recordingsService = {
  // Create a new recording with backend upload
  async uploadRecordingWithAudio(
    audioBlob: Blob,
    title: string,
    duration: number,
    chapterId: string,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // First create the recording document
      const recordingData = {
        title,
        duration,
        chapterId,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        processingStatus: 'pending' as const
      };

      const docRef = await addDoc(collection(db, 'recordings'), recordingData);
      const recordingId = docRef.id;

      // Generate filename
      const timestamp = Date.now();
      const filename = `recording_${recordingId}_${timestamp}.webm`;

      // Upload to backend
      const uploadResult = await uploadAudioFile(
        audioBlob,
        chapterId,
        filename,
        onProgress
      );

      // Update recording with task ID
      await updateDoc(docRef, {
        taskId: uploadResult.taskId,
        processingStatus: 'processing',
        updatedAt: Timestamp.now()
      });

      // Start polling for processing completion
      pollProcessingStatus(
        uploadResult.taskId,
        // onStatusUpdate
        async (status, progress) => {
          await updateDoc(docRef, {
            processingStatus: status,
            updatedAt: Timestamp.now()
          });
        },
        // onComplete
        async (result) => {
          await updateDoc(docRef, {
            processingStatus: 'completed',
            transcription: result.transcription,
            duration: result.duration || duration,
            updatedAt: Timestamp.now()
          });
        },
        // onError
        async (error) => {
          await updateDoc(docRef, {
            processingStatus: 'failed',
            updatedAt: Timestamp.now()
          });
          console.error('Processing failed:', error);
        }
      );

      return recordingId;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility (Firebase Storage)
  async createRecording(
    title: string,
    audioUrl: string,
    duration: number,
    chapterId: string,
    userId: string
  ): Promise<string> {
    const recordingData = {
      title,
      audioUrl,
      duration,
      chapterId,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      processingStatus: 'completed' as const
    };

    const docRef = await addDoc(collection(db, 'recordings'), recordingData);
    return docRef.id;
  },

  // Update a recording
  async updateRecording(recordingId: string, updates: Partial<Recording>): Promise<void> {
    const recordingRef = doc(db, 'recordings', recordingId);
    await updateDoc(recordingRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete a recording
  async deleteRecording(recordingId: string): Promise<void> {
    const recordingRef = doc(db, 'recordings', recordingId);
    await deleteDoc(recordingRef);
  },

  // Listen to recordings for a specific chapter
  listenToRecordings(
    chapterId: string,
    callback: (recordings: Recording[]) => void
  ): () => void {
    const q = query(
      collection(db, 'recordings'),
      where('chapterId', '==', chapterId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const recordings: Recording[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Recording[];

      callback(recordings);
    });
  }
};