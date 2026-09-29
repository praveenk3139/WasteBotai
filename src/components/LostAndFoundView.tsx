import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Key,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  LostItem,
  FoundItem,
  LostFoundMatch,
  ClaimRequest,
  UserProfile,
} from '../types';
import { CAMPUS_BUILDINGS } from '../data/initialData';
import {
  calculateDistanceMeters,
  formatDistance,
  estimateWalkingTime,
  DEFAULT_USER_LOCATION,
} from '../utils/geoDistance';

interface LostAndFoundViewProps {
  currentUser: UserProfile;
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: LostFoundMatch[];
  claims: ClaimRequest[];
  onReportLost: (item: Partial<LostItem>) => Promise<void>;
  onReportFound: (item: Partial<FoundItem>) => Promise<void>;
  onSubmitClaim: (claim: Partial<ClaimRequest>) => Promise<void>;
  onResolveClaim: (claimId: string, action: 'approve' | 'reject') => Promise<void>;
}

export const LostAndFoundView: React.FC<LostAndFoundViewProps> = ({
  currentUser,
  lostItems,
  foundItems,
  matches,
  claims,
  onReportLost,
  onReportFound,
  onSubmitClaim,
  onResolveClaim,
}) => {
  const [activeTab, setActiveTab] = useState<
    'lost' | 'found' | 'matches' | 'report_lost' | 'report_found' | 'claims'
  >('matches');

  // Form states for reporting Lost Item
  const [lostCategory, setLostCategory] = useState('Ring');
  const [lostTitle, setLostTitle] = useState('Signet Ring with Blue Inlay');
  const [lostLocation, setLostLocation] = useState('Central Library & Media Center');
  const [lostDate, setLostDate] = useState('2026-09-29');
  const [lostTime, setLostTime] = useState('11:30 AM');
  const [lostDesc, setLostDesc] = useState('Metallic signet ring left on study carrel desk.');
  const [lostPrivate, setLostPrivate] = useState('Microscopic engraving on inner rim: "A.S. 2024"');
  const [lostPhoto, setLostPhoto] = useState('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80');

  // Form states for reporting Found Item
  const [foundCategory, setFoundCategory] = useState('Ring');
  const [foundTitle, setFoundTitle] = useState('Metallic Gold-toned Ring found in Library');
  const [foundLocation, setFoundLocation] = useState('Central Library & Media Center');
  const [foundDate, setFoundDate] = useState('2026-09-29');
  const [foundTime, setFoundTime] = useState('11:50 AM');
  const [foundDesc, setFoundDesc] = useState('Circular metallic ring found left on quiet desk #18.');
  const [foundPhoto, setFoundPhoto] = useState('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80');

  // Claim modal state
  const [selectedMatch, setSelectedMatch] = useState<LostFoundMatch | null>(null);
  const [claimProof, setClaimProof] = useState('');
  const [claimSubmittedNotice, setClaimSubmittedNotice] = useState<string | null>(null);

  const isOfficerOrAdmin =
    currentUser.role === 'lost_found' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'security';

  const categories = [
    'Phone',
    'Wallet',
    'Cash',
    'Ring',
    'Chain',
    'Bracelet',
    'Watch',
    'Laptop',
    'Earbuds',
    'Bag',
    'ID Card',
    'Keys',
    'Card',
    'Other',
  ];

  const handleLostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onReportLost({
      title: lostTitle,
      category: lostCategory,
      building: lostLocation,
      locationLost: lostLocation,
      dateLost: lostDate,
      timeLost: lostTime,
      description: lostDesc,
      privateDetails: lostPrivate,
      photoUrl: lostPhoto,
      reportedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
    });
    setActiveTab('matches');
  };

  const handleFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onReportFound({
      title: foundTitle,
      category: foundCategory,
      building: foundLocation,
      locationFound: foundLocation,
      dateFound: foundDate,
      timeFound: foundTime,
      description: foundDesc,
      photoUrl: foundPhoto,
      reportedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
      aiValuableDetection: {
        isPossibleValuable: true,
        suggestedLabel: `Possible ${foundCategory}`,
        disclaimer: 'Note: AI image analysis cannot determine precious metal authenticity or monetary value. Strict physical verification of private markings required.',
      },
    });
    setActiveTab('matches');
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    await onSubmitClaim({
      lostItemId: selectedMatch.lostItemId,
      foundItemId: selectedMatch.foundItemId,
      claimantId: currentUser.id,
      claimantName: currentUser.name,
      claimantEmail: currentUser.email,
      privateProofDescription: claimProof,
    });
    setClaimSubmittedNotice('Claim submitted for authorized officer verification. Bring College ID to Lost & Found desk!');
    setSelectedMatch(null);
    setClaimProof('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white shadow-xl shadow-purple-700/10">
        <div className="flex items-center space-x-2">
          <span className="p-1 rounded-lg bg-white/20 text-[10px] font-mono font-bold uppercase tracking-wider">
            AI Similarity Vector Engine & Secure Vault
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black mt-1">Smart Campus Lost & Found</h1>
        <p className="text-xs text-purple-100 mt-0.5">
          Privacy-protected lost item reporting, authorized valuable intake, and AI similarity matching with required physical verification.
        </p>

        {/* Safety Disclaimer Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/30 text-[11px] text-purple-200 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Demo Safety Assurance:</strong> WasteBot AI strictly hides private serial numbers and engravings. AI indicates "Possible Category" only — physical verification by an authorized officer is mandatory before release.
          </span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'matches'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Potential Matches ({matches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'lost'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Lost Items Registry ({lostItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'found'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Secure Vault Inventory ({foundItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'claims'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Claims & Verification ({claims.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('report_lost')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'report_lost'
              ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Report Lost Item</span>
        </button>
        <button
          onClick={() => setActiveTab('report_found')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
            activeTab === 'report_found'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Secure Found-Item Intake</span>
        </button>
      </div>

      {claimSubmittedNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{claimSubmittedNotice}</span>
          </div>
          <button
            onClick={() => setClaimSubmittedNotice(null)}
            className="text-[11px] underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: AI POTENTIAL MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Neural Semantic & Spatial Matches
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
              Cross-correlating category, location, and timestamps
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No pending matches detected at this time.
            </div>
          ) : (
            matches.map((match) => {
              const lost = lostItems.find((l) => l.id === match.lostItemId);
              const found = foundItems.find((f) => f.id === match.foundItemId);
              if (!lost || !found) return null;

              return (
                <div
                  key={match.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 p-5 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Potential Match Detected (#{match.id})
                        </span>
                        <p className="text-[11px] text-slate-500">{match.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs">
                        {match.similarityScore}% Match Confidence
                      </span>
                    </div>
                  </div>

                  {/* Side-by-side comparison cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lost Item Card */}
                    <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-700 dark:text-red-400 uppercase text-[10px]">
                          Reported Lost Item ({lost.id})
                        </span>
                        <span className="text-[10px] text-slate-400">{lost.dateLost}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {lost.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{lost.locationLost}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{lost.timeLost}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">{lost.description}</p>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-[10px]">
                        <span className="font-bold text-slate-400 uppercase block mb-0.5">
                          Private Engraving / Lock Pattern:
                        </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {isOfficerOrAdmin ? lost.privateDetails : '🔒 [Hidden for Claim Verification]'}
                        </span>
                      </div>
                    </div>

                    {/* Found Item Card */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px]">
                          Secure Found Item ({found.id})
                        </span>
                        <span className="text-[10px] text-slate-400">{found.dateFound}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {found.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span>{found.locationFound}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{found.timeFound}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">{found.description}</p>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 text-[10px]">
                        <span className="font-bold text-slate-400 uppercase block mb-0.5">
                          Secure Storage Reference:
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {found.storageLockerRef || 'Under Custody Desk LF-B04'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Similarity Metrics & Claim Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span>Category: High (Exact)</span>
                      <span>Location: High ({lost.building})</span>
                      <span>Time Delta: &lt; 25 mins</span>
                    </div>

                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Initiate Ownership Claim Verification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: LOST ITEMS REGISTRY */}
      {activeTab === 'lost' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Student & Staff Lost Items Registry
            </span>
            <span className="text-[11px] text-slate-400">
              {lostItems.length} active loss reports
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lostItems.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                    <span>📍 {item.locationLost}</span>
                    {item.geoCoords && (
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-md">
                        {formatDistance(
                          calculateDistanceMeters(
                            DEFAULT_USER_LOCATION.lat,
                            DEFAULT_USER_LOCATION.lng,
                            item.geoCoords.lat,
                            item.geoCoords.lng
                          )
                        )} • {estimateWalkingTime(
                          calculateDistanceMeters(
                            DEFAULT_USER_LOCATION.lat,
                            DEFAULT_USER_LOCATION.lng,
                            item.geoCoords.lat,
                            item.geoCoords.lng
                          )
                        )}
                      </span>
                    )}
                    <span>🕒 {item.dateLost} at {item.timeLost}</span>
                    <span>👤 Reported by {item.reportedBy.name}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FOUND ITEMS INVENTORY */}
      {activeTab === 'found' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Secure Custody Locker Inventory
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Authorized Registrar Hold
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {foundItems.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                    <span>📍 Found at {item.locationFound}</span>
                    {item.geoCoords && (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                        {formatDistance(
                          calculateDistanceMeters(
                            DEFAULT_USER_LOCATION.lat,
                            DEFAULT_USER_LOCATION.lng,
                            item.geoCoords.lat,
                            item.geoCoords.lng
                          )
                        )} • {estimateWalkingTime(
                          calculateDistanceMeters(
                            DEFAULT_USER_LOCATION.lat,
                            DEFAULT_USER_LOCATION.lng,
                            item.geoCoords.lat,
                            item.geoCoords.lng
                          )
                        )}
                      </span>
                    )}
                    <span>🕒 {item.dateFound}</span>
                    <span>📦 Vault: {item.storageLockerRef}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLAIMS AND VERIFICATION */}
      {activeTab === 'claims' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ownership Verification Claims
            </span>
            <span className="text-[11px] text-slate-400">
              Requires physical verification by authorized staff
            </span>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-purple-600 font-bold">{claim.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Claimant: {claim.claimantName} ({claim.claimantEmail})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      claim.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Private Proof of Ownership Provided:
                  </span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                    "{claim.privateProofDescription}"
                  </p>
                </div>

                {claim.reviewNotes && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Officer Signoff: {claim.reviewNotes} (Reviewed by {claim.reviewedBy})
                  </p>
                )}

                {/* Staff Actions */}
                {claim.status === 'under_review' && isOfficerOrAdmin && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => onResolveClaim(claim.id, 'approve')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Approve & Release Item (+30 Eco Points)
                    </button>
                    <button
                      onClick={() => onResolveClaim(claim.id, 'reject')}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                    >
                      Reject Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORT LOST ITEM FORM */}
      {activeTab === 'report_lost' && (
        <form onSubmit={handleLostSubmit} className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Report a Lost Personal Item
          </h3>
          <p className="text-xs text-slate-500">
            Fill in the public category and your confidential identifying details. Our AI will automatically look for matches among secure found-item reports.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Category
              </label>
              <select
                value={lostCategory}
                onChange={(e) => setLostCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Building Last Seen
              </label>
              <select
                value={lostLocation}
                onChange={(e) => setLostLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Item Title / Short Name
            </label>
            <input
              type="text"
              value={lostTitle}
              onChange={(e) => setLostTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Date Lost
              </label>
              <input
                type="date"
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Approximate Time
              </label>
              <input
                type="text"
                value={lostTime}
                onChange={(e) => setLostTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Public Description
            </label>
            <textarea
              rows={2}
              value={lostDesc}
              onChange={(e) => setLostDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Confidential Identifying Detail (Kept Private!)</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              Engraving, serial number, lock screen image, scratch pattern, or inner label. Never displayed publicly!
            </p>
            <input
              type="text"
              value={lostPrivate}
              onChange={(e) => setLostPrivate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Submit Lost-Item Report
          </button>
        </form>
      )}

      {/* TAB 6: REPORT FOUND ITEM FORM */}
      {activeTab === 'report_found' && (
        <form onSubmit={handleFoundSubmit} className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Secure Found-Item Intake
          </h3>
          <p className="text-xs text-slate-500">
            Submit a secure report for an unattended item found on campus.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Possible Category
              </label>
              <select
                value={foundCategory}
                onChange={(e) => setFoundCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Building Found
              </label>
              <select
                value={foundLocation}
                onChange={(e) => setFoundLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Found Item Description
            </label>
            <input
              type="text"
              value={foundTitle}
              onChange={(e) => setFoundTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              required
            />
          </div>

          {/* AI Valuable Safety Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Valuable Detection Advisory:</span>
            </span>
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              Visual models suggest "Possible {foundCategory}". Note: AI image inspection cannot determine authenticity of gold, silver, or diamonds. The item will be placed in registrar custody locker LF-B04.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Submit Secure Found-Item Intake
          </button>
        </form>
      )}

      {/* Ownership Claim Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Submit Ownership Proof for Match #{selectedMatch.id}
              </h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              To verify this item is yours, describe the private identifying feature (e.g., exact inscription words, internal serial number, or scratch on underside) that is NOT visible in public reports.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-3">
              <textarea
                rows={3}
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
                placeholder="Example: The inner rim has engraved initials 'A.S. 2024' with navy-blue lapis lazuli stone..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                required
              />

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md"
                >
                  Submit for Officer Signoff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
