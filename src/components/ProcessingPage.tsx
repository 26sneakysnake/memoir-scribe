import { useState } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const ProcessingPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  
  // Mock processing steps based on backend requirements
  const processingSteps = [
    { name: "Audio Transcription", description: "Converting audio to text using Hugging Face STT", status: "completed" },
    { name: "Semantic Chunking", description: "Breaking down transcripts into meaningful segments", status: "completed" },
    { name: "Storyline Analysis", description: "Identifying main storylines and creating graph connections", status: "processing" },
    { name: "Graph Database", description: "Loading storylines into Neo4j for organization", status: "pending" },
    { name: "Chapter Organization", description: "AI agents organizing content into chapters", status: "pending" },
    { name: "Content Generation", description: "Chapter writer agents creating final content", status: "pending" },
    { name: "Harmonization", description: "Chapter harmonizer ensuring consistency", status: "pending" }
  ];

  const mockTranscripts = [
    { id: 1, title: "Childhood Memories", duration: "5:32", status: "transcribed", chunks: 12 },
    { id: 2, title: "High School Years", duration: "8:45", status: "transcribed", chunks: 18 },
    { id: 3, title: "First Job Experience", duration: "6:21", status: "processing", chunks: 0 },
    { id: 4, title: "Marriage Story", duration: "4:12", status: "pending", chunks: 0 }
  ];

  const mockFollowUpQuestions = [
    { id: 1, chapter: "Childhood", question: "What year did you move to your new house?" },
    { id: 2, chapter: "Education", question: "Which university did you attend for your master's degree?" },
    { id: 3, chapter: "Career", question: "When exactly did you start your own business?" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing': return <Clock className="w-5 h-5 text-primary animate-spin" />;
      case 'pending': return <Clock className="w-5 h-5 text-muted-foreground" />;
      default: return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const startProcessing = () => {
    setIsProcessing(true);
    // In real app, this would trigger the AI backend processing
    console.log('Starting AI processing pipeline...');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-cursive font-bold text-primary mb-4">AI Processing</h2>
        <p className="text-muted-foreground text-lg font-serif">
          Transform your recordings into organized chapters using AI
        </p>
      </div>

      {/* Processing Pipeline Status */}
      <Card className="vintage-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif">Processing Pipeline</CardTitle>
              <CardDescription>AI agents working on your memoir</CardDescription>
            </div>
            <Button 
              onClick={startProcessing}
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isProcessing ? 'Processing...' : 'Start Processing'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={30} className="w-full" />
          <div className="space-y-3">
            {processingSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
                <Badge variant={step.status === 'completed' ? 'default' : step.status === 'processing' ? 'secondary' : 'outline'}>
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transcripts Status */}
      <Card className="vintage-card">
        <CardHeader>
          <CardTitle className="font-serif">Audio Transcriptions</CardTitle>
          <CardDescription>Status of your recorded audio files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTranscripts.map((transcript) => (
              <div key={transcript.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(transcript.status)}
                  <div>
                    <div className="font-medium">{transcript.title}</div>
                    <div className="text-sm text-muted-foreground">Duration: {transcript.duration}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{transcript.chunks} chunks</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Questions */}
      <Card className="vintage-card">
        <CardHeader>
          <CardTitle className="font-serif">Follow-up Questions</CardTitle>
          <CardDescription>Help AI agents fill in missing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFollowUpQuestions.map((question) => (
              <div key={question.id} className="p-4 rounded-lg border border-border/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{question.chapter}</Badge>
                  <AlertCircle className="w-4 h-4 text-accent" />
                </div>
                <p className="font-medium">{question.question}</p>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Your answer..."
                    className="flex-1 px-3 py-2 rounded border border-border bg-background"
                  />
                  <Button size="sm">Submit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization Placeholder */}
      <Card className="vintage-card">
        <CardHeader>
          <CardTitle className="font-serif">Storyline Graph</CardTitle>
          <CardDescription>Visual representation of your story connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <RotateCcw className="w-12 h-12 mx-auto mb-2" />
              <p>Graph visualization will appear here</p>
              <p className="text-sm">Powered by Neo4j database</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingPage;