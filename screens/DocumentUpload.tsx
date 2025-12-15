import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, CheckCircle, Search, Database, Shield } from 'lucide-react';

export const DocumentUpload: React.FC = () => {
  const { state, dispatch } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        dispatch({ type: 'SET_DOC_STATUS', status: 'aligning' });
        
        setTimeout(() => {
          dispatch({ type: 'SET_DOC_STATUS', status: 'captured' });
        }, 3500);
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    };
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [dispatch]);

  const stepIcon = (step: string) => {
    switch(step) {
      case 'ocr': return <Search size={20} className="text-emerald-500" />;
      case 'aml': return <Database size={20} className="text-blue-500" />;
      case 'credit': return <Shield size={20} className="text-purple-500" />;
      default: return <div className="w-5 h-5 bg-gray-200 rounded-full"></div>;
    }
  }

  return (
    <div className="h-[calc(100vh-80px)] relative bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${state.documentStatus === 'captured' ? 'opacity-30 blur-md' : 'opacity-100'}`}
      />

      {/* AR Overlay - Frame */}
      {state.documentStatus === 'aligning' && (
        <div className="relative z-10 w-72 h-48 border-2 border-white/50 rounded-xl overflow-hidden animate-pulse">
           <div className="absolute inset-0 border-[3px] border-white rounded-xl"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 text-center w-full">
             <p className="font-semibold text-shadow">Align ID Card</p>
           </div>
        </div>
      )}

      {/* Transparent Verification (Use Case 4) */}
      {state.documentStatus === 'captured' && (
        <div className="relative z-20 w-full max-w-xs space-y-4">
           
           <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl mb-4">
                <CheckCircle size={32} className="text-white" />
             </div>
             <h3 className="text-white text-xl font-bold">Processing</h3>
           </div>

           <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 space-y-4 shadow-2xl">
              {/* Step 1: OCR */}
              <div className={`flex items-center gap-4 transition-opacity ${state.verificationStep === 'ocr' || state.verificationStep === 'aml' || state.verificationStep === 'credit' || state.verificationStep === 'complete' ? 'opacity-100' : 'opacity-30'}`}>
                 {stepIcon('ocr')}
                 <div className="flex-1">
                   <p className="font-bold text-gray-800 text-sm">OCR Reading</p>
                   <p className="text-xs text-gray-500">Extracting name & ID...</p>
                 </div>
                 {state.verificationStep === 'ocr' && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>

              {/* Step 2: AML */}
              <div className={`flex items-center gap-4 transition-opacity ${state.verificationStep === 'aml' || state.verificationStep === 'credit' || state.verificationStep === 'complete' ? 'opacity-100' : 'opacity-30'}`}>
                 {stepIcon('aml')}
                 <div className="flex-1">
                   <p className="font-bold text-gray-800 text-sm">Security Check</p>
                   <p className="text-xs text-gray-500">AML Database Scan...</p>
                 </div>
                 {state.verificationStep === 'aml' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>

               {/* Step 3: Credit */}
               <div className={`flex items-center gap-4 transition-opacity ${state.verificationStep === 'credit' || state.verificationStep === 'complete' ? 'opacity-100' : 'opacity-30'}`}>
                 {stepIcon('credit')}
                 <div className="flex-1">
                   <p className="font-bold text-gray-800 text-sm">Credit Analysis</p>
                   <p className="text-xs text-gray-500">Calculating Tier...</p>
                 </div>
                 {state.verificationStep === 'credit' && <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>
           </div>
           
           {state.verificationStep === 'complete' && (
             <div className="bg-[#006847] text-white p-4 rounded-xl text-center animate-in zoom-in">
                <p className="font-bold">Verification Complete</p>
                <p className="text-sm">Tier 1 Rate Approved</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};