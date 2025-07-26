import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Pause, Play, Square, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RecordingPageProps {
  onRecordingStateChange: (isRecording: boolean) => void;
}

const RecordingPage = ({ onRecordingStateChange }: RecordingPageProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [hasRecording, setHasRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Setup audio visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStateChange(true);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setHasRecording(true);
      onRecordingStateChange(false);
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording && !isPaused) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveRecording = () => {
    if (hasRecording && recordingTitle.trim()) {
      // Frontend only: Upload to cloud storage
      // Backend will handle: transcription, AI processing, chapter generation
      console.log('Uploading recording to cloud:', recordingTitle);
      setRecordingTime(0);
      setHasRecording(false);
      setRecordingTitle('');
      setAudioLevel(0);
    }
  };

  const WaveVisualization = ({ audioLevel, isRecording }: { audioLevel: number; isRecording: boolean }) => {
    const bars = Array.from({ length: 24 }, (_, i) => {
      const height = isRecording 
        ? Math.max(0.2, audioLevel * Math.random() * 2.5) 
        : 0.2;
      
      return (
        <div
          key={i}
          className="bg-gradient-to-t from-primary to-primary-glow rounded-full transition-all duration-200 organic-wave relative"
          style={{
            height: `${height * 100}%`,
            animationDelay: `${i * 0.08}s`,
            minHeight: '12px',
            width: '4px',
            boxShadow: isRecording ? '0 0 8px rgba(139, 69, 19, 0.4)' : 'none',
          }}
        >
          {/* Ink-like texture */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent rounded-full"></div>
        </div>
      );
    });

    return (
      <div className="flex items-center justify-center space-x-2 h-24 p-4 rounded-xl bg-gradient-to-r from-background/50 to-card/50 border border-primary/10">
        {bars}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 font-sans">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-cursive font-bold text-primary mb-6 drop-shadow-sm">Share Your Story</h2>
        <p className="text-muted-foreground text-xl font-serif leading-relaxed max-w-2xl mx-auto">
          Speak as if sharing with a beloved grandchild. Let your heart guide your words.
        </p>
      </div>

      {/* Recording Interface */}
      <div className="vintage-card rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="text-6xl font-serif text-primary font-bold">
              {formatTime(recordingTime)}
            </div>
          </div>
          <p className="text-lg font-serif text-muted-foreground italic">
            {isRecording ? 'Your story is being captured...' : isPaused ? 'Take a breath, then continue' : 'Press the seal to begin your tale'}
          </p>
        </div>

        {/* Audio Visualization */}
        <div className="mb-10">
          <WaveVisualization audioLevel={audioLevel} isRecording={isRecording} />
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-organic",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
              isRecording && "vintage-pulse"
            )}
          >
            <Mic className="w-6 h-6" />
          </button>

          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            disabled={!isRecording && !isPaused}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-organic",
              "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-2 border-secondary/30 shadow-vintage"
            )}
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </button>

          <button
            onClick={stopRecording}
            disabled={!isRecording && !isPaused}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-organic",
              "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-2 border-destructive/30 shadow-vintage"
            )}
          >
            <Square className="w-6 h-6" />
          </button>
        </div>

        {/* Save Recording */}
        {hasRecording && (
          <div className="space-y-6 pt-6 border-t border-border/50">
            <input
              type="text"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder="Name this memory..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-organic"
            />
            <button
              onClick={saveRecording}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition-organic font-medium"
            >
              Save Recording
            </button>
          </div>
        )}
      </div>

      {/* Recording Tips */}
      <div className="vintage-card rounded-xl p-6 max-w-2xl mx-auto mt-8">
        
        <h3 className="text-lg font-semibold text-primary mb-4">Recording Tips</h3>
        <div className="grid md:grid-cols-2 gap-6 font-serif text-foreground/90 leading-relaxed">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-accent text-xl">✦</span>
              <span>Speak as if sharing with a beloved grandchild</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-accent text-xl">✦</span>
              <span>Let your emotions flow naturally - they're part of the story</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-accent text-xl">✦</span>
              <span>Silence and pauses add depth to your narrative</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-accent text-xl">✦</span>
              <span>Share the small details that paint the full picture</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage;