import { useState } from 'react';
import { Upload, Eye, DollarSign, Share2, Download, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MarketplacePage = () => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  
  const mockBooks = [
    {
      id: '1',
      title: 'My Life Journey',
      status: 'draft',
      pages: 145,
      chapters: 12,
      wordCount: 45000,
      lastModified: '2024-01-15',
      coverImage: null,
      price: 0,
      isPublished: false
    },
    {
      id: '2', 
      title: 'Family Stories',
      status: 'ready',
      pages: 89,
      chapters: 8,
      wordCount: 28000,
      lastModified: '2024-01-10',
      coverImage: null,
      price: 19.99,
      isPublished: false
    },
    {
      id: '3',
      title: 'Business Adventures',
      status: 'published',
      pages: 201,
      chapters: 15,
      wordCount: 62000,
      lastModified: '2023-12-20',
      coverImage: null,
      price: 24.99,
      isPublished: true,
      sales: 127,
      revenue: 3174.73
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'ready': return 'default';
      case 'published': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <BookOpen className="w-4 h-4" />;
      case 'ready': return <Upload className="w-4 h-4" />;
      case 'published': return <Share2 className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-cursive font-bold text-primary mb-4">Publish Your Memoir</h2>
        <p className="text-muted-foreground text-lg font-serif">
          Share your stories with the world through our marketplace
        </p>
      </div>

      {/* My Books */}
      <Card className="vintage-card">
        <CardHeader>
          <CardTitle className="font-serif">My Books</CardTitle>
          <CardDescription>Manage your memoir publications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {mockBooks.map((book) => (
              <div 
                key={book.id} 
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedBook === book.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'
                }`}
                onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(book.status)}
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <Badge variant={getStatusColor(book.status)}>{book.status}</Badge>
                  </div>
                  <div className="text-right">
                    {book.isPublished && (
                      <div className="text-sm text-muted-foreground">
                        {book.sales} sales • ${book.revenue?.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                  <div>{book.pages} pages</div>
                  <div>{book.chapters} chapters</div>
                  <div>{book.wordCount.toLocaleString()} words</div>
                  <div>Modified {book.lastModified}</div>
                </div>

                {selectedBook === book.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Book Title</label>
                          <Input defaultValue={book.title} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Textarea placeholder="Describe your memoir..." rows={3} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Price ($)</label>
                          <Input type="number" defaultValue={book.price} step="0.01" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Cover Image</label>
                          <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Upload cover image</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      {!book.isPublished ? (
                        <Button className="flex-1 bg-primary hover:bg-primary/90">
                          <Upload className="w-4 h-4 mr-2" />
                          Publish
                        </Button>
                      ) : (
                        <Button className="flex-1" variant="secondary">
                          <Share2 className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="vintage-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="vintage-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,174.73</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="vintage-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">2 in draft</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketplace Guidelines */}
      <Card className="vintage-card">
        <CardHeader>
          <CardTitle className="font-serif">Publishing Guidelines</CardTitle>
          <CardDescription>Requirements for marketplace publication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Content Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Minimum 100 pages</li>
                <li>• At least 5 chapters</li>
                <li>• Professional cover image</li>
                <li>• Complete metadata</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Quality Standards</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• AI-reviewed content quality</li>
                <li>• Proper chapter organization</li>
                <li>• Engaging story structure</li>
                <li>• Original content only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplacePage;