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

  const WaveVisualization = () => {
    const bars = Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-1 bg-primary rounded-full transition-all duration-100",
          isRecording && !isPaused ? "wave-animation" : ""
        )}
        style={{
          height: isRecording && !isPaused 
            ? `${Math.max(4, audioLevel * 40 + Math.random() * 10)}px`
            : '4px',
          animationDelay: `${i * 50}ms`
        }}
      />
    ));

    return (
      <div className="flex items-center justify-center space-x-1 h-12">
        {bars}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Main Recording Control */}
      <Card className="glass-card p-8 text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Audio Recording</h2>
          
          {/* Timer */}
          <div className="text-4xl font-mono font-bold text-primary">
            {formatTime(recordingTime)}
          </div>
          
          {/* Wave Visualization */}
          <WaveVisualization />
          
          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-spring glow-primary"
              >
                <Mic className="w-6 h-6" />
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  size="lg"
                  variant="secondary"
                  className="w-12 h-12 rounded-full"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="w-12 h-12 rounded-full"
                >
                  <Square className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Status */}
          <div className="text-sm text-muted-foreground">
            {isRecording && !isPaused && "Recording in progress..."}
            {isRecording && isPaused && "Recording paused"}
            {!isRecording && !hasRecording && "Press to start recording"}
            {hasRecording && "Recording completed"}
          </div>
        </div>
      </Card>

      {/* Save Recording */}
      {hasRecording && (
        <Card className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Save Recording</h3>
          <div className="flex space-x-3">
            <Input
              placeholder="Recording title..."
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={saveRecording}
              disabled={!recordingTitle.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </Card>
      )}

      {/* Recording Tips */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recording Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Find a quiet place to minimize background noise</li>
          <li>• Speak clearly and at a natural pace</li>
          <li>• Keep the microphone at a consistent distance</li>
          <li>• Organize your thoughts by thematic chapters</li>
        </ul>
      </Card>
    </div>
  );
};

export default RecordingPage;