import { useState } from 'react';
import { Play, Pause, MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Data interfaces
interface AudioClip {
  id: string;
  title: string;
  duration: number; // in seconds
  date: string;
  storyId: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  topics: string[];
  clips: AudioClip[];
  createdAt: string;
}

const StoriesPage = () => {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      title: 'Childhood Memories',
      description: 'Stories from my early years growing up in the countryside',
      topics: ['family', 'childhood', 'rural life'],
      clips: [
        { id: '1-1', title: 'The Old Oak Tree', duration: 285, date: '2024-01-15', storyId: '1' },
        { id: '1-2', title: 'Summer Adventures', duration: 420, date: '2024-01-16', storyId: '1' },
        { id: '1-3', title: 'Grandmother\'s Kitchen', duration: 312, date: '2024-01-17', storyId: '1' },
      ],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'College Years',
      description: 'Unforgettable experiences and friendships from university',
      topics: ['education', 'friendship', 'growth'],
      clips: [
        { id: '2-1', title: 'First Day Nerves', duration: 195, date: '2024-01-18', storyId: '2' },
        { id: '2-2', title: 'Roommate Stories', duration: 356, date: '2024-01-19', storyId: '2' },
      ],
      createdAt: '2024-01-18',
    },
    {
      id: '3',
      title: 'Career Journey',
      description: 'Professional milestones and lessons learned',
      topics: ['career', 'achievements', 'challenges'],
      clips: [
        { id: '3-1', title: 'First Job Interview', duration: 267, date: '2024-01-20', storyId: '3' },
      ],
      createdAt: '2024-01-20',
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [playingClip, setPlayingClip] = useState<string | null>(null);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    topics: '',
  });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSaveStory = () => {
    if (newStory.title.trim()) {
      const story: Story = {
        id: editingStory?.id || Date.now().toString(),
        title: newStory.title,
        description: newStory.description,
        topics: newStory.topics.split(',').map(t => t.trim()).filter(t => t),
        clips: editingStory?.clips || [],
        createdAt: editingStory?.createdAt || new Date().toISOString(),
      };

      if (editingStory) {
        setStories(stories.map(s => s.id === editingStory.id ? story : s));
      } else {
        setStories([...stories, story]);
      }

      setNewStory({ title: '', description: '', topics: '' });
      setEditingStory(null);
      setIsDialogOpen(false);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setNewStory({
      title: story.title,
      description: story.description,
      topics: story.topics.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleDeleteStory = (storyId: string) => {
    setStories(stories.filter(s => s.id !== storyId));
  };

  const togglePlayClip = (clipId: string) => {
    setPlayingClip(playingClip === clipId ? null : clipId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-cursive font-bold text-primary mb-4">My Stories</h2>
        <p className="text-muted-foreground text-lg font-serif">
          Your recorded memories and stories
        </p>
      </div>

      {/* Header with New Story Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Recorded Stories</h3>
          <p className="text-sm text-muted-foreground">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'} • {stories.reduce((acc, story) => acc + story.clips.length, 0)} clips total
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingStory(null);
                setNewStory({ title: '', description: '', topics: '' });
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Story
            </Button>
          </DialogTrigger>
          <DialogContent className="vintage-card">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingStory ? 'Edit Story' : 'Create New Story'}
              </DialogTitle>
              <DialogDescription>
                Organize your recordings into meaningful stories
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Story Title</label>
                <Input
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  placeholder="Enter story title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newStory.description}
                  onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                  placeholder="Describe this story..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Topics</label>
                <Input
                  value={newStory.topics}
                  onChange={(e) => setNewStory({ ...newStory, topics: e.target.value })}
                  placeholder="family, memories, childhood (comma-separated)"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStory} className="bg-primary hover:bg-primary/90">
                {editingStory ? 'Update Story' : 'Create Story'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stories Grid */}
      {stories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.id} className="vintage-card hover:shadow-glow transition-organic">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-lg">{story.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {story.description}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="vintage-card">
                      <DropdownMenuItem onClick={() => handleEditStory(story)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteStory(story.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Topics */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {story.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {story.clips.length} clip{story.clips.length !== 1 ? 's' : ''} • Created {formatDate(story.createdAt)}
                  </div>
                  
                  {/* Audio Clips */}
                  <div className="space-y-2">
                    {story.clips.map((clip) => (
                      <div key={clip.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                        <div className="flex items-center space-x-3 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlayClip(clip.id)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            {playingClip === clip.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{clip.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(clip.duration)} • {formatDate(clip.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="vintage-card rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-2">No Stories Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start recording your memories and organize them into stories
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Story
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPage;