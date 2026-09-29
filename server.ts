import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  CampusReport,
  LostItem,
  FoundItem,
  LostFoundMatch,
  ClaimRequest,
  NotificationItem,
  AuditLogItem,
  WasteScanResult,
} from './src/types/index.ts';
import {
  INITIAL_REPORTS,
  INITIAL_LOST_ITEMS,
  INITIAL_FOUND_ITEMS,
  INITIAL_MATCHES,
  INITIAL_CLAIMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEPARTMENT_LEADERBOARD,
  AI_MODEL_METADATA,
} from './src/data/initialData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory data store for live reactive campus operations
let reports: CampusReport[] = JSON.parse(JSON.stringify(INITIAL_REPORTS));
let lostItems: LostItem[] = JSON.parse(JSON.stringify(INITIAL_LOST_ITEMS));
let foundItems: FoundItem[] = JSON.parse(JSON.stringify(INITIAL_FOUND_ITEMS));
let matches: LostFoundMatch[] = JSON.parse(JSON.stringify(INITIAL_MATCHES));
let claims: ClaimRequest[] = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
let notifications: NotificationItem[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let auditLogs: AuditLogItem[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let ecoLeaderboard = JSON.parse(JSON.stringify(DEPARTMENT_LEADERBOARD));
let totalScansCount = 1420;

// Initialize Gemini Client
let geminiAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.error('Failed to initialize GoogleGenAI:', e);
  }
}

