import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Video,
  Camera,
  Compass,
  Battery,
  BatteryCharging,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Radio,
  Eye,
  Crosshair,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Navigation,
  Layers,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Sliders,
  Flame,
  Thermometer,
  Moon,
  Sun,
  Grid,
  RadioTower,
  Smartphone,
  FlipHorizontal,
  Lightbulb,
  X,
} from 'lucide-react';
import { CampusReport, Role, UserProfile, WasteScanResult } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface CCTVRobotMonitoringViewProps {
  currentUser: UserProfile;
  reports: CampusReport[];
  onSubmitReport: (report: Partial<CampusReport>) => Promise<void>;
  onNavigate: (tab: string) => void;
  language: Language;
}

interface RobotState {
  id: string;
  name: string;
  code: string;
  model: string;
  zone: string;
  status: 'patrolling' | 'charging' | 'spot_check' | 'manual';
  battery: number;
  speed: number;
  binCapacity: number;
  lat: number;
  lng: number;
  obstacleDistance: number;
  waypointIndex: number;
  totalWaypoints: number;
  activeDetections: {
    label: string;
    confidence: number;
    category: string;
    risk: 'Low' | 'Moderate' | 'High';
    x: number;
    y: number;
  }[];
  imageUrl: string;
}

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  building: string;
  resolution: string;
  fps: number;
  bitrate: string;
  status: 'active' | 'warning' | 'offline';
  imageUrl: string;
  isMobileCam?: boolean;
  detectedHazards: {
    type: string;
    label: string;
    confidence: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    box: { x: number; y: number; width: number; height: number };
  }[];
  nightVisionSupported: boolean;
}

