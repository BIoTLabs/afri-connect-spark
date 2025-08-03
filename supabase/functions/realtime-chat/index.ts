import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  
  socket.onopen = () => {
    console.log("Client connected to relay");
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'start_session') {
        // Connect to OpenAI Realtime API
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        if (!OPENAI_API_KEY) {
          socket.send(JSON.stringify({ type: 'error', message: 'OpenAI API key not configured' }));
          return;
        }

        openAISocket = new WebSocket(
          "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
          {
            headers: {
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
              "OpenAI-Beta": "realtime=v1"
            }
          }
        );

        openAISocket.onopen = () => {
          console.log("Connected to OpenAI Realtime API");
          socket.send(JSON.stringify({ type: 'connected' }));
        };

        openAISocket.onmessage = (event) => {
          const openAIData = JSON.parse(event.data);
          console.log("OpenAI message:", openAIData.type);
          
          // Send session.update after receiving session.created
          if (openAIData.type === 'session.created') {
            const sessionUpdate = {
              type: 'session.update',
              session: {
                modalities: ["text", "audio"],
                instructions: "You are a helpful AI assistant in a chat application. Be conversational and friendly.",
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            openAISocket!.send(JSON.stringify(sessionUpdate));
          }
          
          // Forward all messages to client
          socket.send(event.data);
        };

        openAISocket.onerror = (error) => {
          console.error("OpenAI WebSocket error:", error);
          socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
        };

        openAISocket.onclose = () => {
          console.log("OpenAI connection closed");
          socket.send(JSON.stringify({ type: 'disconnected' }));
        };
      } else {
        // Forward message to OpenAI
        if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ type: 'error', message: 'Message processing error' }));
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});