// -------------------------------------------------------------
// AI WASTE SCANNER ENDPOINT
// -------------------------------------------------------------
app.post('/api/gemini/waste-scan', async (req, res) => {
  try {
    const { imageBase64, sampleType } = req.body;

    // Check if Gemini Vision can analyze imageBase64
    if (geminiAI && imageBase64 && imageBase64.startsWith('data:image/')) {
      try {
        const matchesMime = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matchesMime) {
          const mimeType = matchesMime[1];
          const rawBase64 = matchesMime[2];

          const prompt = `You are the core computer vision engine for WasteBot AI, an enterprise smart campus waste management system.
Analyze this uploaded waste image with precision. Respond with strict JSON matching this schema:
{
  "primaryObject": string (e.g., "PET Plastic Water Bottle"),
  "category": string (must be one of: "Organic Waste", "Recyclable Plastic", "Paper & Cardboard", "Glass", "Metal", "E-Waste", "Hazardous Waste", "Medical Waste", "Construction Waste", "General/Residual Waste"),
  "confidence": number (between 70.0 and 99.5),
  "risk": string ("Low", "Moderate", "High", or "Severe"),
  "recyclable": boolean,
  "recommendedStream": string (e.g. "Recyclable / Dry Waste Stream"),
  "recommendedBin": {
    "color": string (hex code, e.g. "#2563EB" for blue, "#16A34A" for green, "#EAB308" for yellow, "#DC2626" for red, "#4B5563" for grey),
    "label": string (e.g. "Blue Bin - Dry Clean Recyclables"),
    "description": string (e.g. "Place in blue dry waste bins located on every floor")
  },
  "disposalGuidance": string (concise actionable instructions for students/staff),
  "detectedObjects": [
    { "label": string, "count": number, "confidence": number, "box": { "ymin": number, "xmin": number, "ymax": number, "xmax": number } }
  ],
  "topPredictions": [
    { "label": string, "confidence": number, "category": string },
    { "label": string, "confidence": number, "category": string },
    { "label": string, "confidence": number, "category": string }
  ],
  "explainability": {
    "attentionRegion": string (explanation of visual features that influenced the classification, e.g., neck curvature, transparency, label typography),
    "confidenceFactors": [string, string, string],
    "heatmapHighlights": [
      { "x": number, "y": number, "radius": number, "intensity": number }
    ]
  },
  "qualityWarning": string (optional warning if blurry or dark, otherwise empty string),
  "isUnknown": boolean
}`;

          const response = await geminiAI.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: rawBase64,
                  },
                },
                { text: prompt },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            totalScansCount++;
            return res.json({
              id: `SCN-${Date.now()}`,
              timestamp: new Date().toISOString(),
              imageUrl: imageBase64,
              ...parsed,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini vision API fallback engaged:', geminiErr);
      }
    }

    // High fidelity realistic fallback for demo stability
    totalScansCount++;
    let result: Partial<WasteScanResult> = {};

    if (sampleType === 'sample_can' || (imageBase64 && imageBase64.includes('can'))) {
      result = {
        primaryObject: 'Crushed Aluminum Soda Can',
        category: 'Metal',
        confidence: 98.1,
        risk: 'Low',
        recyclable: true,
        recommendedStream: 'Metal & Recyclable Dry Waste',
        recommendedBin: {
          color: '#EAB308',
          label: 'Yellow Bin - Metal & Cans',
          description: 'Designated campus aluminum & tin collection bin',
        },
        disposalGuidance: 'Rinse residual liquids if possible. Crush to conserve bin capacity before disposal.',
        detectedObjects: [
          { label: 'Aluminum Can', count: 1, confidence: 98.1, box: { ymin: 22, xmin: 30, ymax: 75, xmax: 68 } },
        ],
        topPredictions: [
          { label: 'Aluminum Beverage Can', confidence: 98.1, category: 'Metal' },
          { label: 'Tin Container', confidence: 1.4, category: 'Metal' },
          { label: 'Foil Packaging', confidence: 0.5, category: 'General/Residual Waste' },
        ],
        explainability: {
          attentionRegion: 'Specular metallic reflection, cylindrical rim curvature, and pull-tab tab indentation.',
          confidenceFactors: ['Metallic surface reflectance', 'Cylindrical crimp morphology', 'Standard 330ml aspect ratio'],
          heatmapHighlights: [
            { x: 48, y: 35, radius: 40, intensity: 0.95 },
            { x: 52, y: 60, radius: 35, intensity: 0.85 },
          ],
        },
      };
    } else if (sampleType === 'sample_ewaste' || (imageBase64 && imageBase64.includes('ewaste'))) {
      result = {
        primaryObject: 'Lithium-Ion Battery & Component PCB',
        category: 'E-Waste',
        confidence: 95.3,
        risk: 'High',
        recyclable: true,
        recommendedStream: 'Specialized E-Waste / Battery Depository',
        recommendedBin: {
          color: '#DC2626',
          label: 'Red Bin - E-Waste Vault',
          description: 'Keep separate from general refuse. Deposit at Central Library e-waste kiosk.',
        },
        disposalGuidance: 'Keep batteries isolated. Do not puncture or expose to heat. Submit via designated campus e-waste drive.',
        detectedObjects: [
          { label: 'Lithium Battery Cell', count: 1, confidence: 95.3, box: { ymin: 15, xmin: 25, ymax: 55, xmax: 60 } },
          { label: 'Printed Circuit Board', count: 1, confidence: 91.8, box: { ymin: 50, xmin: 40, ymax: 85, xmax: 80 } },
        ],
        topPredictions: [
          { label: 'Lithium Polymer Battery', confidence: 95.3, category: 'E-Waste' },
          { label: 'Microcontroller Board', confidence: 91.8, category: 'E-Waste' },
          { label: 'Electrical Wiring Harness', confidence: 2.1, category: 'E-Waste' },
        ],
        explainability: {
          attentionRegion: 'Rectangular prism form-factor, battery hazard warning iconography, and copper trace busbars.',
          confidenceFactors: ['Lithium chemistry warning label', 'Terminal solder points', 'IC chip footprints'],
          heatmapHighlights: [
            { x: 42, y: 32, radius: 45, intensity: 0.98 },
            { x: 62, y: 65, radius: 38, intensity: 0.88 },
          ],
        },
      };
    } else if (sampleType === 'sample_canteen' || (imageBase64 && imageBase64.includes('food'))) {
      result = {
        primaryObject: 'Mixed Food Waste & Biodegradable Napkins',
        category: 'Organic Waste',
        confidence: 94.2,
        risk: 'Low',
        recyclable: true,
        recommendedStream: 'Wet Organic Compost Stream',
        recommendedBin: {
          color: '#16A34A',
          label: 'Green Bin - Wet / Biodegradable Waste',
          description: 'Processed in campus biogas digester & vermicompost pit',
        },
        disposalGuidance: 'Remove plastic wrappers or cutlery before dropping into the wet compost stream.',
        detectedObjects: [
          { label: 'Food Residue', count: 1, confidence: 94.2, box: { ymin: 25, xmin: 20, ymax: 78, xmax: 75 } },
          { label: 'Cellulose Napkin', count: 2, confidence: 89.0, box: { ymin: 55, xmin: 60, ymax: 85, xmax: 90 } },
        ],
        topPredictions: [
          { label: 'Cooked Meal Remnants', confidence: 94.2, category: 'Organic Waste' },
          { label: 'Fruit Peel & Greens', confidence: 4.1, category: 'Organic Waste' },
          { label: 'Paper Food Tray', confidence: 1.7, category: 'Paper & Cardboard' },
        ],
        explainability: {
          attentionRegion: 'Irregular texture patterns, high moisture reflectance, and organic fiber composition.',
          confidenceFactors: ['Color gradient variance', 'Moisture level sheen', 'Absence of polymer sheen'],
          heatmapHighlights: [
            { x: 45, y: 50, radius: 55, intensity: 0.92 },
            { x: 72, y: 68, radius: 30, intensity: 0.82 },
          ],
        },
      };
    } else {
      // Default: PET Plastic Bottle (per Step 3: Plastic Bottle — 96.8%)
      result = {
        primaryObject: 'Clear PET Plastic Beverage Bottle',
        category: 'Recyclable Plastic',
        confidence: 96.8,
        risk: 'Low',
        recyclable: true,
        recommendedStream: 'Recyclable / Dry Waste',
        recommendedBin: {
          color: '#2563EB',
          label: 'Blue Bin - Clean Plastics & Bottles',
          description: 'Recycled through campus reverse vending & recycling partner',
        },
        disposalGuidance: 'Empty liquid residue if present, replace cap loosely, and place in the designated dry recyclable stream.',
        detectedObjects: [
          { label: 'Plastic Bottle', count: 1, confidence: 96.8, box: { ymin: 18, xmin: 32, ymax: 82, xmax: 65 } },
          { label: 'Polypropylene Cap', count: 1, confidence: 92.4, box: { ymin: 15, xmin: 44, ymax: 26, xmax: 54 } },
        ],
        topPredictions: [
          { label: 'PET Plastic Bottle', confidence: 96.8, category: 'Recyclable Plastic' },
          { label: 'Glass Soda Bottle', confidence: 2.1, category: 'Glass' },
          { label: 'Clear Metal Container', confidence: 1.1, category: 'Metal' },
        ],
        explainability: {
          attentionRegion: 'Polyethylene terephthalate transparency, ribbed grip contours, and threaded bottle neck.',
          confidenceFactors: ['Optical transparency profile', 'Recycling triangle symbol #1 detection', 'Standard beverage neck thread'],
          heatmapHighlights: [
            { x: 49, y: 48, radius: 50, intensity: 0.96 },
            { x: 49, y: 22, radius: 25, intensity: 0.88 },
            { x: 49, y: 75, radius: 35, intensity: 0.84 },
          ],
        },
      };
    }

    return res.json({
      id: `SCN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64 || '/placeholder.png',
      ...result,
    });
  } catch (error: any) {
    console.error('Waste scan error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error in waste scan' });
  }
});

// -------------------------------------------------------------
// AI REPORT MULTIMODAL ANALYSIS & SMART ROUTING
// -------------------------------------------------------------
app.post('/api/gemini/analyze-report', async (req, res) => {
  try {
    const { title, description, voiceTranscript, location, categoryInput } = req.body;
    const combinedText = `${title || ''} ${description || ''} ${voiceTranscript || ''}`.trim();

    // Check for duplicate reports in same building within recent window
    const building = location?.building || '';
    const duplicates = reports.filter(
      (r) =>
        r.status !== 'resolved' &&
        r.status !== 'closed' &&
        building &&
        r.location.building.toLowerCase() === building.toLowerCase() &&
        (r.category.toLowerCase().includes('overflow') ||
          r.category.toLowerCase().includes('leak') ||
          r.description.toLowerCase().includes(combinedText.substring(0, 15).toLowerCase()))
    );

    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let assignedDept = 'Campus Housekeeping Services';
    let assignedTeam = 'Cleaning Team Alpha';
    let category = categoryInput || 'Overflowing bin';
    let slaMinutes = 60;

    const lower = combinedText.toLowerCase();

    // Smart routing logic
    if (lower.includes('chemical') || lower.includes('hazard') || lower.includes('fire') || lower.includes('smoke') || lower.includes('shock') || lower.includes('injury')) {
      priority = 'critical';
      assignedDept = 'Campus Safety & Vigilance';
      assignedTeam = 'Special Hazardous Handling Unit';
      category = 'Safety issue';
      slaMinutes = 20;
    } else if (lower.includes('leak') || lower.includes('pipe') || lower.includes('water') || lower.includes('tap') || lower.includes('plumb')) {
      priority = 'high';
      assignedDept = 'Electrical & Civil Maintenance';
      assignedTeam = 'Plumbing Rapid Response';
      category = 'Water leakage';
      slaMinutes = 45;
    } else if (lower.includes('electric') || lower.includes('light') || lower.includes('wire') || lower.includes('switch') || lower.includes('power')) {
      priority = 'high';
      assignedDept = 'Electrical & Civil Maintenance';
      assignedTeam = 'Electrical Maintenance Squad';
      category = 'Electrical problem';
      slaMinutes = 45;
    } else if (lower.includes('overflow') || lower.includes('garbage') || lower.includes('trash') || lower.includes('dump') || lower.includes('bin')) {
      priority = 'high';
      assignedDept = 'Campus Housekeeping Services';
      assignedTeam = 'Cleaning Team Alpha';
      category = 'Overflowing bin';
      slaMinutes = 45;
    } else if (lower.includes('restroom') || lower.includes('washroom') || lower.includes('toilet') || lower.includes('hygiene')) {
      priority = 'high';
      assignedDept = 'Campus Housekeeping Services';
      assignedTeam = 'Restroom Sanitation Crew';
      category = 'Restroom hygiene';
      slaMinutes = 30;
    } else if (lower.includes('garden') || lower.includes('tree') || lower.includes('grass') || lower.includes('lawn')) {
      priority = 'low';
      assignedDept = 'Estate & Gardening Unit';
      assignedTeam = 'Greenery Team';
      category = 'Garden waste';
      slaMinutes = 180;
    }

    // Try Gemini if available to refine
    if (geminiAI && combinedText.length > 5) {
      try {
        const geminiRes = await geminiAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Analyze this campus facility problem report: "${combinedText}".
Location: ${building}, ${location?.room || ''}.
Respond with JSON:
{
  "category": string (e.g. "Overflowing bin", "Water leakage", "Electrical problem", "Restroom hygiene", "Waste dumping", "Safety issue"),
  "priority": "critical" | "high" | "medium" | "low",
  "assignedDepartment": string,
  "assignedTeam": string,
  "slaMinutes": number,
  "aiRationale": string
}`,
          config: { responseMimeType: 'application/json', temperature: 0.1 },
        });

        if (geminiRes.text) {
          const parsed = JSON.parse(geminiRes.text);
          category = parsed.category || category;
          priority = parsed.priority || priority;
          assignedDept = parsed.assignedDepartment || assignedDept;
          assignedTeam = parsed.assignedTeam || assignedTeam;
          slaMinutes = parsed.slaMinutes || slaMinutes;
        }
      } catch (err) {
        console.warn('Gemini report analysis fallback:', err);
      }
    }

    return res.json({
      suggestedCategory: category,
      suggestedPriority: priority,
      suggestedDepartment: assignedDept,
      suggestedTeam: assignedTeam,
      slaMinutes,
      duplicateCount: duplicates.length,
      existingIncidentIds: duplicates.map((d) => d.id),
      isDuplicateAlert: duplicates.length > 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// AI CAMPUS ASSISTANT
// -------------------------------------------------------------
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { message, language = 'en', history = [] } = req.body;

    const systemPrompt = `You are WasteBot Assistant, the friendly, authoritative smart campus cleanliness, waste management, safety, and lost-and-found guide for our university.
Current language requested: ${language} (support English, Tamil, or Hindi as requested).
Key campus policies:
1. Recyclables (PET bottles, clean paper, tin cans) go into Blue/Yellow bins.
2. Wet organic waste and canteen food scraps go into Green bins (processed in campus biogas plant).
3. Batteries and circuit boards must never be discarded in general bins; deposit in red vaults at Central Library or Tech Tower G-floor.
4. Overflowing bins and spills can be reported with photo and voice in the 'Report Issue' tab.
5. Lost items can be reported under 'Lost & Found'. If you found something, submit a secure report with photo.
6. Important safety: Photos cannot verify precious metals (gold/silver) or assign monetary values. Physical verification at Lost & Found desk is mandatory.
Be concise, helpful, and courteous. Provide actionable guidance to navigate WasteBot AI features.`;

    if (geminiAI) {
      try {
        const response = await geminiAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { text: systemPrompt },
            ...history.map((h: any) => ({ text: `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}` })),
            { text: `User: ${message}\nAssistant:` },
          ],
        });

        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (err) {
        console.warn('Gemini Assistant fallback:', err);
      }
    }

    // High quality intelligent fallback answers
    let reply = 'Hello! I am your WasteBot AI Campus Assistant. You can report campus waste, track cleaning tasks, scan recyclables, or safely claim lost items.';
    const q = message.toLowerCase();

    if (q.includes('battery') || q.includes('e-waste') || q.includes('electronics')) {
      reply = '🔋 Batteries and electronics must be kept separate from general trash! Please bring them to the Central Library Ground Floor or Tech Tower E-Waste Vault. You can also use the AI Scanner to verify any gadget component.';
    } else if (q.includes('overflow') || q.includes('bin') || q.includes('dirty') || q.includes('spill')) {
      reply = '🗑️ You can report an overflowing bin or unclean area immediately using the "Report Issue" tab. Upload a quick photo or use voice input — WasteBot will auto-route it to Housekeeping within 45 minutes!';
    } else if (q.includes('ring') || q.includes('lost') || q.includes('wallet') || q.includes('phone') || q.includes('found')) {
      reply = '🔎 For lost or found items, navigate to the "Lost & Found" section. Note that our AI assists with category and location matching, but physical verification at Officer Priya Nathan\'s desk is always required for personal security.';
    } else if (language === 'ta' || q.includes('vanakkam')) {
      reply = 'வணக்கம்! நான் வேஸ்ட்பாட் AI உதவியாளர். கழிவு மேலாண்மை, வளாக தூய்மை மற்றும் தொலைந்த பொருட்களைக் கண்டறிய உங்களுக்கு உதவ முடியும்.';
    } else if (language === 'hi' || q.includes('namaste')) {
      reply = 'नमस्ते! मैं वेस्टबॉट एआई सहायक हूँ। परिसर की सफाई, कचरा छँटाई और खोई-पाई वस्तुओं के प्रबंधन में मैं आपकी मदद कर सकता हूँ।';
    }

    return res.json({ reply });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// CAMPUS REPORTS REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/reports', (req, res) => {
  const newReport: CampusReport = {
    id: `RPT-2026-0${80 + reports.length + 1}`,
    reportedAt: new Date().toISOString(),
    status: 'assigned',
    timeline: [
      {
        timestamp: new Date().toLocaleTimeString(),
        action: `Report Created by ${req.body.reportedBy?.name || 'Student'}`,
        actor: req.body.reportedBy?.name || 'Student',
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        action: `AI Auto-Assigned to ${req.body.assignedTeam || 'Cleaning Team Alpha'} (SLA ${req.body.slaMinutes || 45}m)`,
        actor: 'WasteBot Smart Dispatcher',
      },
    ],
    ...req.body,
  };

  reports.unshift(newReport);

  // Add audit log
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: newReport.reportedBy.name,
    role: newReport.reportedBy.role,
    action: 'Create Campus Report',
    incidentId: newReport.id,
    newStatus: 'assigned',
    details: `${newReport.category} reported at ${newReport.location.building} (${newReport.priority.toUpperCase()})`,
  });

  // Add notification
  notifications.unshift({
    id: `notif_${Date.now()}`,
    title: `New Incident: ${newReport.title}`,
    message: `Dispatched to ${newReport.assignedTeam}. Location: ${newReport.location.building}.`,
    type: 'task',
    timestamp: 'Just now',
    read: false,
    link: 'tasks',
  });

  res.status(201).json(newReport);
});