export const CCTVRobotMonitoringView: React.FC<CCTVRobotMonitoringViewProps> = ({
  currentUser,
  reports,
  onSubmitReport,
  onNavigate,
  language,
}) => {
  const t = TRANSLATIONS[language];

  // Active View Mode
  const [activeTab, setActiveTab] = useState<'all' | 'robot' | 'cctv'>('all');

  // Robot State
  const [selectedRobotId, setSelectedRobotId] = useState<string>('bot-01');
  const [isPatrolRunning, setIsPatrolRunning] = useState<boolean>(true);
  const [visionMode, setVisionMode] = useState<'normal' | 'thermal' | 'night' | 'edge'>('normal');
  const [aiOverlayEnabled, setAiOverlayEnabled] = useState<boolean>(true);
  const [manualControlFeedback, setManualControlFeedback] = useState<string | null>(null);

  // CCTV State
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-mobile');
  const [ptzZoom, setPtzZoom] = useState<number>(1);
  const [sirenPlaying, setSirenPlaying] = useState<boolean>(false);
  const [dispatchedMessage, setDispatchedMessage] = useState<string | null>(null);

  // Live Mobile / Device Camera State
  const [isMobileCamActive, setIsMobileCamActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Autonomous Robots Data
  const [robots, setRobots] = useState<RobotState[]>([
    {
      id: 'bot-01',
      name: 'WasteBot Rover Alpha-01',
      code: 'WBR-ALPHA',
      model: 'Autonomous Lidar Rover V4',
      zone: 'Food Court & Quadrangle Walkway',
      status: 'patrolling',
      battery: 84,
      speed: 1.2,
      binCapacity: 62,
      lat: 13.0098,
      lng: 80.2355,
      obstacleDistance: 3.4,
      waypointIndex: 4,
      totalWaypoints: 8,
      activeDetections: [
        { label: 'PET Plastic Water Bottle', confidence: 96.4, category: 'Recyclable Plastic', risk: 'Low', x: 42, y: 58 },
        { label: 'Bin #CAN-04 High Fill Rate (88%)', confidence: 94.1, category: 'Overflow Warning', risk: 'Moderate', x: 68, y: 32 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'bot-02',
      name: 'WasteBot Rover Beta-02',
      code: 'WBR-BETA',
      model: 'Corridor Ultrasonic Patrol V3',
      zone: 'Tech Tower Main Corridor (CSE/IT)',
      status: 'patrolling',
      battery: 92,
      speed: 0.8,
      binCapacity: 35,
      lat: 13.0132,
      lng: 80.2365,
      obstacleDistance: 2.1,
      waypointIndex: 2,
      totalWaypoints: 6,
      activeDetections: [
        { label: 'Cardboard Box Fragment', confidence: 91.8, category: 'Paper & Cardboard', risk: 'Low', x: 30, y: 65 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'bot-03',
      name: 'WasteBot EcoDrone Air-03',
      code: 'WBD-AIR',
      model: 'Solar Quadcopter Surveillance',
      zone: 'Science Block & Perimeter Lawns',
      status: 'spot_check',
      battery: 71,
      speed: 3.5,
      binCapacity: 0,
      lat: 13.0085,
      lng: 80.2372,
      obstacleDistance: 12.0,
      waypointIndex: 5,
      totalWaypoints: 10,
      activeDetections: [
        { label: 'Chemical Container Spill Perimeter', confidence: 98.2, category: 'Hazardous Waste', risk: 'High', x: 50, y: 48 },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    },
  ]);

  // CCTV Cameras List (including Live Mobile Camera)
  const [cameras, setCameras] = useState<CCTVCamera[]>([
    {
      id: 'cam-mobile',
      name: 'CAM-LIVE [📱 Active Mobile / Device Cam]',
      location: 'Live Phone Camera / Field Bodycam Stream',
      building: 'Connected Mobile Device / Tablet',
      resolution: '1080p Full HD (Live Stream)',
      fps: 60,
      bitrate: 'Real-time WebRTC Stream',
      status: 'active',
      isMobileCam: true,
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
      detectedHazards: [
        { type: 'mobile_ai', label: 'AI Real-time Scan: Object Detected', confidence: 95.6, severity: 'high', box: { x: 35, y: 35, width: 30, height: 35 } },
      ],
      nightVisionSupported: true,
    },
    {
      id: 'cam-01',
      name: 'CAM-01 [4K Live] Food Court Plaza',
      location: 'Outdoor Terrace & Recycling Station #4',
      building: 'Food Court & Student Plaza',
      resolution: '3840x2160 (4K UHD)',
      fps: 60,
      bitrate: '14.2 Mbps',
      status: 'warning',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      detectedHazards: [
        { type: 'overflow', label: 'Overflowing Recyclable Bin (96.8%)', confidence: 96.8, severity: 'high', box: { x: 35, y: 40, width: 28, height: 35 } },
        { type: 'litter', label: 'Single-Use Plastic Cup on Pavement', confidence: 93.2, severity: 'medium', box: { x: 68, y: 72, width: 14, height: 16 } },
      ],
      nightVisionSupported: true,
    },
    {
      id: 'cam-02',
      name: 'CAM-02 [4K Live] Tech Tower Lobby',
      location: 'Ground Floor Atrium & Elevator Bank',
      building: 'Tech Tower (CSE / IT)',
      resolution: '3840x2160 (4K UHD)',
      fps: 60,
      bitrate: '12.8 Mbps',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
      detectedHazards: [
        { type: 'clean', label: 'Corridor Zone Clean & Normal (99.1%)', confidence: 99.1, severity: 'low', box: { x: 20, y: 30, width: 60, height: 50 } },
      ],
      nightVisionSupported: true,
    },
    {
      id: 'cam-03',
      name: 'CAM-03 [4K Live] Science Block Chemical Corridor',
      location: '2nd Floor Outside Chemistry Lab 204',
      building: 'Science & Biotech Laboratories',
      resolution: '3840x2160 (4K UHD)',
      fps: 60,
      bitrate: '15.0 Mbps',
      status: 'warning',
      imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
      detectedHazards: [
        { type: 'chemical', label: 'Unsegregated Solvent Bottle (97.4%)', confidence: 97.4, severity: 'critical', box: { x: 45, y: 50, width: 25, height: 30 } },
      ],
      nightVisionSupported: true,
    },
    {
      id: 'cam-04',
      name: 'CAM-04 [4K Live] Central Library Quadrangle',
      location: 'Silent Study Wing & Courtyard',
      building: 'Central Library & Media Center',
      resolution: '3840x2160 (4K UHD)',
      fps: 60,
      bitrate: '11.5 Mbps',
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      detectedHazards: [
        { type: 'item', label: 'Unattended Personal Item on Bench (91.5%)', confidence: 91.5, severity: 'medium', box: { x: 52, y: 55, width: 18, height: 20 } },
      ],
      nightVisionSupported: true,
    },
  ]);

  const currentRobot = robots.find((r) => r.id === selectedRobotId) || robots[0];
  const currentCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  // Mobile Camera Stream Management
  const startMobileCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      // Stop previous tracks if running
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (mobileVideoRef.current) {
        mobileVideoRef.current.srcObject = stream;
        mobileVideoRef.current.play();
      }
      setIsMobileCamActive(true);
      setSelectedCameraId('cam-mobile');
    } catch (err: any) {
      console.warn('Mobile camera failed or denied:', err);
      setCameraError('Camera permission was denied or device camera is unavailable. Ensure HTTPS or localhost permissions.');
      setIsMobileCamActive(false);
    }
  };

  const stopMobileCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.srcObject = null;
    }
    setIsMobileCamActive(false);
  };

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startMobileCamera(nextMode);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Simulated continuous robot movement & telemetry updates
  useEffect(() => {
    if (!isPatrolRunning) return;

    const interval = setInterval(() => {
      setRobots((prev) =>
        prev.map((bot) => {
          if (bot.status !== 'patrolling') return bot;
          const nextWaypoint = (bot.waypointIndex % bot.totalWaypoints) + 1;
          const nextDist = +(Math.random() * 2.5 + 1.5).toFixed(1);
          const nextSpeed = +(Math.random() * 0.4 + 0.9).toFixed(1);

          return {
            ...bot,
            waypointIndex: nextWaypoint,
            obstacleDistance: nextDist,
            speed: nextSpeed,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isPatrolRunning]);

  // Handle Dispatch Incident from Robot detection
  const handleDispatchRobotIncident = async () => {
    try {
      const topDetection = currentRobot.activeDetections[0];
      const newReport: Partial<CampusReport> = {
        title: `[AUTONOMOUS ROBOT PATROL] ${topDetection ? topDetection.label : 'Waste Anomaly'} in ${currentRobot.zone}`,
        type: topDetection?.category || 'Waste Issue',
        category: topDetection?.risk === 'High' ? 'Hazardous waste' : 'Overflowing bin',
        location: {
          building: currentRobot.zone.split(' ')[0],
          floor: 'Ground Zone',
          room: `Waypoint ${currentRobot.waypointIndex}/${currentRobot.totalWaypoints}`,
          areaDescription: `Detected automatically by ${currentRobot.name} during continuous patrol route`,
          geoCoords: { lat: currentRobot.lat, lng: currentRobot.lng },
        },
        description: `Automated detection generated by on-board AI computer vision on ${currentRobot.code}. Confidence: ${topDetection?.confidence || 96}% in ${currentRobot.zone}.`,
        photoUrl: currentRobot.imageUrl,
        priority: topDetection?.risk === 'High' ? 'critical' : 'high',
        status: 'assigned',
        assignedDepartment: 'Campus Housekeeping Services',
        assignedTeam: 'Rapid Rover Response Unit',
        reportedBy: {
          id: currentRobot.id,
          name: `${currentRobot.name} (AI Rover)`,
          role: 'cleaning',
          email: 'wastebot.patrol@campus.facility.edu',
        },
        reportedAt: new Date().toISOString(),
        slaMinutes: 30,
        timeline: [
          {
            timestamp: new Date().toLocaleTimeString(),
            action: `Auto-Dispatched by ${currentRobot.name}`,
            actor: 'WasteBot Patrol Engine',
          },
        ],
      };

      await onSubmitReport(newReport);
      setDispatchedMessage(`✓ Incident ticket successfully created from ${currentRobot.name} and routed to Housekeeping Unit!`);
      setTimeout(() => setDispatchedMessage(null), 5000);
    } catch (e) {
      console.error('Failed to dispatch from robot', e);
    }
  };

  // Handle Dispatch from CCTV or Live Mobile Camera
  const handleDispatchCCTVIncident = async () => {
    try {
      let photoToUse = currentCamera.imageUrl;

      // Capture frame from mobile video if currently active
      if (currentCamera.isMobileCam && isMobileCamActive && mobileVideoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = mobileVideoRef.current.videoWidth || 640;
        canvas.height = mobileVideoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(mobileVideoRef.current, 0, 0, canvas.width, canvas.height);
          photoToUse = canvas.toDataURL('image/jpeg', 0.85);
        }
      }

      const hazard = currentCamera.detectedHazards[0];
      const newReport: Partial<CampusReport> = {
        title: `[${currentCamera.isMobileCam ? 'MOBILE PATROL CAM' : 'CCTV AI SURVEILLANCE'}] ${hazard ? hazard.label : 'Cleanliness Anomaly'} in ${currentCamera.building}`,
        type: hazard?.type === 'chemical' ? 'Hazardous Waste' : 'Waste Issue',
        category: hazard?.type === 'overflow' ? 'Overflowing bin' : 'Mixed waste',
        location: {
          building: currentCamera.building,
          floor: 'Live Patrol Zone',
          room: currentCamera.location,
          areaDescription: `Live camera coordinate from ${currentCamera.name}`,
        },
        description: `Live video stream alert from ${currentCamera.name} (${currentCamera.resolution}). AI detected anomaly: ${hazard?.label}.`,
        photoUrl: photoToUse,
        priority: hazard?.severity || 'high',
        status: 'assigned',
        assignedDepartment: hazard?.type === 'chemical' ? 'Campus Safety & Vigilance' : 'Campus Housekeeping Services',
        assignedTeam: 'CCTV Rapid Response Unit',
        reportedBy: {
          id: currentUser.id || currentCamera.id,
          name: currentUser.name || currentCamera.name,
          role: currentUser.role || 'security',
          email: currentUser.email || 'cctv.surveillance@campus.edu',
        },
        reportedAt: new Date().toISOString(),
        slaMinutes: 30,
        timeline: [
          {
            timestamp: new Date().toLocaleTimeString(),
            action: `Auto-Triaged from ${currentCamera.name}`,
            actor: 'Live Patrol Stream Gateway',
          },
        ],
      };

      await onSubmitReport(newReport);
      setDispatchedMessage(`✓ Campus ticket dispatched from ${currentCamera.name} to Response Dispatch!`);
      setTimeout(() => setDispatchedMessage(null), 5000);
    } catch (e) {
      console.error('Failed to dispatch from CCTV', e);
    }
  };

  // Manual robot tele-operation command
  const handleManualCommand = (cmd: string) => {
    setManualControlFeedback(`Robot Command: [${cmd.toUpperCase()}] executed on ${currentRobot.code}`);
    setTimeout(() => setManualControlFeedback(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Ribbon */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
              <RadioTower className="w-3.5 h-3.5 animate-pulse" />
              <span>24/7 Live Continuous Campus Telemetry</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold">
              3 Autonomous Robots • Mobile Cam Stream • 5 CCTV Channels
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1 flex items-center space-x-2">
            <span>WasteBot Robot Patrol & CCTV Grid</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Autonomous mobile robot rover fleet monitoring waste levels continuously alongside your connected mobile camera and CCTV surveillance feeds for instant detection & automated ticket dispatch.
          </p>
        </div>

        {/* Action Controls & Mobile Cam Launcher */}
        <div className="flex flex-wrap items-center gap-2">
          {!isMobileCamActive ? (
            <button
              onClick={() => startMobileCamera()}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Connect Mobile Camera</span>
            </button>
          ) : (
            <button
              onClick={stopMobileCamera}
              className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Disconnect Mobile Cam</span>
            </button>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-800/90 border border-slate-700/80">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Split Command</span>
            </button>
            <button
              onClick={() => setActiveTab('robot')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'robot'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Rovers (3)</span>
            </button>
            <button
              onClick={() => setActiveTab('cctv')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'cctv'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>CCTV Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Success Notification */}
      {dispatchedMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchedMessage}</span>
        </div>
      )}

      {/* Camera Error Message if any */}
      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* SECTION 1: AUTONOMOUS WASTEBOT ROBOT PATROL */}
      {(activeTab === 'all' || activeTab === 'robot') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>WasteBot Autonomous Patrol Fleet</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                    ACTIVE ROVER
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time robotic path telemetry, ultrasonic obstacle clearance, and automated litter sweep.
                </p>
              </div>
            </div>

            {/* Robot Selector Pills */}
            <div className="flex items-center space-x-2">
              {robots.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRobotId(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    selectedRobotId === r.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{r.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Robot Video Feed + HUD & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Live Camera Stream with Heads-Up Display (HUD) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-2xl flex items-center justify-center group">
                <img
                  src={currentRobot.imageUrl}
                  alt={currentRobot.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    visionMode === 'thermal'
                      ? 'hue-rotate-180 contrast-200 saturate-200'
                      : visionMode === 'night'
                      ? 'filter invert hue-rotate-90 brightness-125'
                      : visionMode === 'edge'
                      ? 'filter contrast-200 grayscale'
                      : ''
                  }`}
                />

                {/* HUD Overlay Layer */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  {/* Top HUD Bar */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-white bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>LIVE ONBOARD CAM</span>
                      </span>
                      <span>{currentRobot.code}</span>
                      <span className="text-slate-300">{currentRobot.zone}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-amber-400">SPEED: {currentRobot.speed} m/s</span>
                      <span className="text-blue-400">WAYPOINT {currentRobot.waypointIndex}/{currentRobot.totalWaypoints}</span>
                    </div>
                  </div>

                  {/* Center Crosshair / Lidar Bounding Boxes */}
                  <div className="relative flex-1 flex items-center justify-center">
                    <div className="w-16 h-16 border border-emerald-500/40 rounded-full flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>

                    {/* AI Bounding Boxes */}
                    {aiOverlayEnabled &&
                      currentRobot.activeDetections.map((det, idx) => (
                        <div
                          key={idx}
                          style={{ top: `${det.y}%`, left: `${det.x}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                        >
                          <div className="p-1.5 rounded-lg bg-red-600/80 text-white text-[10px] font-mono font-bold shadow-lg border border-white flex items-center space-x-1 animate-pulse">
                            <Crosshair className="w-3 h-3" />
                            <span>{det.label}</span>
                            <span className="bg-black/60 px-1 rounded">{det.confidence}%</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Bottom Telemetry HUD Bar */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-white bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Battery className="w-4 h-4 text-emerald-400" />
                        <span>{currentRobot.battery}% BATTERY</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Trash2 className="w-4 h-4 text-amber-400" />
                        <span>BIN LOAD: {currentRobot.binCapacity}%</span>
                      </span>
                      <span>RADAR CLEARANCE: {currentRobot.obstacleDistance}m</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold uppercase text-[9px]">
                        {currentRobot.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Feed Toolstrip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                {/* Vision Filter Buttons */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Vision Mode:</span>
                  {(['normal', 'thermal', 'night', 'edge'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setVisionMode(mode)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-medium text-[11px] transition-colors ${
                        visionMode === mode
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* AI Overlay & Stream Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAiOverlayEnabled(!aiOverlayEnabled)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      aiOverlayEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    AI Bounding Boxes: {aiOverlayEnabled ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => setIsPatrolRunning(!isPatrolRunning)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold text-white transition-colors flex items-center space-x-1 ${
                      isPatrolRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isPatrolRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPatrolRunning ? 'Pause Patrol' : 'Resume Patrol'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Robot Telemetry & Interactive Action Panel */}
            <div className="space-y-4">
              {/* Telemetry Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {currentRobot.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    {currentRobot.model}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Battery Level</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {currentRobot.battery}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Waste Bin Load</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                      {currentRobot.binCapacity}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Current Velocity</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {currentRobot.speed} m/s
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Lidar Range</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      {currentRobot.obstacleDistance} m
                    </span>
                  </div>
                </div>

                {/* Instant Ticket Dispatch Button */}
                <button
                  onClick={handleDispatchRobotIncident}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Auto-Dispatch Incident to Housekeeping</span>
                </button>
              </div>

              {/* Manual D-Pad Tele-Operation Panel */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Manual Tele-Op Override
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">D-Pad / Remote</span>
                </div>

                {manualControlFeedback && (
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg">
                    {manualControlFeedback}
                  </p>
                )}

                <div className="flex flex-col items-center space-y-1.5 pt-1">
                  <button
                    onClick={() => handleManualCommand('forward')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    <ArrowUp className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleManualCommand('steer left')}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 active:scale-95 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </button>
                    <button
                      onClick={() => handleManualCommand('emergency brake')}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white font-black text-[10px] shadow-sm active:scale-95"
                    >
                      STOP
                    </button>
                    <button
                      onClick={() => handleManualCommand('steer right')}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 active:scale-95 transition-all"
                    >
                      <ArrowRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleManualCommand('reverse')}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    <ArrowDown className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AI CCTV CAMERA SURVEILLANCE MATRIX & MOBILE CAM STREAM */}
      {(activeTab === 'all' || activeTab === 'cctv') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Campus CCTV & Mobile Camera Vision Matrix</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                    LIVE AI SURVEILLANCE
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous computer vision monitoring across stationary campus CCTV cams and live field mobile bodycams.
                </p>
              </div>
            </div>

            {/* Siren and Mobile connect */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (isMobileCamActive) stopMobileCamera();
                  else startMobileCamera();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isMobileCamActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isMobileCamActive ? '📱 Mobile Cam: Streaming' : '📱 Stream Mobile Cam'}</span>
              </button>

              <button
                onClick={() => setSirenPlaying(!sirenPlaying)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  sirenPlaying
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sirenPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{sirenPlaying ? 'Campus Warning: ON' : 'Audio Alert'}</span>
              </button>
            </div>
          </div>

          {/* CCTV Grid Switcher & Selected Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Primary Selected Camera Feed */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-2xl flex items-center justify-center group">
                {/* Check if mobile cam is active and selected */}
                {currentCamera.isMobileCam && isMobileCamActive ? (
                  <video
                    ref={mobileVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${ptzZoom})` }}
                  />
                ) : (
                  <img
                    src={currentCamera.imageUrl}
                    alt={currentCamera.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{ transform: `scale(${ptzZoom})` }}
                  />
                )}

                {/* Mobile Camera Not Started Overlay */}
                {currentCamera.isMobileCam && !isMobileCamActive && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <h3 className="font-extrabold text-white text-base">
                      Mobile / Device Camera Ready to Connect
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Tap below to grant camera access. Your device’s real-time camera feed will stream directly into the WasteBot AI Surveillance Grid.
                    </p>
                    <button
                      onClick={() => startMobileCamera()}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-xl active:scale-95 transition-all flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4 text-slate-950" />
                      <span>Start Live Device Camera</span>
                    </button>
                  </div>
                )}

                {/* CCTV HUD Top Bar */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-red-400">
                      {currentCamera.isMobileCam ? 'LIVE MOBILE CAM' : 'REC 4K'}
                    </span>
                    <span className="truncate max-w-[150px] sm:max-w-none">{currentCamera.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-300">
                    <span>{currentCamera.fps} FPS</span>
                    <span className="hidden sm:inline">{currentCamera.bitrate}</span>
                  </div>
                </div>

                {/* AI Hazard Bounding Box Overlay */}
                {currentCamera.detectedHazards.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      top: `${h.box.y}%`,
                      left: `${h.box.x}%`,
                      width: `${h.box.width}%`,
                      height: `${h.box.height}%`,
                    }}
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1.5 animate-pulse"
                  >
                    <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-1.5 py-0.5 rounded self-start shadow-md">
                      ⚠️ {h.label}
                    </span>
                    <span className="text-[9px] font-mono text-white bg-black/70 px-1 rounded self-end">
                      Confidence: {h.confidence}%
                    </span>
                  </div>
                ))}

                {/* CCTV HUD Bottom Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    LOCATION: {currentCamera.location}
                  </span>
                  <span className="text-emerald-400 font-bold">AI INFERENCE: 12ms</span>
                </div>
              </div>

              {/* PTZ Zoom Slider & Mobile Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Optical Zoom:</span>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={ptzZoom}
                    onChange={(e) => setPtzZoom(parseFloat(e.target.value))}
                    className="w-28 sm:w-32 accent-emerald-600"
                  />
                  <span className="font-mono font-bold text-emerald-600">{ptzZoom}x</span>
                </div>

                {/* Mobile Camera Flip Button */}
                {currentCamera.isMobileCam && isMobileCamActive && (
                  <button
                    onClick={flipCamera}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip ({facingMode === 'environment' ? 'Rear 📷' : 'Front 🤳'})</span>
                  </button>
                )}

                <button
                  onClick={handleDispatchCCTVIncident}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Auto-Dispatch from Stream</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Matrix of all CCTV Channels including Mobile Cam */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Surveillance Channels & Connected Feeds:
              </span>

              {cameras.map((cam) => {
                const isSelected = cam.id === selectedCameraId;
                return (
                  <div
                    key={cam.id}
                    onClick={() => {
                      setSelectedCameraId(cam.id);
                      if (cam.isMobileCam && !isMobileCamActive) {
                        startMobileCamera();
                      }
                    }}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-black flex items-center justify-center">
                      {cam.isMobileCam ? (
                        <div className="w-full h-full bg-emerald-950/80 flex items-center justify-center text-emerald-400">
                          <Smartphone className="w-5 h-5 animate-pulse" />
                        </div>
                      ) : (
                        <img src={cam.imageUrl} alt={cam.name} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>

                    <div className="flex-1 truncate text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {cam.name.split(' ')[0]} {cam.building.split(' ')[0]}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
                            cam.isMobileCam
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : cam.status === 'warning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cam.isMobileCam && isMobileCamActive ? 'STREAMING' : cam.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {cam.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
