import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Loader2, Upload, Mic, Play, Pause } from 'lucide-react';
import { apiService, type Book, type Chapter, type AIProcessingStatus } from '@/services/apiService';
import { useApiAuth } from '@/hooks/useApiAuth';

interface ChapterManagerProps {
  book: Book;
  onProcessingUpdate?: () => void;
}

export const ChapterManager: React.FC<ChapterManagerProps> = ({ book, onProcessingUpdate }) => {
  useApiAuth();
  const { toast } = useToast();
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processingChapters, setProcessingChapters] = useState<Set<string>>(new Set());
  const [newChapter, setNewChapter] = useState({
    title: '',
    content: '',
  });

  // Load chapters from backend
  useEffect(() => {
    if (book) {
      loadChapters();
    }
  }, [book]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const bookChapters = await apiService.getBookChapters(book.id);
      setChapters(bookChapters);
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast({
        title: "Error",
        description: "Failed to load chapters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async () => {
    if (!newChapter.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a chapter title.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const chapter = await apiService.addChapter(book.id, {
        title: newChapter.title,
        content: newChapter.content,
        order: chapters.length + 1,
      });
      
      setChapters(prev => [...prev, chapter]);
      
      toast({
        title: "Chapter created",
        description: "Your new chapter has been created successfully.",
      });
      
      setNewChapter({ title: '', content: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUploadAudio = async (chapterId: string, file: File) => {
    try {
      setProcessingChapters(prev => new Set([...prev, chapterId]));
      
      // Upload file using Firebase storage
      const { uploadService } = await import('@/services/uploadService');
      const audioUrl = await uploadService.uploadAudio('current-user-id', chapterId, file);
      
      // Start AI processing
      const { session_id } = await apiService.processTranscript({
        audio_url: audioUrl,
        book_id: book.id,
        chapter_id: chapterId,
      });
      
      // Poll for completion
      pollProcessingStatus(session_id, chapterId);
      
      toast({
        title: "Processing started",
        description: "Your audio is being processed. This may take a few minutes.",
      });
      
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload audio. Please try again.",
        variant: "destructive",
      });
      setProcessingChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterId);
        return newSet;
      });
    }
  };

  const pollProcessingStatus = async (sessionId: string, chapterId: string) => {
    try {
      const status = await apiService.getProcessingStatus(sessionId);
      
      if (status.status === 'completed') {
        const results = await apiService.getProcessingResults(sessionId);
        
        // Update chapter with processed content
        await apiService.updateChapter(chapterId, {
          content: results.story_content,
        });
        
        // Reload chapters
        await loadChapters();
        
        setProcessingChapters(prev => {
          const newSet = new Set(prev);
          newSet.delete(chapterId);
          return newSet;
        });
        
        toast({
          title: "Processing complete",
          description: "Your story has been generated successfully!",
        });
        
        onProcessingUpdate?.();
        
      } else if (status.status === 'failed') {
        setProcessingChapters(prev => {
          const newSet = new Set(prev);
          newSet.delete(chapterId);
          return newSet;
        });
        
        toast({
          title: "Processing failed",
          description: status.message || "Failed to process audio. Please try again.",
          variant: "destructive",
        });
        
      } else {
        // Continue polling
        setTimeout(() => pollProcessingStatus(sessionId, chapterId), 2000);
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
      setProcessingChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-2">Loading chapters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">Chapters</h3>
          <p className="text-sm text-muted-foreground">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} in "{book.title}"
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="vintage-card">
            <DialogHeader>
              <DialogTitle className="font-serif">Add New Chapter</DialogTitle>
              <DialogDescription>
                Create a new chapter for "{book.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Chapter Title *</label>
                <Input
                  value={newChapter.title}
                  onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                  placeholder="Enter chapter title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Initial Content</label>
                <Textarea
                  value={newChapter.content}
                  onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                  placeholder="Optional initial content..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChapter} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Chapter'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {chapters.length === 0 ? (
        <Card className="vintage-card text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-serif mb-2">No chapters yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first chapter to start building your story
            </CardDescription>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create First Chapter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <Card key={chapter.id} className="vintage-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-lg">{chapter.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Chapter {chapter.order}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(chapter.status)} text-white`}>
                    {processingChapters.has(chapter.id) ? 'processing' : chapter.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {chapter.content && (
                    <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                      <p className="line-clamp-3">{chapter.content}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'audio/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            handleUploadAudio(chapter.id, file);
                          }
                        };
                        input.click();
                      }}
                      disabled={processingChapters.has(chapter.id)}
                    >
                      {processingChapters.has(chapter.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Audio
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(chapter.created_at).toLocaleDateString()}
                    {chapter.updated_at !== chapter.created_at && (
                      <> • Updated {new Date(chapter.updated_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};