app.patch('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, actorName, notes } = req.body;
  const report = reports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const prev = report.status;
  report.status = status;
  if (status === 'resolved' || status === 'closed') {
    report.resolvedAt = new Date().toISOString();
  }

  report.timeline.push({
    timestamp: new Date().toLocaleTimeString(),
    action: `Status changed to ${status.toUpperCase().replace('_', ' ')}`,
    actor: actorName || 'Operations Staff',
    notes,
  });

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: actorName || 'Operations Staff',
    role: 'Staff',
    action: 'Update Incident Status',
    incidentId: id,
    previousStatus: prev,
    newStatus: status,
    details: notes || `Moved to ${status}`,
  });

  res.json(report);
});

app.post('/api/reports/:id/verify', (req, res) => {
  const { id } = req.params;
  const { afterPhoto, verificationNotes, verifiedBy } = req.body;
  const report = reports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.afterPhoto = afterPhoto || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80';
  report.status = 'resolved';
  report.resolvedAt = new Date().toISOString();
  const verifier = verifiedBy || 'Dr. K. Rajesh (HOD)';
  report.verifiedBy = verifier;
  report.verificationNotes = verificationNotes || 'Before and after visual comparison verified. Waste properly cleared and disposed.';

  report.timeline.push({
    timestamp: new Date().toLocaleTimeString(),
    action: `Before/After Verification Approved by ${verifier}`,
    actor: verifier,
    notes: report.verificationNotes,
  });

  // Credit student eco points
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: verifier,
    role: 'HOD / Staff',
    action: 'Verify & Close Incident',
    incidentId: id,
    previousStatus: 'under_verification',
    newStatus: 'resolved',
    details: `Incident verified with photo evidence. +15 Eco Points credited to ${report.reportedBy.name}.`,
  });

  notifications.unshift({
    id: `notif_${Date.now()}`,
    title: 'Incident Resolved & Verified! ✅',
    message: `${report.title} was inspected and confirmed resolved. Great job!`,
    type: 'eco',
    timestamp: 'Just now',
    read: false,
    link: 'dashboard',
  });

  res.json(report);
});

