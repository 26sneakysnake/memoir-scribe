import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Loader2, Settings, Eye, Upload } from 'lucide-react';
import { apiService, type Book, type Chapter, type AIProcessingStatus } from '@/services/apiService';
import { useApiAuth } from '@/hooks/useApiAuth';

interface BookManagerProps {
  onBookSelect: (book: Book) => void;
  selectedBook: Book | null;
}

export const BookManager: React.FC<BookManagerProps> = ({ onBookSelect, selectedBook }) => {
  useApiAuth();
  const { toast } = useToast();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    author: '',
  });

  // Load books from backend
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // TODO: Get user's books - for now we'll create a mock endpoint
      // const userBooks = await apiService.getUserBooks();
      // setBooks(userBooks);
      setBooks([]); // Placeholder until backend implements getUserBooks
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title and author fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const book = await apiService.createBook(newBook);
      setBooks(prev => [...prev, book]);
      onBookSelect(book);
      
      toast({
        title: "Book created",
        description: "Your new book has been created successfully.",
      });
      
      setNewBook({ title: '', description: '', author: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating book:', error);
      toast({
        title: "Error",
        description: "Failed to create book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'published': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-2">Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">My Books</h2>
          <p className="text-sm text-muted-foreground">
            {books.length} {books.length === 1 ? 'book' : 'books'} in your library
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="vintage-card">
            <DialogHeader>
              <DialogTitle className="font-serif">Create New Book</DialogTitle>
              <DialogDescription>
                Start a new memoir or story project
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Book Title *</label>
                <Input
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="Enter book title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Author *</label>
                <Input
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="Your name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Describe your book..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBook} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Book'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {books.length === 0 ? (
        <Card className="vintage-card text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-serif mb-2">No books yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first book to start organizing your memories and stories
            </CardDescription>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card 
              key={book.id} 
              className={`vintage-card hover:shadow-glow transition-organic cursor-pointer ${
                selectedBook?.id === book.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onBookSelect(book)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-lg">{book.title}</CardTitle>
                    <CardDescription className="mt-1">
                      by {book.author}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(book.status)} text-white`}>
                    {book.status}
                  </Badge>
                </div>
                {book.description && (
                  <CardDescription className="mt-2 line-clamp-2">
                    {book.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Created {new Date(book.created_at).toLocaleDateString()}
                  {book.updated_at !== book.created_at && (
                    <> • Updated {new Date(book.updated_at).toLocaleDateString()}</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};