interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'processing' | 'completed' | 'published';
  metadata?: any;
}

interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content: string;
  order: number;
  status: 'draft' | 'processing' | 'completed';
  created_at: string;
  updated_at: string;
}

interface AIProcessingStatus {
  session_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

interface PublishingWorkflow {
  workflow_id: string;
  book_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: any;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Content Management
  async createBook(data: {
    title: string;
    description: string;
    author: string;
  }): Promise<Book> {
    return this.request<Book>('/api/v1/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookChapters(bookId: string): Promise<Chapter[]> {
    return this.request<Chapter[]>(`/api/v1/books/${bookId}/chapters`);
  }

  async addChapter(
    bookId: string,
    data: { title: string; content?: string; order: number }
  ): Promise<Chapter> {
    return this.request<Chapter>(`/api/v1/books/${bookId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChapter(
    chapterId: string,
    data: { title?: string; content?: string }
  ): Promise<Chapter> {
    return this.request<Chapter>(`/api/v1/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // AI Processing
  async processTranscript(data: {
    audio_url?: string;
    transcript_text?: string;
    book_id: string;
    chapter_id?: string;
  }): Promise<{ session_id: string }> {
    return this.request<{ session_id: string }>('/api/v1/ai/process-transcript', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProcessingStatus(sessionId: string): Promise<AIProcessingStatus> {
    return this.request<AIProcessingStatus>(`/api/v1/ai/status/${sessionId}`);
  }

  async getProcessingResults(sessionId: string): Promise<any> {
    return this.request<any>(`/api/v1/ai/results/${sessionId}`);
  }

  // Publishing
  async startPublishing(bookId: string): Promise<PublishingWorkflow> {
    return this.request<PublishingWorkflow>(`/api/v1/publishing/start/${bookId}`, {
      method: 'POST',
    });
  }

  async updatePublishingMetadata(
    workflowId: string,
    metadata: any
  ): Promise<void> {
    return this.request<void>(`/api/v1/publishing/${workflowId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    });
  }

  async generatePreview(workflowId: string): Promise<{ preview_url: string }> {
    return this.request<{ preview_url: string }>(
      `/api/v1/publishing/${workflowId}/preview`,
      {
        method: 'POST',
      }
    );
  }

  async publishBook(workflowId: string): Promise<void> {
    return this.request<void>(`/api/v1/publishing/${workflowId}/publish`, {
      method: 'POST',
    });
  }

  // Marketplace
  async getMarketplaceBooks(): Promise<Book[]> {
    return this.request<Book[]>('/api/v1/marketplace/books');
  }

  async getMarketplaceBook(bookId: string): Promise<Book> {
    return this.request<Book>(`/api/v1/marketplace/book/${bookId}`);
  }

  async unpublishBook(bookId: string): Promise<void> {
    return this.request<void>(`/api/v1/marketplace/book/${bookId}/unpublish`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  async getSystemStatus(): Promise<any> {
    return this.request<any>('/api/v1/system/status');
  }
}

export const apiService = new ApiService();
export type { Book, Chapter, AIProcessingStatus, PublishingWorkflow };