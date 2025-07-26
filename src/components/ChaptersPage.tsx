import { useState } from 'react';
import { Plus, Play, Pause, Edit, Trash2, Clock, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AudioClip {
  id: string;
  title: string;
  duration: number;
  date: string;
  chapterId: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  topics: string[];
  clips: AudioClip[];
  createdAt: string;
}

const ChaptersPage = () => {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: '1',
      title: 'Childhood and Family',
      description: 'My first memories, family, the family home...',
      topics: ['First memories', 'Parents', 'Siblings', 'Family home'],
      clips: [
        { id: '1', title: 'My first steps', duration: 180, date: '2024-01-15', chapterId: '1' },
        { id: '2', title: 'My childhood home', duration: 240, date: '2024-01-16', chapterId: '1' },
      ],
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Education and Youth',
      description: 'School, friends, first love...',
      topics: ['Elementary school', 'High school', 'Childhood friends', 'First love'],
      clips: [
        { id: '3', title: 'My favorite teacher', duration: 150, date: '2024-01-17', chapterId: '2' },
      ],
      createdAt: '2024-01-17'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [newChapter, setNewChapter] = useState({
    title: '',
    description: '',
    topics: ''
  });
  const [playingClip, setPlayingClip] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSaveChapter = () => {
    const chapter: Chapter = {
      id: editingChapter?.id || Date.now().toString(),
      title: newChapter.title,
      description: newChapter.description,
      topics: newChapter.topics.split(',').map(t => t.trim()).filter(t => t),
      clips: editingChapter?.clips || [],
      createdAt: editingChapter?.createdAt || new Date().toISOString()
    };

    if (editingChapter) {
      setChapters(prev => prev.map(c => c.id === editingChapter.id ? chapter : c));
    } else {
      setChapters(prev => [...prev, chapter]);
    }

    setIsDialogOpen(false);
    setEditingChapter(null);
    setNewChapter({ title: '', description: '', topics: '' });
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setNewChapter({
      title: chapter.title,
      description: chapter.description,
      topics: chapter.topics.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const togglePlayClip = (clipId: string) => {
    if (playingClip === clipId) {
      setPlayingClip(null);
    } else {
      setPlayingClip(clipId);
      // In a real app, this would control actual audio playback
      setTimeout(() => setPlayingClip(null), 3000); // Auto-stop for demo
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Chapters</h1>
          <p className="text-muted-foreground">Organize your memories by themes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-glow glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle>
                {editingChapter ? 'Edit chapter' : 'New chapter'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Chapter title"
                value={newChapter.title}
                onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Chapter description"
                value={newChapter.description}
                onChange={(e) => setNewChapter(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <Input
                placeholder="Topics/themes (separated by commas)"
                value={newChapter.topics}
                onChange={(e) => setNewChapter(prev => ({ ...prev, topics: e.target.value }))}
              />
              <Button
                onClick={handleSaveChapter}
                disabled={!newChapter.title.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {editingChapter ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className="glass-card p-6 space-y-4 hover:glow-subtle transition-smooth">
            {/* Chapter Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">{chapter.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
              </div>
              <div className="flex space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditChapter(chapter)}
                  className="h-8 w-8 p-0 hover:bg-accent/50"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteChapter(chapter.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-1">
              {chapter.topics.slice(0, 3).map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {chapter.topics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{chapter.topics.length - 3}
                </Badge>
              )}
            </div>

            {/* Audio Clips */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recordings ({chapter.clips.length})</h4>
              {chapter.clips.length > 0 ? (
                <div className="space-y-2">
                  {chapter.clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-smooth"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePlayClip(clip.id)}
                        className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
                      >
                        {playingClip === clip.id ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{clip.title}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(clip.duration)}</span>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(clip.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No recordings for this chapter
                </p>
              )}
            </div>

            {/* Chapter Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
              <span>Created on {formatDate(chapter.createdAt)}</span>
              <span>
                {chapter.clips.reduce((total, clip) => total + clip.duration, 0) > 0 && 
                  `${formatDuration(chapter.clips.reduce((total, clip) => total + clip.duration, 0))} total`
                }
              </span>
            </div>
          </Card>
        ))}
      </div>

      {chapters.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No chapters</h3>
            <p className="text-muted-foreground">
              Start by creating your first chapter to organize your memories
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create a chapter
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChaptersPage;