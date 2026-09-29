export type Role =
  | 'student'
  | 'staff'
  | 'hod'
  | 'cleaning'
  | 'maintenance'
  | 'security'
  | 'lost_found'
  | 'admin';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus =
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'under_verification'
  | 'resolved'
  | 'closed';

export type LostFoundStatus =
  | 'reported'
  | 'under_verification'
  | 'stored'
  | 'claim_pending'
  | 'returned'
  | 'closed';

export type WasteCategory =
  | 'Organic Waste'
  | 'Recyclable Plastic'
  | 'Paper & Cardboard'
  | 'Glass'
  | 'Metal'
  | 'E-Waste'
  | 'Hazardous Waste'
  | 'Medical Waste'
  | 'Construction Waste'
  | 'General/Residual Waste';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  collegeId: string;
  year?: string;
  avatar?: string;
  phone?: string;
  ecoPoints: number;
  reportsCount: number;
  resolvedCount: number;
}

export interface DetectedObject {
  label: string;
  count: number;
  confidence: number;
  box?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export interface PredictionItem {
  label: string;
  confidence: number;
  category: WasteCategory;
}

export interface WasteScanResult {
  id: string;
  imageUrl: string;
  timestamp: string;
  primaryObject: string;
  category: WasteCategory;
  confidence: number;
  risk: 'Low' | 'Moderate' | 'High' | 'Severe';
  recyclable: boolean;
  recommendedStream: string;
  recommendedBin: {
    color: string;
    label: string;
    description: string;
  };
  disposalGuidance: string;
  detectedObjects: DetectedObject[];
  topPredictions: PredictionItem[];
  explainability: {
    attentionRegion: string;
    confidenceFactors: string[];
    heatmapHighlights: { x: number; y: number; radius: number; intensity: number }[];
  };
  qualityWarning?: string;
  isUnknown?: boolean;
}

export interface CampusReport {
  id: string;
  title: string;
  type: string;
  category: string;
  location: {
    building: string;
    floor: string;
    room?: string;
    areaDescription?: string;
    coords?: { x: number; y: number }; // For canvas campus map percentage 0-100
    geoCoords?: { lat: number; lng: number }; // Real geographic coordinates
  };
  description: string;
  photoUrl?: string;
  voiceTranscript?: string;
  priority: Priority;
  status: ReportStatus;
  assignedDepartment: string;
  assignedTeam: string;
  assignedTo?: string;
  reportedBy: {
    id: string;
    name: string;
    role: Role;
    email: string;
  };
  reportedAt: string;
  resolvedAt?: string;
  slaMinutes: number;
  beforePhoto?: string;
  afterPhoto?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  duplicateCount?: number;
  isMasterIncident?: boolean;
  timeline: {
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
}

export interface LostItem {
  id: string;
  title: string;
  category: string;
  description: string;
  locationLost: string;
  building: string;
  geoCoords?: { lat: number; lng: number };
  dateLost: string;
  timeLost: string;
  photoUrl?: string;
  privateDetails: string; // Serial number, private engraving, lock screen wallpaper, etc.
  status: LostFoundStatus;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  reportedAt: string;
  assignedOfficer?: string;
  aiSuggestedCategory?: string;
  potentialMatchIds?: string[];
}

export interface FoundItem {
  id: string;
  title: string;
  category: string;
  description: string;
  locationFound: string;
  building: string;
  geoCoords?: { lat: number; lng: number };
  dateFound: string;
  timeFound: string;
  photoUrl?: string;
  storageLockerRef?: string;
  status: LostFoundStatus;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  reportedAt: string;
  assignedOfficer?: string;
  aiValuableDetection?: {
    isPossibleValuable: boolean;
    suggestedLabel: string;
    disclaimer: string;
  };
}

export interface LostFoundMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  similarityScore: number;
  categoryMatch: boolean;
  locationSimilarity: 'High' | 'Moderate' | 'Low';
  timeSimilarity: 'High' | 'Moderate' | 'Low';
  notes: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ClaimRequest {
  id: string;
  lostItemId: string;
  foundItemId: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  privateProofDescription: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'report' | 'match' | 'escalation' | 'eco';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface EcoPointsHistory {
  id: string;
  studentId: string;
  action: string;
  points: number;
  timestamp: string;
  badge?: string;
}

export interface DepartmentEcoScore {
  department: string;
  code: string;
  points: number;
  reportsSolved: number;
  cleanlinessScore: number;
  rank: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  incidentId: string;
  previousStatus?: string;
  newStatus?: string;
  details: string;
}

export interface AIModelMeta {
  name: string;
  version: string;
  supportedClassesCount: number;
  datasetSize: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
  inferenceTimeMs: number;
  lastTrained: string;
}