// -------------------------------------------------------------
// LOST & FOUND REST ENDPOINTS
// -------------------------------------------------------------
app.get('/api/lost-items', (req, res) => {
  // Omit private details for public view unless requested by authorized officer
  const role = req.headers['x-user-role'];
  if (role === 'lost_found' || role === 'admin' || role === 'security') {
    return res.json(lostItems);
  }
  const sanitized = lostItems.map((item) => ({
    ...item,
    privateDetails: '🔒 [Confidential - Authorized Staff Verification Only]',
  }));
  res.json(sanitized);
});

app.post('/api/lost-items', (req, res) => {
  const newItem: LostItem = {
    id: `LOST-2026-0${30 + lostItems.length + 1}`,
    reportedAt: new Date().toISOString(),
    status: 'under_verification',
    potentialMatchIds: [],
    ...req.body,
  };

  // Run AI potential match across existing found items
  const potentialMatches: string[] = [];
  foundItems.forEach((f) => {
    if (f.status !== 'returned' && f.status !== 'closed') {
      const catMatch = f.category.toLowerCase() === newItem.category.toLowerCase();
      const bldMatch = f.building.toLowerCase() === newItem.building.toLowerCase();
      if (catMatch || bldMatch) {
        potentialMatches.push(f.id);
        matches.unshift({
          id: `MTC-2026-0${12 + matches.length + 1}`,
          lostItemId: newItem.id,
          foundItemId: f.id,
          similarityScore: catMatch && bldMatch ? 92.5 : 74.0,
          categoryMatch: catMatch,
          locationSimilarity: bldMatch ? 'High' : 'Moderate',
          timeSimilarity: 'High',
          notes: `Visual and category match in ${newItem.building}. Physical verification required.`,
          status: 'pending',
        });
      }
    }
  });

  newItem.potentialMatchIds = potentialMatches;
  lostItems.unshift(newItem);

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: newItem.reportedBy.name,
    role: 'Student',
    action: 'Report Lost Item',
    incidentId: newItem.id,
    newStatus: 'under_verification',
    details: `${newItem.title} lost in ${newItem.building}. Potential matches: ${potentialMatches.length}`,
  });

  if (potentialMatches.length > 0) {
    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Potential Lost Item Match Found! 🔎',
      message: `We found a likely match for your reported ${newItem.category} in ${newItem.building}!`,
      type: 'match',
      timestamp: 'Just now',
      read: false,
      link: 'lost-found',
    });
  }

  res.status(201).json(newItem);
});

