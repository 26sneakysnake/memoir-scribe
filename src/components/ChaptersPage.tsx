import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookManager } from '@/components/BookManager';
import { ChapterManager } from '@/components/ChapterManager';
import { useToast } from '@/hooks/use-toast';
import { type Book } from '@/services/apiService';
import { useApiAuth } from '@/hooks/useApiAuth';

const ChaptersPage = () => {
  useApiAuth();
  const { toast } = useToast();
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [view, setView] = useState<'books' | 'chapters'>('books');

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setView('chapters');
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setView('books');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-cursive font-bold text-primary mb-4">
          {view === 'books' ? 'My Books' : selectedBook?.title}
        </h2>
        <p className="text-muted-foreground text-lg font-serif">
          {view === 'books' 
            ? 'Your memoir and story projects' 
            : 'Organize your recordings into chapters'
          }
        </p>
      </div>

      {view === 'chapters' && selectedBook && (
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToBooks}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Books
          </Button>
        </div>
      )}

      {view === 'books' ? (
        <BookManager 
          onBookSelect={handleBookSelect}
          selectedBook={selectedBook}
        />
      ) : selectedBook ? (
        <ChapterManager 
          book={selectedBook}
          onProcessingUpdate={() => {
            // Refresh book data or handle processing updates
            toast({
              title: "Processing update",
              description: "Chapter processing completed",
            });
          }}
        />
      ) : null}
    </div>
  );
};

export default ChaptersPage;