import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Camera,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Building2,
  Layers,
  FileText,
  MapPin,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { CampusReport, Priority, UserProfile, WasteScanResult } from '../types';
import { CAMPUS_BUILDINGS, SAMPLE_SCAN_IMAGES } from '../data/initialData';

interface ReportIssueViewProps {
  currentUser: UserProfile;
  initialScanData?: WasteScanResult | null;
  onSubmitReport: (reportData: Partial<CampusReport>) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({
  currentUser,
  initialScanData,
  onSubmitReport,
  onNavigate,
}) => {
  const [problemType, setProblemType] = useState('Overflowing bin');
  const [building, setBuilding] = useState('Food Court & Student Plaza');
  const [floor, setFloor] = useState('Ground Floor');
  const [room, setRoom] = useState('Near North Patio Entrance');
  const [description, setDescription] = useState(
    initialScanData
      ? `Detected ${initialScanData.primaryObject} (${initialScanData.category}) overflowing outside designated bin area.`
      : 'Overflowing waste bin outside main food court entrance causing litter on the walkway.'
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialScanData?.imageUrl || SAMPLE_SCAN_IMAGES[1].url
  );
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);

  // AI suggestions state
  const [aiPriority, setAiPriority] = useState<Priority>('high');
  const [aiDepartment, setAiDepartment] = useState('Campus Housekeeping Services');
  const [aiTeam, setAiTeam] = useState('Cleaning Team Alpha');
  const [aiSlaMinutes, setAiSlaMinutes] = useState(45);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-analyze with AI whenever description or location changes
  useEffect(() => {
    analyzeWithAI();
  }, [building, problemType]);

  const analyzeWithAI = async () => {
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/gemini/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${problemType} in ${building}`,
          description,
          voiceTranscript,
          location: { building, floor, room },
          categoryInput: problemType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiPriority(data.suggestedPriority);
        setAiDepartment(data.suggestedDepartment);
        setAiTeam(data.suggestedTeam);
        setAiSlaMinutes(data.slaMinutes);
        if (data.isDuplicateAlert) {
          setDuplicateWarning(
            `⚠️ Note: ${data.duplicateCount} similar issue(s) recently logged in ${building}. Staff will automatically link or merge if related.`
          );
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (e) {
      console.warn('AI triage error:', e);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Voice recording simulation / Web Speech API integration
  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
    } else {
      setIsRecordingVoice(true);
      // Simulate real-time speech recognition
      const simulatedVoiceSamples = [
        'There is an overflowing dry waste bin near the food court entrance that requires immediate clearing.',
        'Chemical solvent bottles left unsegregated outside the laboratory eyewash station.',
        'Water puddle spreading across ground floor corridor due to washbasin pipe valve leak.',
      ];
      const randomText = simulatedVoiceSamples[Math.floor(Math.random() * simulatedVoiceSamples.length)];
      setTimeout(() => {
        setVoiceTranscript(randomText);
        setDescription((prev) => (prev ? `${prev} (Voice Note: ${randomText})` : randomText));
        setIsRecordingVoice(false);
        analyzeWithAI();
      }, 2500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedBuildingObj = CAMPUS_BUILDINGS.find((b) => b.name === building);
      await onSubmitReport({
        title: `${problemType} at ${building}`,
        type: 'Campus Cleanliness & Safety Issue',
        category: problemType,
        location: {
          building,
          floor,
          room,
          coords: selectedBuildingObj ? { x: selectedBuildingObj.x, y: selectedBuildingObj.y } : { x: 38, y: 62 },
        },
        description,
        photoUrl,
        voiceTranscript,
        priority: aiPriority,
        assignedDepartment: aiDepartment,
        assignedTeam: aiTeam,
        slaMinutes: aiSlaMinutes,
        reportedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email,
        },
        beforePhoto: photoUrl,
      });

      setSubmittedSuccess(`Incident dispatched! Auto-assigned to ${aiTeam} with ${aiSlaMinutes}m SLA.`);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
          Campus Report Dispatched Successfully!
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">{submittedSuccess}</p>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 font-mono">
          Priority: {aiPriority.toUpperCase()} • Department: {aiDepartment} • +10 Eco Points Awarded
        </div>
        <div className="flex justify-center space-x-3 pt-3">
          <button
            onClick={() => setSubmittedSuccess(null)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            Report Another Issue
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-md"
          >
            View on Live Dashboard
          </button>
        </div>
      </div>
    );
  }

  const problemCategories = [
    'Overflowing bin',
    'Waste dumping',
    'Mixed waste',
    'Unclean classroom',
    'Restroom hygiene',
    'Canteen waste',
    'Garden waste',
    'Water leakage',
    'Pest/hygiene issue',
    'Electrical problem',
    'Damaged furniture',
    'Road/parking issue',
    'Obstruction',
    'Safety issue',
    'Other',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 text-white shadow-xl shadow-teal-700/10">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
            Multimodal Incident Dispatch
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black mt-1">Report Campus Issue</h1>
        <p className="text-xs text-emerald-100 mt-0.5">
          Submit photo evidence, voice transcript, and exact location. WasteBot AI will triage priority and auto-dispatch to the responsible facility team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Problem Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Problem Category
            </label>
            <select
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {problemCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Campus Building</span>
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Floor / Level</span>
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. Ground Floor, 2nd Floor"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exact Room / Corridor / Landmark</span>
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room G-14, Outside North Washroom, Reading Hall Carrel #18"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Description & Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Detailed Problem Description
              </label>
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isRecordingVoice
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecordingVoice ? 'Listening...' : 'Voice Record'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, spill volume, safety concern, or obstacle..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              required
            />
            {voiceTranscript && (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 italic">
                🎙️ Voice Transcript Captured: "{voiceTranscript}"
              </p>
            )}
          </div>

          {/* Duplicate Alert Warning */}
          {duplicateWarning && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Photo Preview & Upload Controls */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Incident Evidence Photograph
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Choose Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-[10px] text-slate-400">
                  Visual evidence enables before/after verification and awards student Eco Points.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Auto-Triage & Dispatch Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  AI Auto-Triage & Dispatch Preview
                </span>
              </div>
              {isAnalyzingAI && (
                <div className="w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              )}
            </div>

            {/* Suggested Priority */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Calculated Priority Level
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => {
                  const isSelected = aiPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAiPriority(p)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        isSelected
                          ? p === 'critical'
                            ? 'bg-red-500 text-white border-red-500 shadow-sm'
                            : p === 'high'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : p === 'medium'
                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                            : 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned Department & Team */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Designated Department
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{aiDepartment}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Assigned Facility Team
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{aiTeam}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Response SLA</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{aiSlaMinutes} minutes</span>
                </span>
              </div>
            </div>

            {/* Reporter Profile Credit */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200 block">
                🌱 Student Eco Reward:
              </span>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                +10 Eco Points will be credited to {currentUser.name} upon facility team verification!
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching Incident...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit & Dispatch Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