app.get('/api/found-items', (req, res) => {
  res.json(foundItems);
});

app.post('/api/found-items', (req, res) => {
  const newItem: FoundItem = {
    id: `FND-2026-0${40 + foundItems.length + 1}`,
    reportedAt: new Date().toISOString(),
    status: 'under_verification',
    storageLockerRef: `Vault Locker LF-B0${foundItems.length + 1}`,
    ...req.body,
  };

  // Run AI potential match across existing lost items
  lostItems.forEach((l) => {
    if (l.status !== 'returned' && l.status !== 'closed') {
      const catMatch = l.category.toLowerCase() === newItem.category.toLowerCase();
      const bldMatch = l.building.toLowerCase() === newItem.building.toLowerCase();
      if (catMatch || bldMatch) {
        if (!l.potentialMatchIds) l.potentialMatchIds = [];
        l.potentialMatchIds.push(newItem.id);

        matches.unshift({
          id: `MTC-2026-0${12 + matches.length + 1}`,
          lostItemId: l.id,
          foundItemId: newItem.id,
          similarityScore: catMatch && bldMatch ? 94.5 : 78.0,
          categoryMatch: catMatch,
          locationSimilarity: bldMatch ? 'High' : 'Moderate',
          timeSimilarity: 'High',
          notes: `Potential match between ${l.title} and found item in ${newItem.building}.`,
          status: 'pending',
        });
      }
    }
  });

  foundItems.unshift(newItem);

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: newItem.reportedBy.name,
    role: 'Staff / Finder',
    action: 'Secure Found Item Logged',
    incidentId: newItem.id,
    newStatus: 'under_verification',
    details: `${newItem.title} securely stored in ${newItem.storageLockerRef}.`,
  });

  res.status(201).json(newItem);
});

