import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers,
  Eye,
  ShieldAlert,
  ArrowRight,
  Flame,
  Info,
  FlipHorizontal,
  Smartphone,
  X,
} from 'lucide-react';
import { WasteScanResult, WasteCategory } from '../types';
import { SAMPLE_SCAN_IMAGES } from '../data/initialData';

interface AIScannerViewProps {
  onReportIncidentFromScan: (scan: WasteScanResult) => void;
}

export const AIScannerView: React.FC<AIScannerViewProps> = ({ onReportIncidentFromScan }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_SCAN_IMAGES[0].url);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<WasteScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<'original' | 'attention' | 'details'>('original');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [manualCategory, setManualCategory] = useState<WasteCategory | ''>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scan initial sample on first mount
  useEffect(() => {
    runWasteScan(SAMPLE_SCAN_IMAGES[0].url, 'sample_plastic');
  }, []);

  const runWasteScan = async (imageUrl: string, sampleType?: string) => {
    setIsScanning(true);
    setQualityWarning(null);
    setManualCategory('');

    try {
      const response = await fetch('/api/gemini/waste-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUrl,
          sampleType,
        }),
      });

      if (!response.ok) {
        throw new Error('Scanner service failed');
      }

      const data: WasteScanResult = await response.json();
      setScanResult(data);

      if (data.confidence < 75) {
        setQualityWarning('⚠️ Low AI Confidence detected. Please manually review or retake with brighter lighting.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size / format
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      runWasteScan(base64);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraActive(true);
    try {
      if (videoRef.current?.srcObject) {
        const prevStream = videoRef.current.srcObject as MediaStream;
        prevStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      alert('Camera access unavailable. You can upload an image or choose one of our verified sample waste photos.');
      setCameraActive(false);
    }
  };

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);

      // Stop camera stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      setCameraActive(false);

      runWasteScan(dataUrl);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
    setCameraActive(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white shadow-xl shadow-emerald-700/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-white/20 text-xs font-bold uppercase tracking-wider">
              Gemini 3.8 Flash Vision Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1">AI Smart Waste Scanner</h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
            Real-time object detection, risk classification, explainable attention maps, and instant bin routing.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={cameraActive ? stopCamera : () => startCamera()}
            className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1.5 border border-white/20"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cameraActive ? 'Close Camera' : 'Live Camera'}</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image / Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden">
            {/* View Mode Tabs (Explainable AI) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Inspection Viewport</span>
              </span>
              <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'original'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Original Image
                </button>
                <button
                  onClick={() => setActiveTab('attention')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'attention'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  AI Attention Map
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'details'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Predictions Breakdown
                </button>
              </div>
            </div>

            {/* Viewport Frame */}
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center my-3 border border-slate-800">
              {cameraActive ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Top Camera Controls Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
                    <button
                      onClick={flipCamera}
                      className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs backdrop-blur-md border border-white/20 flex items-center space-x-1.5"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip ({facingMode === 'environment' ? 'Rear 📷' : 'Front 🤳'})</span>
                    </button>

                    <button
                      onClick={stopCamera}
                      className="p-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={captureCameraFrame}
                    className="absolute bottom-4 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-xl active:scale-95 flex items-center space-x-2 animate-bounce"
                  >
                    <Camera className="w-4 h-4 text-slate-950" />
                    <span>Capture & Run AI Classification</span>
                  </button>
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Scanned Waste"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Animation Sweep */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent animate-pulse flex items-center justify-center">
                      <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] absolute top-1/2 animate-bounce" />
                      <div className="px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-mono font-bold flex items-center space-x-2 backdrop-blur-md">
                        <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span>AI Neural Model Inferencing...</span>
                      </div>
                    </div>
                  )}

                  {/* Attention Map Overlay (Explainable AI Grad-CAM style heatmap) */}
                  {!isScanning && activeTab === 'attention' && scanResult && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-purple-950/20 backdrop-contrast-125" />
                      {scanResult.explainability.heatmapHighlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="absolute rounded-full pointer-events-none animate-pulse"
                          style={{
                            left: `${hl.x}%`,
                            top: `${hl.y}%`,
                            width: `${hl.radius * 2}px`,
                            height: `${hl.radius * 2}px`,
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(168, 85, 247, 0.4) 40%, transparent 80%)`,
                          }}
                        />
                      ))}
                      <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-[11px] text-white border border-purple-500/30">
                        <p className="font-semibold text-purple-300">
                          Explainable AI (Grad-CAM Hotspot Analysis):
                        </p>
                        <p className="text-slate-300 mt-0.5">
                          {scanResult.explainability.attentionRegion}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Object Detection Bounding Boxes Overlay */}
                  {!isScanning && activeTab === 'original' && scanResult && (
                    <div className="absolute inset-0 pointer-events-none">
                      {scanResult.detectedObjects.map((obj, i) => (
                        <div
                          key={i}
                          className="absolute border-2 border-emerald-400 rounded-md shadow-xs"
                          style={{
                            top: `${obj.box?.ymin || 20}%`,
                            left: `${obj.box?.xmin || 25}%`,
                            width: `${(obj.box?.xmax || 70) - (obj.box?.xmin || 25)}%`,
                            height: `${(obj.box?.ymax || 75) - (obj.box?.ymin || 20)}%`,
                          }}
                        >
                          <span className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-mono font-bold shadow-md">
                            {obj.label} ({obj.confidence}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Camera className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">No image loaded. Upload a photo or select a campus sample below.</p>
                </div>
              )}
            </div>

            {/* Quick Sample Selector */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Quick Test Samples (Real Campus Waste Artifacts)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_SCAN_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedImage(sample.url);
                      runWasteScan(sample.url, sample.id);
                    }}
                    className={`flex items-center space-x-2 p-1.5 rounded-xl border text-left transition-all ${
                      selectedImage === sample.url
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sample.title}
                      </p>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block truncate">
                        {sample.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Detection Results & Smart Segregation */}
        <div className="lg:col-span-5 space-y-4">
          {scanResult ? (
            <div className="space-y-4">
              {/* Primary Detection Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      IDENTIFIED OBJECT
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                      {scanResult.primaryObject}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Category: {scanResult.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {scanResult.confidence}%
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                      Confidence
                    </span>
                  </div>
                </div>

                {/* Confidence Progress Bar */}
                <div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        scanResult.confidence > 90
                          ? 'bg-emerald-500'
                          : scanResult.confidence > 75
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${scanResult.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Risk & Recyclability Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Risk Level</span>
                    <span
                      className={`font-bold flex items-center space-x-1 mt-0.5 ${
                        scanResult.risk === 'Low'
                          ? 'text-emerald-600'
                          : scanResult.risk === 'Moderate'
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{scanResult.risk} Campus Risk</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recyclable</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{scanResult.recyclable ? 'Yes (Recyclable)' : 'Non-Recyclable'}</span>
                    </span>
                  </div>
                </div>

                {/* Top-3 Predictions Section */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Top-3 Neural Predictions
                  </span>
                  <div className="space-y-1.5">
                    {scanResult.topPredictions.map((pred, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-slate-400">#{i + 1}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {pred.label}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                          {pred.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Warning if applicable */}
                {qualityWarning && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 rounded-xl flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p>{qualityWarning}</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-xs font-bold underline text-amber-700 dark:text-amber-300"
                      >
                        Retake Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Segregation & Bin Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Smart Campus Disposal Guidance
                </span>

                <div
                  className="p-3.5 rounded-2xl border text-xs space-y-1.5"
                  style={{
                    borderColor: `${scanResult.recommendedBin.color}60`,
                    backgroundColor: `${scanResult.recommendedBin.color}15`,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: scanResult.recommendedBin.color }}
                    />
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {scanResult.recommendedBin.label}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    {scanResult.recommendedBin.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-1">
                    Actionable Handling Advice:
                  </span>
                  <p>{scanResult.disposalGuidance}</p>
                </div>

                {/* 1-Click Action: Turn this scan into a Campus Issue Report */}
                <button
                  onClick={() => onReportIncidentFromScan(scanResult)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Report as Campus Cleanliness Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-pulse" />
              <p className="text-xs">Scan or upload an item to view AI classification and segregation advice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
