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
      // In a real app, this would save to a backend
      console.log('Saving recording:', recordingTitle);
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
      <div className="vintage-card rounded-3xl p-10 max-w-3xl mx-auto relative overflow-hidden">
        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg"></div>
        
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="vintage-card rounded-full p-6 bg-gradient-to-br from-card to-background border-2 border-primary/20">
              <div className="text-7xl font-serif text-primary font-bold tracking-wider">
                {formatTime(recordingTime)}
              </div>
            </div>
            {/* Vintage clock decorations */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-accent rounded-full"></div>
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
        <div className="flex items-center justify-center space-x-8 mb-10">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center transition-organic",
              "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
              "hover:scale-105 hover:shadow-glow",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "border-4 border-accent/30 shadow-vintage",
              isRecording && "vintage-pulse"
            )}
          >
            <Mic className="w-8 h-8" />
            {/* Wax seal effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-accent/20 to-transparent"></div>
            {!isRecording && (
              <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-pulse"></div>
            )}
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
            <div className="relative">
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder="Name this precious memory..."
                className="w-full px-6 py-4 rounded-xl border-2 border-primary/20 bg-background/80 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-organic font-serif text-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-accent">
                ✒️
              </div>
            </div>
            <button
              onClick={saveRecording}
              className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground py-4 px-8 rounded-xl hover:scale-105 transition-organic font-serif text-lg font-semibold shadow-glow ink-drop"
            >
              Preserve This Memory
            </button>
          </div>
        )}
      </div>

      {/* Storyteller's Guide */}
      <div className="vintage-card rounded-2xl p-8 max-w-3xl mx-auto mt-12 relative">
        <div className="absolute top-6 left-6 text-4xl text-accent/30">❝</div>
        <div className="absolute bottom-6 right-6 text-4xl text-accent/30 rotate-180">❝</div>
        
        <h3 className="text-2xl font-cursive font-bold text-primary mb-8 text-center">Storyteller's Guide</h3>
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