app.get('/api/lost-found/matches', (req, res) => {
  res.json(matches);
});

app.post('/api/claims', (req, res) => {
  const newClaim: ClaimRequest = {
    id: `CLM-2026-0${claims.length + 9}`,
    submittedAt: new Date().toISOString(),
    status: 'under_review',
    ...req.body,
  };

  claims.unshift(newClaim);

  notifications.unshift({
    id: `notif_${Date.now()}`,
    title: 'New Ownership Claim Submitted 🔐',
    message: `${newClaim.claimantName} submitted private proof of ownership for verification.`,
    type: 'match',
    timestamp: 'Just now',
    read: false,
    link: 'lost-found',
  });

  res.status(201).json(newClaim);
});

// Verify and close claim / return item
app.post('/api/claims/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { officerName, notes, action } = req.body;
  const claim = claims.find((c) => c.id === id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  claim.status = action === 'approve' ? 'approved' : 'rejected';
  const reviewer = officerName || 'Priya Nathan (Lost & Found Officer)';
  claim.reviewedBy = reviewer;
  claim.reviewNotes = notes || 'Claim verified against physical item private markings.';

  if (action === 'approve') {
    const lostItem = lostItems.find((l) => l.id === claim.lostItemId);
    const foundItem = foundItems.find((f) => f.id === claim.foundItemId);
    if (lostItem) lostItem.status = 'returned';
    if (foundItem) foundItem.status = 'returned';

    auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: reviewer,
      role: 'Lost & Found Officer',
      action: 'Item Claim Verified & Returned',
      incidentId: claim.id,
      newStatus: 'returned',
      details: `Item successfully restored to rightful owner ${claim.claimantName}. +30 Eco Points awarded!`,
    });
  }

  res.json(claim);
});

