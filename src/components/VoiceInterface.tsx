import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice interface received:', event.type);
    
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setTranscript(event.transcript);
    } else if (event.type === 'response.audio_transcript.delta') {
      // Handle AI response transcript
      console.log('AI response:', event.delta);
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    setIsLoading(false);
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      chatRef.current = new RealtimeChat(handleMessage, handleConnectionChange);
      await chatRef.current.connect();
      
      toast({
        title: "Voice Chat Started",
        description: "AI assistant is listening",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsLoading(false);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start voice chat',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setTranscript('');
    onSpeakingChange?.(false);
    
    toast({
      title: "Voice Chat Ended",
      description: "Conversation disconnected",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-background/95 backdrop-blur-sm rounded-lg border">
      <div className="flex items-center gap-4">
        {!isConnected ? (
          <Button 
            onClick={startConversation}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Start AI Voice Chat
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={endConversation}
            variant="destructive"
            size="lg"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Call
          </Button>
        )}
        
        {isConnected && (
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <div className="flex items-center text-green-600">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2" />
                AI Speaking
              </div>
            ) : (
              <div className="flex items-center text-blue-600">
                <Mic className="w-4 h-4 mr-2 animate-pulse" />
                Listening
              </div>
            )}
          </div>
        )}
      </div>
      
      {transcript && (
        <div className="max-w-md text-center">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="text-sm bg-muted p-2 rounded">{transcript}</p>
        </div>
      )}
      
      {isConnected && (
        <div className="text-xs text-muted-foreground text-center">
          Speak naturally - the AI will respond when you pause
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;