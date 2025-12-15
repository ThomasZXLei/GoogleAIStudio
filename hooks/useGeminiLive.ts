import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GET_SYSTEM_INSTRUCTION, TOOLS } from '../constants';
import { DebugSettings } from '../types';

// Audio util functions (unchanged)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export function useGeminiLive(
  handleToolCall: (name: string, args: any) => Promise<any>,
  debugSettings: DebugSettings,
  onMessageReceived: (role: 'user' | 'model', text: string, isFinal: boolean) => void,
  initialSummary?: string
) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Transcription accumulation
  const currentModelTurnRef = useRef<string>("");
  const currentUserTurnRef = useRef<string>("");

  const debugSettingsRef = useRef(debugSettings);
  const summaryRef = useRef(initialSummary);

  useEffect(() => {
    debugSettingsRef.current = debugSettings;
  }, [debugSettings]);

  useEffect(() => {
    summaryRef.current = initialSummary;
  }, [initialSummary]);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    sessionPromiseRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    setIsConnected(false);
    setIsSpeaking(false);
  }, [cleanup]);

  const connect = useCallback(async () => {
    // Ensure clean slate
    disconnect();

    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const inputNode = inputAudioContextRef.current.createGain(); 
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setIsConnected(true);
            setError(null);
            currentModelTurnRef.current = "";
            currentUserTurnRef.current = "";
            
            if (!inputAudioContextRef.current || !streamRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio Output Handling
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Text / Transcription Handling
            const outputTx = message.serverContent?.outputTranscription;
            if (outputTx?.text) {
               currentModelTurnRef.current += outputTx.text;
               onMessageReceived('model', currentModelTurnRef.current, false);
            }

            const inputTx = message.serverContent?.inputTranscription;
            if (inputTx?.text) {
               currentUserTurnRef.current += inputTx.text;
               onMessageReceived('user', currentUserTurnRef.current, false);
            }

            // Turn Complete Logic
            if (message.serverContent?.turnComplete) {
              if (currentModelTurnRef.current) {
                onMessageReceived('model', currentModelTurnRef.current, true);
                currentModelTurnRef.current = "";
              }
              if (currentUserTurnRef.current) {
                onMessageReceived('user', currentUserTurnRef.current, true);
                currentUserTurnRef.current = "";
              }
            }

            // Tools
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                console.log("Tool Call:", fc.name, fc.args);
                const result = await handleToolCall(fc.name, fc.args);
                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result: JSON.stringify(result) } 
                    }
                  });
                });
              }
            }
            
            if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setIsSpeaking(false);
               if(currentModelTurnRef.current) {
                 onMessageReceived('model', currentModelTurnRef.current, true);
                 currentModelTurnRef.current = "";
               }
            }
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error("Gemini Live Error", e);
            setError("Connection error");
            disconnect(); // Auto-cleanup on error
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: { parts: [{ text: GET_SYSTEM_INSTRUCTION(debugSettingsRef.current, summaryRef.current) }] },
          tools: [{ functionDeclarations: TOOLS }],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {}
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to connect to Haru");
      disconnect();
    }
  }, [handleToolCall, onMessageReceived, disconnect]);

  const sendText = useCallback(async (text: string) => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      // Send text as ClientContent
      if (typeof session.send === 'function') {
         session.send({
           clientContent: {
             turns: [
               {
                 role: 'user',
                 parts: [{ text }]
               }
             ],
             turnComplete: true
           }
         });
      } else {
        console.warn("LiveSession.send is not available. Cannot send text input in Live mode.");
      }
    }
  }, []);

  return { connect, disconnect, sendText, isConnected, isSpeaking, error };
}