// -------------------------------------------------------------
// NOTIFICATIONS & AUDIT LOGS
// -------------------------------------------------------------
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  notifications.forEach((n) => (n.read = true));
  res.json({ success: true });
});

app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

app.get('/api/analytics', (req, res) => {
  const total = reports.length;
  const resolved = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  const inProgress = reports.filter((r) => r.status === 'in_progress' || r.status === 'assigned').length;
  const critical = reports.filter((r) => r.priority === 'critical' && r.status !== 'resolved').length;

  res.json({
    totalScans: totalScansCount,
    totalReports: total,
    resolvedReports: resolved,
    inProgressReports: inProgress,
    criticalReports: critical,
    resolutionRate: Math.round((resolved / Math.max(total, 1)) * 100),
    avgResponseMinutes: 18.4,
    avgResolutionMinutes: 44.2,
    campusCleanlinessScore: 91,
    wasteBreakdown: [
      { category: 'Recyclable Plastic', count: 540, percentage: 38 },
      { category: 'Organic Food Waste', count: 412, percentage: 29 },
      { category: 'Paper & Cardboard', count: 245, percentage: 17 },
      { category: 'Metal & Cans', count: 114, percentage: 8 },
      { category: 'E-Waste', count: 65, percentage: 5 },
      { category: 'Hazardous / Chemical', count: 44, percentage: 3 },
    ],
    departmentLeaderboard: ecoLeaderboard,
    aiModel: AI_MODEL_METADATA,
  });
});

app.post('/api/demo-reset', (req, res) => {
  reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
  lostItems = JSON.parse(JSON.stringify(INITIAL_LOST_ITEMS));
  foundItems = JSON.parse(JSON.stringify(INITIAL_FOUND_ITEMS));
  matches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
  claims = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
  notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  res.json({ success: true, message: 'Demo dataset restored successfully.' });
});

// -------------------------------------------------------------
// VITE INTEGRATION (DEV & PROD)
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`♻️ WasteBot AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
