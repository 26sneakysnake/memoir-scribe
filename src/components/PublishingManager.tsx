import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Globe, Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiService, type Book, type PublishingWorkflow } from '@/services/apiService';
import { useApiAuth } from '@/hooks/useApiAuth';

interface PublishingManagerProps {
  book: Book;
}

export const PublishingManager: React.FC<PublishingManagerProps> = ({ book }) => {
  useApiAuth();
  const { toast } = useToast();
  
  const [publishing, setPublishing] = useState(false);
  const [workflow, setWorkflow] = useState<PublishingWorkflow | null>(null);
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const [metadata, setMetadata] = useState({
    title: book.title,
    description: book.description || '',
    tags: '',
    price: '0',
    category: 'memoir',
  });

  const handleStartPublishing = async () => {
    try {
      setPublishing(true);
      const publishingWorkflow = await apiService.startPublishing(book.id);
      setWorkflow(publishingWorkflow);
      
      toast({
        title: "Publishing started",
        description: "Your book is being prepared for publication.",
      });
    } catch (error) {
      console.error('Error starting publishing:', error);
      toast({
        title: "Publishing failed",
        description: "Failed to start publishing process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleUpdateMetadata = async () => {
    if (!workflow) return;

    try {
      await apiService.updatePublishingMetadata(workflow.workflow_id, metadata);
      
      toast({
        title: "Metadata updated",
        description: "Publication metadata has been updated successfully.",
      });
      
      setIsMetadataDialogOpen(false);
    } catch (error) {
      console.error('Error updating metadata:', error);
      toast({
        title: "Update failed",
        description: "Failed to update metadata. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePreview = async () => {
    if (!workflow) return;

    try {
      const { preview_url } = await apiService.generatePreview(workflow.workflow_id);
      
      // Open preview in new tab
      window.open(preview_url, '_blank');
      
      toast({
        title: "Preview generated",
        description: "Preview opened in new tab.",
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Preview failed",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    if (!workflow) return;

    try {
      await apiService.publishBook(workflow.workflow_id);
      
      // Update workflow status
      setWorkflow(prev => prev ? { ...prev, status: 'completed' } : null);
      
      toast({
        title: "Book published!",
        description: "Your book is now available in the marketplace.",
      });
    } catch (error) {
      console.error('Error publishing book:', error);
      toast({
        title: "Publishing failed",
        description: "Failed to publish book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing': return <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />;
      default: return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground">Publishing</h3>
          <p className="text-sm text-muted-foreground">
            Prepare and publish "{book.title}" to the marketplace
          </p>
        </div>
        
        {!workflow && (
          <Button 
            onClick={handleStartPublishing} 
            disabled={publishing}
            className="bg-primary hover:bg-primary/90"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Start Publishing
              </>
            )}
          </Button>
        )}
      </div>

      {workflow ? (
        <Card className="vintage-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif">Publishing Workflow</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(workflow.status)}
                <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                  {workflow.status}
                </Badge>
              </div>
            </div>
            <CardDescription>
              Workflow ID: {workflow.workflow_id}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsMetadataDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Update Metadata
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGeneratePreview}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Generate Preview
                </Button>
                
                <Button
                  onClick={handlePublish}
                  disabled={workflow.status !== 'pending'}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <Globe className="w-4 h-4" />
                  Publish to Marketplace
                </Button>
              </div>
              
              {workflow.status === 'completed' && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    🎉 Your book has been successfully published to the marketplace!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : book.status === 'draft' ? (
        <Card className="vintage-card text-center py-12">
          <CardContent>
            <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-serif mb-2">Ready to publish?</CardTitle>
            <CardDescription className="mb-4">
              Your book needs to be completed before publishing
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Add chapters and content, then start the publishing process
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="vintage-card text-center py-12">
          <CardContent>
            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="font-serif mb-2">Start Publishing</CardTitle>
            <CardDescription className="mb-4">
              Convert your book into a beautiful publication
            </CardDescription>
            <Button onClick={handleStartPublishing} disabled={publishing}>
              {publishing ? 'Starting...' : 'Begin Publishing Process'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metadata Dialog */}
      <Dialog open={isMetadataDialogOpen} onOpenChange={setIsMetadataDialogOpen}>
        <DialogContent className="vintage-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Publication Metadata</DialogTitle>
            <DialogDescription>
              Configure how your book appears in the marketplace
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                placeholder="Book title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Book description..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                value={metadata.tags}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                placeholder="memoir, family, history (comma-separated)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  value={metadata.category}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                  placeholder="memoir"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <Input
                  type="number"
                  value={metadata.price}
                  onChange={(e) => setMetadata({ ...metadata, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMetadataDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMetadata}>
              Update Metadata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};