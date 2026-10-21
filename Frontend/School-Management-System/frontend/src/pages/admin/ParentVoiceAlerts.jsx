import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  Phone,
  PhoneOff,
  PhoneForwarded,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ShieldAlert,
  Users,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Calendar,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  X,
  Radio,
  Sliders,
  Send,
  UserCheck,
  Settings,
  Cpu,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  UserX,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import parentAlertService from '../../services/parentAlertService';
import courseService from '../../services/courseService';

const ParentVoiceAlerts = () => {
  // Main tabs: 'alerts', 'history', 'followups', 'contacts', 'setup'
  const [activeTab, setActiveTab] = useState('alerts');
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Configurable Risk Thresholds
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [riskConfig, setRiskConfig] = useState({
    attendanceThreshold: 75.0,
    marksThreshold: 40.0,
    missingAssignmentsThreshold: 1,
    preferredLanguage: 'en-IN',
    ollamaModel: 'llama3',
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Modals state
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [studentSummary, setStudentSummary] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [customConcerns, setCustomConcerns] = useState('');
  const [customScript, setCustomScript] = useState('');

  // Call Studio state
  const [showCallStudio, setShowCallStudio] = useState(false);
  const [callSession, setCallSession] = useState(null);
  const [callState, setCallState] = useState('DIALING');
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [activeEngine, setActiveEngine] = useState('Local Institutional Rule Engine');

  // Session Wrap-Up & Outcome Dialog
  const [showWrapUpModal, setShowWrapUpModal] = useState(false);
  const [wrapUpStatus, setWrapUpStatus] = useState('COMPLETED');
  const [wrapUpOutcome, setWrapUpOutcome] = useState('CONSULTATION_REQUESTED');
  const [wrapUpFollowUpRequired, setWrapUpFollowUpRequired] = useState(true);
  const [wrapUpFollowUpDate, setWrapUpFollowUpDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [wrapUpNotes, setWrapUpNotes] = useState('');
  const [savingOutcome, setSavingOutcome] = useState(false);

  // Other Modals
  const [showTranscriptModal, setShowTranscriptModal] = useState(null);
  const [showContactModal, setShowContactModal] = useState(null);
  const [resolveFollowUpModal, setResolveFollowUpModal] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const durationTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Load all dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, alertsData, historyData, followupsData, contactsData, coursesData, aiData, cfgData] =
        await Promise.all([
          parentAlertService.getDashboardStats().catch(() => null),
          parentAlertService.getFlaggedStudents().catch(() => []),
          parentAlertService.getCallHistory().catch(() => []),
          parentAlertService.getFollowUpRequests().catch(() => []),
          parentAlertService.getParentContacts().catch(() => []),
          courseService.getAllCourses().catch(() => []),
          parentAlertService.getAiStatus().catch(() => null),
          parentAlertService.getRiskConfig().catch(() => null),
        ]);

      setStats(statsData);
      setAlerts(alertsData || []);
      setHistory(historyData || []);
      setFollowups(followupsData || []);
      setContacts(contactsData || []);
      setCourses(coursesData || []);
      setAiStatus(aiData);
      if (cfgData) {
        setRiskConfig({
          attendanceThreshold: cfgData.attendanceThreshold || 75.0,
          marksThreshold: cfgData.marksThreshold || 40.0,
          missingAssignmentsThreshold: cfgData.missingAssignmentsThreshold ?? 1,
          preferredLanguage: cfgData.preferredLanguage || 'en-IN',
          ollamaModel: cfgData.ollamaModel || 'llama3',
        });
      }
    } catch (err) {
      console.error('Error loading parent calling data:', err);
      setError('Failed to load parent calling data. Please ensure backend services are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  // Duration timer for active call
  useEffect(() => {
    if (showCallStudio && callState !== 'ENDED') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [showCallStudio, callState]);

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptMessages, isAiSpeaking]);

  // Save Threshold Config
  const handleSaveThresholds = async (e) => {
    e?.preventDefault();
    try {
      setSavingConfig(true);
      await parentAlertService.updateRiskConfig(riskConfig);
      setActionSuccess('Risk thresholds updated. Flagged cohort recalculated.');
      setShowConfigDrawer(false);
      await loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to update thresholds: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingConfig(false);
    }
  };

  // Open Academic Details & Call Prep Modal
  const handleOpenCallPrep = async (studentId, alertItem = null) => {
    try {
      setPrepLoading(true);
      setShowPrepModal(true);
      const summary = await parentAlertService.getStudentAcademicSummary(studentId);
      setStudentSummary(summary);
      setSelectedLanguage(summary.guardian?.preferredLanguage || riskConfig.preferredLanguage || 'en-IN');
      setCustomConcerns(
        summary.riskReasons?.length ? summary.riskReasons.join(' | ') : 'Routine academic progress review'
      );
      setCustomScript(summary.suggestedCallScript || '');
    } catch (err) {
      console.error('Error fetching student academic summary:', err);
      alert('Could not retrieve student academic summary: ' + (err.response?.data?.error || err.message));
      setShowPrepModal(false);
    } finally {
      setPrepLoading(false);
    }
  };

  // Web Speech Synthesis (AI Speaks)
  const speakAiText = (text) => {
    if (!('speechSynthesis' in window) || voiceMuted) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = null;
    if (selectedLanguage.startsWith('hi')) {
      matchingVoice = voices.find((v) => v.lang.startsWith('hi'));
    } else if (selectedLanguage.startsWith('te')) {
      matchingVoice = voices.find((v) => v.lang.startsWith('te'));
    }
    if (!matchingVoice) {
      matchingVoice = voices.find(
        (v) => v.lang === 'en-IN' || v.name.includes('India') || v.lang.startsWith('en')
      );
    }
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };
    utterance.onend = () => {
      setIsAiSpeaking(false);
      if (callState !== 'ENDED' && callState !== 'WRAP_UP' && !micMuted) {
        startSpeechRecognition();
      }
    };
    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition (Parent Speaks)
  const startSpeechRecognition = () => {
    if (micMuted) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsMicListening(true);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleParentMessage(transcript);
        }
      };
      recognition.onerror = (e) => {
        console.warn('Speech recognition notice:', e.error);
        setIsMicListening(false);
      };
      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Could not start recognition:', e);
      setIsMicListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      setIsMicListening(false);
    }
  };

  // Start In-Browser Simulation
  const handleLaunchSimulation = async () => {
    if (!studentSummary) return;
    try {
      setLoading(true);
      setShowPrepModal(false);

      // Check mic permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (micErr) {
          console.warn('Microphone permission warning:', micErr);
        }
      }

      const session = await parentAlertService.startSimulatedVoiceSession(
        studentSummary.studentId,
        null,
        selectedLanguage,
        customConcerns
      );

      setCallSession(session);
      setCallState('GREETING_AND_IDENTITY_CHECK');
      setCallDuration(0);

      let initialGreeting = `Hello, this is the automated academic support assistant from Project 577 College of Engineering. Am I speaking with the parent or guardian of ${session.studentName}?`;
      if (selectedLanguage.startsWith('hi')) {
        initialGreeting = `नमस्ते, यह प्रोजेक्ट 577 कॉलेज ऑफ इंजीनियरिंग से ऑटोमेटेड अकादमिक सपोर्ट असिस्टेंट है। क्या मैं ${session.studentName} के अभिभावक से बात कर रहा हूँ?`;
      } else if (selectedLanguage.startsWith('te')) {
        initialGreeting = `నమస్కారం, ఇది ప్రాజెక్ట్ 577 ఇంజనీరింగ్ కళాశాల నుండి అకడమిక్ సపోర్ట్ అసిస్టెంట్. నేను ${session.studentName} గారి తల్లిదండ్రులతో మాట్లాడుతున్నానా?`;
      }

      setTranscriptMessages([
        {
          sender: 'system',
          text: `Simulated browser voice session connected to ${session.guardianName || 'Guardian'} (${session.phoneNumber || 'Simulation Profile'}). Computer mic and speakers active.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          sender: 'ai',
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setShowCallStudio(true);
      speakAiText(initialGreeting);
    } catch (err) {
      console.error('Failed to start simulated session:', err);
      alert('Could not start call session: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle Parent message turn
  const handleParentMessage = async (parentText) => {
    if (!parentText.trim() || !callSession) return;

    stopSpeechRecognition();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTranscriptMessages((prev) => [
      ...prev,
      {
        sender: 'parent',
        text: parentText,
        time: timeStr,
      },
    ]);
    setManualInput('');

    try {
      setIsAiSpeaking(true);
      const response = await parentAlertService.sendVoiceTurn(
        callSession.id,
        callState,
        parentText,
        selectedLanguage
      );

      if (response.aiEngine) {
        setActiveEngine(response.aiEngine);
      }

      setTranscriptMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine: response.aiEngine,
        },
      ]);

      setCallState(response.nextState);
      speakAiText(response.replyText);

      if (response.completed) {
        setWrapUpStatus('COMPLETED');
        setWrapUpOutcome(response.followUpRequested ? 'CONSULTATION_REQUESTED' : 'COMPLETED');
        setWrapUpFollowUpRequired(response.followUpRequested);
        setTimeout(() => {
          stopSpeechRecognition();
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          setShowWrapUpModal(true);
        }, 3500);
      }
    } catch (err) {
      console.error('Error handling voice turn:', err);
      setTranscriptMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: 'Simulation response delay or connection interrupted. Please try again.',
          time: timeStr,
        },
      ]);
      setIsAiSpeaking(false);
    }
  };

  // Trigger End Call & open outcome wrap-up dialog
  const handleInitiateEndCall = () => {
    stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setIsMicListening(false);
    setShowWrapUpModal(true);
  };

  // Submit Call Outcome to Backend
  const handleSaveCallOutcome = async () => {
    if (!callSession) return;
    try {
      setSavingOutcome(true);
      await parentAlertService.endVoiceSession(callSession.id, {
        status: wrapUpStatus,
        reason: wrapUpNotes || `Session concluded with status: ${wrapUpStatus}`,
        outcome: wrapUpOutcome,
        followUpRequested: wrapUpFollowUpRequired,
        followUpDate: wrapUpFollowUpRequired ? wrapUpFollowUpDate : null,
        followUpNotes: wrapUpNotes,
      });

      setActionSuccess(`Call session #${callSession.id} saved to database successfully.`);
      setShowWrapUpModal(false);
      setShowCallStudio(false);
      setCallSession(null);
      await loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving call outcome:', err);
      alert('Error saving session outcome: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingOutcome(false);
    }
  };

  // Resolve follow-up request
  const handleResolveFollowUp = async () => {
    if (!resolveFollowUpModal) return;
    try {
      await parentAlertService.resolveFollowUp(resolveFollowUpModal.id, resolveNotes);
      setActionSuccess('Follow-up marked as resolved.');
      setResolveFollowUpModal(null);
      setResolveNotes('');
      await loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Error resolving follow-up: ' + (err.response?.data?.error || err.message));
    }
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec) => {
    if (!sec && sec !== 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered lists
  const filteredAlerts = alerts.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      a.studentName?.toLowerCase().includes(q) ||
      String(a.studentId).includes(q) ||
      a.courseName?.toLowerCase().includes(q) ||
      a.guardianName?.toLowerCase().includes(q);

    const matchesCourse = !selectedCourseFilter || String(a.courseId) === String(selectedCourseFilter);
    const matchesRisk = selectedRiskFilter === 'ALL' || a.riskLevel === selectedRiskFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'PENDING' && a.status === 'ELIGIBLE') ||
      a.status === selectedStatusFilter;

    return matchesSearch && matchesCourse && matchesRisk && matchesStatus;
  });

  const filteredHistory = history.filter((h) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      h.studentName?.toLowerCase().includes(q) ||
      String(h.studentId).includes(q) ||
      h.guardianName?.toLowerCase().includes(q) ||
      h.status?.toLowerCase().includes(q);

    const matchesStatus = selectedStatusFilter === 'ALL' || h.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Quick replies
  const quickReplies = [
    { label: 'Yes, speaking (Parent)', text: 'Yes, speaking, this is their parent.' },
    { label: 'Sure, tell me', text: 'Yes, I have a moment. Please share the summary.' },
    { label: 'Why is attendance low?', text: 'Why is attendance low and what is missing?' },
    { label: 'Yes, arrange teacher meeting', text: 'Yes please, arrange a meeting with their teacher.' },
    { label: 'Busy, call later', text: 'I am currently busy at work. Please call back later.' },
    { label: 'Opt out / Stop calls', text: 'Please stop calling and opt me out of automated alerts.' },
    { label: 'Wrong number', text: 'No, this is the wrong number.' },
  ];

  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      <PageHeader
        title="Student Academic Risk Alerts & Parent Notifications"
        subtitle="Institutional risk registry: monitor academic alerts, review verified indicators, and coordinate guardian notifications."
      />

      {/* Hub Notice Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          border: '1px solid var(--primary-border)',
          borderRadius: '12px',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <span>Verified Student Risk Oversight</span>
              <span
                style={{
                  background: 'var(--primary-soft)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--primary)',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontWeight: 650,
                }}
              >
                Canonical Records
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
              Identifies students requiring academic attention based on verified course attendance (&lt; 75%) and evaluation marks (&lt; 40%).
              For conversational queries and study planning, consult the <strong>Academic Assistant</strong>.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
          >
            <Sliders size={15} />
            Configurable Thresholds
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadData}
            title="Refresh Cohort Data"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.15rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {/* Configurable Risk Thresholds Drawer / Panel */}
      {showConfigDrawer && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
              <Sliders size={18} />
              <span>Configurable Student Attention & Risk Thresholds</span>
            </div>
            <button
              onClick={() => setShowConfigDrawer(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666' }}
            >
              <X size={18} />
            </button>
          </div>
          <form
            onSubmit={handleSaveThresholds}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Attendance Alert Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                step="1"
                className="input-field"
                value={riskConfig.attendanceThreshold}
                onChange={(e) => setRiskConfig({ ...riskConfig, attendanceThreshold: parseFloat(e.target.value) || 75 })}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flag students below this attendance %</span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Assessment Marks Threshold (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                step="1"
                className="input-field"
                value={riskConfig.marksThreshold}
                onChange={(e) => setRiskConfig({ ...riskConfig, marksThreshold: parseFloat(e.target.value) || 40 })}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flag students below this marks %</span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Missing Assignments Threshold
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="1"
                className="input-field"
                value={riskConfig.missingAssignmentsThreshold}
                onChange={(e) =>
                  setRiskConfig({ ...riskConfig, missingAssignmentsThreshold: parseInt(e.target.value) || 0 })
                }
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flag if missing &gt;= this count</span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Default Language
              </label>
              <select
                className="input-field"
                value={riskConfig.preferredLanguage}
                onChange={(e) => setRiskConfig({ ...riskConfig, preferredLanguage: e.target.value })}
              >
                <option value="en-IN">English (India, en-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="te-IN">Telugu (te-IN)</option>
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Default prompt spoken voice</span>
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingConfig}
                style={{ width: '100%', padding: '0.65rem' }}
              >
                {savingConfig ? 'Applying...' : 'Apply & Re-Scan Cohort'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          icon={AlertTriangle}
          label="Requiring Attention"
          value={stats?.totalStudentsRequiringAttention ?? alerts.length}
          trend={`Threshold: <${riskConfig.attendanceThreshold}% att / <${riskConfig.marksThreshold}% marks`}
        />
        <StatCard
          icon={Calendar}
          label="Low Attendance"
          value={stats?.studentsLowAttendance ?? alerts.filter((a) => a.attendancePercent < riskConfig.attendanceThreshold).length}
          trend={`Below ${riskConfig.attendanceThreshold}% required`}
        />
        <StatCard
          icon={FileText}
          label="Low Marks"
          value={stats?.studentsLowMarks ?? alerts.filter((a) => a.gradeAverage < riskConfig.marksThreshold).length}
          trend={`Below ${riskConfig.marksThreshold}% required`}
        />
        <StatCard
          icon={PhoneCall}
          label="Calls Completed"
          value={stats?.callsCompleted ?? history.filter((h) => h.status === 'COMPLETED').length}
          trend="Simulated voice sessions"
        />
        <StatCard
          icon={PhoneOff}
          label="Unanswered / Interrupted"
          value={(stats?.callsUnanswered || 0) + (stats?.callsInterrupted || 0)}
          trend="Requires retry or follow-up"
        />
        <StatCard
          icon={PhoneForwarded}
          label="Follow-Ups Required"
          value={stats?.followUpsRequired ?? followups.length}
          trend="Teacher consultation booked"
        />
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.25rem',
          gap: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'alerts', label: 'Students Requiring Attention', icon: AlertTriangle, count: filteredAlerts.length },
          { id: 'history', label: 'Call & Session History', icon: PhoneCall, count: filteredHistory.length },
          { id: 'followups', label: 'Follow-Up Management', icon: PhoneForwarded, count: followups.length },
          { id: 'contacts', label: 'Guardian Information', icon: Users, count: contacts.length },
          { id: 'setup', label: 'Local AI & Audio Setup', icon: Cpu, count: aiStatus?.ollamaAvailable ? 'Ollama Online' : 'Local Fallback' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '3px solid var(--primary, #111111)' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-main, #111111)' : 'var(--text-muted, #666666)',
                cursor: 'pointer',
                fontSize: '0.88rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    background: isActive ? '#111111' : '#eeeeee',
                    color: isActive ? '#ffffff' : '#444444',
                    fontWeight: 600,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Filter & Search Bar */}
      {(activeTab === 'alerts' || activeTab === 'history') && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '380px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999999' }}
            />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.4rem', width: '100%' }}
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {activeTab === 'alerts' && (
              <>
                <select
                  className="input-field"
                  style={{ width: 'auto', minWidth: '150px' }}
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                >
                  <option value="">All Courses / Classes</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  className="input-field"
                  style={{ width: 'auto', minWidth: '130px' }}
                  value={selectedRiskFilter}
                  onChange={(e) => setSelectedRiskFilter(e.target.value)}
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </>
            )}

            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '140px' }}
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="ALL">All Call Statuses</option>
              {activeTab === 'alerts' ? (
                <>
                  <option value="ELIGIBLE">Pending Call</option>
                  <option value="CALL_COMPLETED">Called / Completed</option>
                  <option value="UNANSWERED">Unanswered</option>
                  <option value="ATTENTION_REQUIRED">Interrupted / Failed</option>
                </>
              ) : (
                <>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="UNANSWERED">UNANSWERED</option>
                  <option value="INTERRUPTED">INTERRUPTED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="OPTED_OUT">OPTED_OUT</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: FLAGGED STUDENTS REQUIRING ATTENTION */}
      {activeTab === 'alerts' && (
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : filteredAlerts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1rem',
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              <CheckCircle size={44} style={{ color: '#16a34a', margin: '0 auto 1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0' }}>No Flagged Students Found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                All enrolled students are currently performing within configured thresholds (Attendance &gt;={riskConfig.attendanceThreshold}%, Marks &gt;={riskConfig.marksThreshold}%).
              </p>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Student & ID</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Course / Subject</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Attendance & Marks</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Why Flagged</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Guardian Contact</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => {
                    const isHigh = alert.riskLevel === 'HIGH';
                    const isMed = alert.riskLevel === 'MEDIUM';
                    const isOptedOut = alert.consentStatus === 'OPTED_OUT';

                    return (
                      <tr key={alert.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{alert.studentName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ID #{alert.studentId} • {alert.studentEmail || 'student@example.edu'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{alert.courseName || 'General Academic'}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Code: C-{alert.courseId}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background:
                                  alert.attendancePercent !== null && alert.attendancePercent < riskConfig.attendanceThreshold
                                    ? '#fee2e2'
                                    : '#f3f4f6',
                                color:
                                  alert.attendancePercent !== null && alert.attendancePercent < riskConfig.attendanceThreshold
                                    ? '#b91c1c'
                                    : '#374151',
                              }}
                            >
                              Att: {alert.attendancePercent !== null ? `${alert.attendancePercent}%` : 'N/A'}
                            </span>
                            <span
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background:
                                  alert.gradeAverage !== null && alert.gradeAverage < riskConfig.marksThreshold
                                    ? '#fee2e2'
                                    : '#f3f4f6',
                                color:
                                  alert.gradeAverage !== null && alert.gradeAverage < riskConfig.marksThreshold
                                    ? '#b91c1c'
                                    : '#374151',
                              }}
                            >
                              Marks: {alert.gradeAverage !== null ? `${alert.gradeAverage}%` : 'N/A'}
                            </span>
                          </div>
                          {alert.missingAssignments > 0 && (
                            <div style={{ fontSize: '0.74rem', color: '#b91c1c', fontWeight: 600 }}>
                              {alert.missingAssignments} missing assignment(s)
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isHigh ? '#111111' : isMed ? '#4b5563' : '#e5e7eb',
                              color: isHigh || isMed ? '#ffffff' : '#111111',
                              marginBottom: '0.35rem',
                            }}
                          >
                            {alert.riskLevel} PRIORITY
                          </span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {alert.riskFactors || 'Identified for academic advisory review'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.guardianName || 'Guardian Profile'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {alert.guardianPhone || '+91 98000 00000'}
                          </div>
                          <div style={{ marginTop: '0.2rem' }}>
                            {isOptedOut ? (
                              <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700 }}>OPTED OUT</span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600 }}>Consent Verified</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                              onClick={() => handleOpenCallPrep(alert.studentId, alert)}
                              title="Inspect full academic breakdown & review call"
                            >
                              <FileText size={13} style={{ marginRight: '0.25rem' }} /> Details & Prep
                            </button>
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                              onClick={() => handleOpenCallPrep(alert.studentId, alert)}
                              disabled={isOptedOut}
                              title={isOptedOut ? 'Parent opted out' : 'Prepare and launch simulated voice call'}
                            >
                              <PhoneCall size={13} style={{ marginRight: '0.25rem' }} /> Simulate Call
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CALL & SESSION HISTORY */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : filteredHistory.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              <PhoneCall size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
              <h3>No Call History Records</h3>
              <p style={{ color: 'var(--text-muted)' }}>Completed simulated voice sessions will be permanently stored here.</p>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Session SID & Date</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Student & Guardian</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Staff Initiator</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Duration</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Session Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Follow-Up Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Transcript</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    const st = item.status?.toUpperCase() || 'COMPLETED';
                    const isCompleted = st === 'COMPLETED';
                    const isUnanswered = st === 'UNANSWERED' || st === 'NO_ANSWER' || st === 'BUSY';
                    const isInterrupted = st === 'INTERRUPTED' || st === 'FAILED';

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                            {item.providerCallSid || `SIM-SID-${item.id}`}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {item.initiatedAt ? new Date(item.initiatedAt).toLocaleString() : 'Recent'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700 }}>{item.studentName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {item.guardianName} ({item.relationship || 'Guardian'})
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                          <div>{item.initiatedBy || 'Staff'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated Mode</div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                          {formatSeconds(item.durationSeconds || 0)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isCompleted ? '#ecfdf5' : isUnanswered ? '#fef3c7' : isInterrupted ? '#fee2e2' : '#f3f4f6',
                              color: isCompleted ? '#166534' : isUnanswered ? '#b45309' : isInterrupted ? '#b91c1c' : '#374151',
                              border: `1px solid ${isCompleted ? '#bbf7d0' : isUnanswered ? '#fde68a' : '#fecaca'}`,
                            }}
                          >
                            {st}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {item.followUpRequested ? (
                            <div>
                              <span
                                style={{
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                }}
                              >
                                Meeting Requested
                              </span>
                              {item.followUpDate && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                  Due: {item.followUpDate}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None Required</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                            onClick={() => setShowTranscriptModal(item)}
                          >
                            <FileText size={13} style={{ marginRight: '0.25rem' }} /> Full Transcript
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FOLLOW-UP MANAGEMENT */}
      {activeTab === 'followups' && (
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : followups.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              <CheckCircle size={40} style={{ color: '#16a34a', margin: '0 auto 1rem' }} />
              <h3>All Follow-Ups Clear</h3>
              <p style={{ color: 'var(--text-muted)' }}>No pending parent consultations or meeting requests requiring action.</p>
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Student Name</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Guardian & Phone</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Scheduled Date</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Outcome & Discussion Notes</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {followups.map((f) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700 }}>{f.studentName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Student ID #{f.studentId}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{f.guardianName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.phoneNumber}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
                        {f.followUpDate || 'Pending scheduling'}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                          Outcome: {f.outcome || 'Teacher consultation requested'}
                        </div>
                        {f.followUpNotes || f.callSummary || 'Guardian requested faculty follow-up.'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                          onClick={() => {
                            setResolveFollowUpModal(f);
                            setResolveNotes('');
                          }}
                        >
                          <Check size={13} style={{ marginRight: '0.25rem' }} /> Mark Resolved
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GUARDIAN CONTACTS */}
      {activeTab === 'contacts' && (
        <div
          className="table-responsive"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Student ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Guardian Name</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Relationship</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Phone Number</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Preferred Language</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Consent Status</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>#{c.studentId}</td>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{c.guardianName}</td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>{c.relationship}</td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>{c.phoneNumber}</td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>{c.preferredLanguage || 'en-IN'}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: c.consentStatus === 'OPTED_OUT' ? '#fee2e2' : '#ecfdf5',
                        color: c.consentStatus === 'OPTED_OUT' ? '#b91c1c' : '#166534',
                      }}
                    >
                      {c.consentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => setShowContactModal(c)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: LOCAL AI & VOICE SETUP GUIDE */}
      {activeTab === 'setup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {/* Status Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Cpu size={22} />
                <h3 style={{ margin: 0 }}>Local AI Engine Status & Diagnostics</h3>
              </div>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  background: aiStatus?.ollamaAvailable ? '#dcfce7' : '#fef3c7',
                  color: aiStatus?.ollamaAvailable ? '#166534' : '#b45309',
                  border: `1px solid ${aiStatus?.ollamaAvailable ? '#86efac' : '#fde68a'}`,
                }}
              >
                {aiStatus?.ollamaAvailable ? 'Ollama Online' : 'Local Rule Engine Fallback Active'}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
              {aiStatus?.statusMessage ||
                'Probing local Ollama service at http://localhost:11434. The system is designed to run zero-cost local inference without external API charges.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                background: 'var(--surface-muted)',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <strong>Ollama Endpoint:</strong> {aiStatus?.endpoint || 'http://localhost:11434'}
              </div>
              <div>
                <strong>Active Model:</strong> {aiStatus?.activeModel || 'llama3'}
              </div>
              <div>
                <strong>Available Models:</strong>{' '}
                {aiStatus?.availableModels?.length ? aiStatus.availableModels.join(', ') : 'None detected locally'}
              </div>
              <div>
                <strong>Speech Recognition:</strong>{' '}
                {speechSupported ? 'Browser Web Speech API (Ready)' : 'Text Fallback Mode'}
              </div>
              <div>
                <strong>Speech Synthesis:</strong>{' '}
                {'speechSynthesis' in window ? 'Web Audio Voices (Ready)' : 'Text Only'}
              </div>
              <div>
                <strong>Cost Per Call:</strong> ₹0.00 (Zero-Cost Local Execution)
              </div>
            </div>
          </div>

          {/* Quick Setup Guide for Windows */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} /> How to Run Local AI on Windows
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1rem 0' }}>
              To enable local language model responses during simulated parent calls, install and run Ollama locally:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#111111', color: '#f5f5f5', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <div style={{ color: '#888888', marginBottom: '0.25rem' }}># Step 1: Install Ollama (via Windows winget or download from ollama.com)</div>
                <div>winget install Ollama.Ollama</div>
                <div style={{ color: '#888888', margin: '0.75rem 0 0.25rem 0' }}># Step 2: Download and start a compact local model (e.g. Llama 3 or Phi 3)</div>
                <div>ollama run llama3</div>
                <div style={{ color: '#888888', margin: '0.75rem 0 0.25rem 0' }}># Or a lightweight model for lower-spec PCs:</div>
                <div>ollama run phi3</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Zero-Cost Architecture Transparency</strong>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>All speech synthesis and voice recognition run directly in your browser with zero latency and zero cost.</li>
                  <li>If Ollama is not installed or turned off, the built-in institutional rule engine generates verified responses automatically.</li>
                  <li>Simulated browser voice sessions use your computer microphone and speakers and never place cellular or landline calls.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STUDENT ACADEMIC SUMMARY & CALL PREP */}
      {showPrepModal && (
        <Modal
          isOpen={showPrepModal}
          onClose={() => setShowPrepModal(false)}
          title={`Call Preparation & Student Details: ${studentSummary?.studentName || 'Student'}`}
        >
          {prepLoading || !studentSummary ? (
            <LoadingSpinner />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Overall Snapshot Card */}
              <div
                style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Name</div>
                  <div style={{ fontWeight: 700 }}>{studentSummary.studentName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student ID</div>
                  <div style={{ fontWeight: 700 }}>#{studentSummary.studentId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Attendance</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color:
                        studentSummary.overallAttendancePercent !== null &&
                        studentSummary.overallAttendancePercent < riskConfig.attendanceThreshold
                          ? '#b91c1c'
                          : 'var(--text-main)',
                    }}
                  >
                    {studentSummary.overallAttendancePercent !== null ? `${studentSummary.overallAttendancePercent}%` : 'No Records'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Marks Avg</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color:
                        studentSummary.overallMarksAverage !== null &&
                        studentSummary.overallMarksAverage < riskConfig.marksThreshold
                          ? '#b91c1c'
                          : 'var(--text-main)',
                    }}
                  >
                    {studentSummary.overallMarksAverage !== null ? `${studentSummary.overallMarksAverage}%` : 'No Records'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Classification</div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#111111',
                      color: '#ffffff',
                    }}
                  >
                    {studentSummary.riskLevel} PRIORITY
                  </span>
                </div>
              </div>

              {/* Incomplete Data Warning */}
              {studentSummary.hasIncompleteData && (
                <div
                  style={{
                    background: '#fefce8',
                    border: '1px solid #fef08a',
                    color: '#854d0e',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>
                    <strong>Fairness Notice:</strong> {studentSummary.incompleteDataNotice}. Student is not penalized for missing logs.
                  </span>
                </div>
              )}

              {/* Course Breakdown Table */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Enrolled Courses Breakdown</h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Course</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Teacher</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Attendance</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Assessment Avg</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentSummary.courses?.map((c) => (
                        <tr key={c.courseId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>{c.courseName}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>{c.teacherName}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: c.lowAttendance ? '#b91c1c' : 'inherit', fontWeight: c.lowAttendance ? 700 : 400 }}>
                            {c.attendancePercent !== null ? `${c.attendancePercent}%` : '--'}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: c.lowMarks ? '#b91c1c' : 'inherit', fontWeight: c.lowMarks ? 700 : 400 }}>
                            {c.marksAverage !== null ? `${c.marksAverage}%` : '--'}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>{c.letterGrade || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guardian Info Card */}
              <div
                style={{
                  background: studentSummary.isTestGuardianProfile ? '#f8fafc' : '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.9rem 1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem' }}>Guardian Information</h4>
                  {studentSummary.isTestGuardianProfile && (
                    <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      Simulated Profile (No DB Contact Found)
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div>
                    <strong>Name:</strong> {studentSummary.guardian?.guardianName}
                  </div>
                  <div>
                    <strong>Relationship:</strong> {studentSummary.guardian?.relationship}
                  </div>
                  <div>
                    <strong>Phone:</strong> {studentSummary.guardian?.phoneNumber}
                  </div>
                  <div>
                    <strong>Consent:</strong>{' '}
                    <span style={{ color: studentSummary.guardian?.consentStatus === 'OPTED_OUT' ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
                      {studentSummary.guardian?.consentStatus || 'CONSENTED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Selection & Script Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Select Spoken Language for this Call:
                  </label>
                  <select
                    className="input-field"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="en-IN">English (India, en-IN)</option>
                    <option value="hi-IN">Hindi (hi-IN)</option>
                    <option value="te-IN">Telugu (te-IN)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Proposed Conversation Opening & Facts (Preview):
                  </label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    style={{ fontSize: '0.82rem', lineHeight: 1.4 }}
                  />
                </div>
              </div>

              {/* Simulation Notice Disclaimer */}
              <div
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.78rem',
                  color: '#334155',
                }}
              >
                <strong>Simulated Session Confirmation:</strong> This session runs inside your web browser using your computer's microphone and speakers. It does NOT make an outbound cellular call.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPrepModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLaunchSimulation}
                  disabled={studentSummary.guardian?.consentStatus === 'OPTED_OUT'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <PhoneCall size={16} /> Confirm & Start Voice Session
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* MODAL 2: INTERACTIVE SIMULATED VOICE STUDIO */}
      {showCallStudio && (
        <Modal
          isOpen={showCallStudio}
          onClose={handleInitiateEndCall}
          title={`Simulated Voice Session — ${callSession?.studentName || 'Student'}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Caller Status Bar */}
            <div
              style={{
                background: 'linear-gradient(135deg, #111111 0%, #1f2937 100%)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  className={isAiSpeaking || isMicListening ? 'voice-ripple-active' : ''}
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#111111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isMicListening ? <Mic size={26} color="#ef4444" /> : <PhoneCall size={26} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {callSession?.guardianName || 'Guardian'} ({callSession?.relationship || 'Parent'})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
                    Student: {callSession?.studentName} • Lang: {selectedLanguage}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                    Engine: {activeEngine}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  {formatSeconds(callDuration)}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                  {isAiSpeaking && (
                    <span style={{ fontSize: '0.72rem', background: '#3b82f6', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      AI Speaking
                    </span>
                  )}
                  {isMicListening && (
                    <span style={{ fontSize: '0.72rem', background: '#ef4444', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                      Mic Listening
                    </span>
                  )}
                  {!isAiSpeaking && !isMicListening && (
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Wave Visualizer Animation */}
            {(isAiSpeaking || isMicListening) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  height: '34px',
                  background: 'var(--surface-muted)',
                  borderRadius: '8px',
                  padding: '0 1rem',
                }}
              >
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                  {isAiSpeaking ? 'Playing voice audio...' : 'Listening to microphone...'}
                </span>
                {[0.1, 0.3, 0.5, 0.2, 0.6, 0.4, 0.7, 0.3, 0.5, 0.2].map((delay, idx) => (
                  <div
                    key={idx}
                    className="voice-wave-bar"
                    style={{ animationDelay: `${delay}s`, background: isMicListening ? '#ef4444' : '#111111' }}
                  />
                ))}
              </div>
            )}

            {/* Live Conversation Transcript Box */}
            <div
              style={{
                height: '240px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#fafafa',
              }}
            >
              {transcriptMessages.map((msg, i) => {
                const isSystem = msg.sender === 'system';
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isSystem ? 'center' : isAi ? 'flex-start' : 'flex-end',
                      maxWidth: isSystem ? '90%' : '80%',
                    }}
                  >
                    {isSystem ? (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center', background: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                        {msg.text}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: isAi ? '#ffffff' : '#111111',
                          color: isAi ? '#111111' : '#ffffff',
                          border: isAi ? '1px solid #e5e7eb' : 'none',
                          borderRadius: isAi ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                          padding: '0.6rem 0.85rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.7rem', color: isAi ? '#6b7280' : '#d1d5db', marginBottom: '0.2rem' }}>
                          <strong>{isAi ? 'AI Support Assistant' : 'Parent / Guardian'}</strong>
                          <span>{msg.time}</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{msg.text}</div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>

            {/* Quick-Response Helper Chips */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Quick Responses (or speak into your microphone):
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '0.25rem 0.55rem', borderRadius: '999px' }}
                    onClick={() => handleParentMessage(qr.text)}
                    disabled={isAiSpeaking}
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Text Input Fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleParentMessage(manualInput);
              }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                className="input-field"
                placeholder="Type response as parent (or use microphone above)..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                disabled={isAiSpeaking}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!manualInput.trim() || isAiSpeaking}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Send size={15} /> Send
              </button>
            </form>

            {/* Session Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => setVoiceMuted(!voiceMuted)}
                >
                  {voiceMuted ? <VolumeX size={15} color="#ef4444" /> : <Volume2 size={15} />}
                  <span style={{ marginLeft: '0.35rem' }}>{voiceMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => {
                    if (isMicListening) {
                      stopSpeechRecognition();
                      setMicMuted(true);
                    } else {
                      setMicMuted(false);
                      startSpeechRecognition();
                    }
                  }}
                >
                  {micMuted ? <MicOff size={15} color="#ef4444" /> : <Mic size={15} />}
                  <span style={{ marginLeft: '0.35rem' }}>{micMuted ? 'Turn On Mic' : 'Mute Mic'}</span>
                </button>
              </div>

              <button
                type="button"
                className="btn btn-danger"
                style={{ background: '#b91c1c', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem' }}
                onClick={handleInitiateEndCall}
              >
                <PhoneOff size={16} /> End Session & Wrap Up
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: CALL WRAP-UP & OUTCOME RECORDING */}
      {showWrapUpModal && (
        <Modal
          isOpen={showWrapUpModal}
          onClose={() => setShowWrapUpModal(false)}
          title="Session Outcome & Follow-Up Wrap-Up"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Verify session details and record the guardian outcome for permanent persistence in the institutional database.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Session Status
              </label>
              <select
                className="input-field"
                value={wrapUpStatus}
                onChange={(e) => setWrapUpStatus(e.target.value)}
              >
                <option value="COMPLETED">COMPLETED (Call finished with parent engagement)</option>
                <option value="UNANSWERED">UNANSWERED (No answer / Busy / Disconnected early)</option>
                <option value="INTERRUPTED">INTERRUPTED (Call dropped or user terminated abruptly)</option>
                <option value="FAILED">FAILED (Technical error or speech failure)</option>
                <option value="OPTED_OUT">OPTED_OUT (Guardian requested opt-out from calls)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Parent Response / Outcome
              </label>
              <select
                className="input-field"
                value={wrapUpOutcome}
                onChange={(e) => setWrapUpOutcome(e.target.value)}
              >
                <option value="CONSULTATION_REQUESTED">Teacher Consultation Requested</option>
                <option value="EXCUSED_ABSENCE">Guardian Clarified Absences / Medical</option>
                <option value="BUSY_CALLBACK_LATER">Guardian Busy - Requested Callback</option>
                <option value="GENERAL_PROGRESS_ACKNOWLEDGED">Progress Acknowledged - No Meeting Needed</option>
                <option value="OPTED_OUT">Opt-Out Registered</option>
                <option value="UNANSWERED">Unanswered / No Voice Captured</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="followUpToggle"
                checked={wrapUpFollowUpRequired}
                onChange={(e) => setWrapUpFollowUpRequired(e.target.checked)}
              />
              <label htmlFor="followUpToggle" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Faculty Follow-Up Required
              </label>
            </div>

            {wrapUpFollowUpRequired && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Scheduled Follow-Up Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={wrapUpFollowUpDate}
                  onChange={(e) => setWrapUpFollowUpDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Staff Notes & Summary
              </label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Enter summary notes regarding parent reaction and next steps..."
                value={wrapUpNotes}
                onChange={(e) => setWrapUpNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowWrapUpModal(false);
                  setShowCallStudio(false);
                  setCallSession(null);
                }}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={savingOutcome}
                onClick={handleSaveCallOutcome}
              >
                {savingOutcome ? 'Saving...' : 'Save Session to Database'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: FULL TRANSCRIPT & SESSION DETAILS */}
      {showTranscriptModal && (
        <Modal
          isOpen={!!showTranscriptModal}
          onClose={() => setShowTranscriptModal(null)}
          title={`Session Details: ${showTranscriptModal.providerCallSid || `SIM-${showTranscriptModal.id}`}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.6rem',
                background: 'var(--surface-muted)',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
              }}
            >
              <div>
                <strong>Student:</strong> {showTranscriptModal.studentName}
              </div>
              <div>
                <strong>Guardian:</strong> {showTranscriptModal.guardianName}
              </div>
              <div>
                <strong>Status:</strong> {showTranscriptModal.status}
              </div>
              <div>
                <strong>Duration:</strong> {formatSeconds(showTranscriptModal.durationSeconds || 0)}
              </div>
              <div>
                <strong>Language:</strong> {showTranscriptModal.language || 'en-IN'}
              </div>
              <div>
                <strong>Follow-Up:</strong> {showTranscriptModal.followUpRequested ? 'Yes' : 'No'}
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem' }}>Session Summary</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', background: '#ffffff', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '6px', margin: 0 }}>
                {showTranscriptModal.callSummary || 'No summary text recorded.'}
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem' }}>Full Dialogue Transcript</h4>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {showTranscriptModal.conversationTranscript || 'No transcript text available for this session.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowTranscriptModal(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: RESOLVE FOLLOW-UP */}
      {resolveFollowUpModal && (
        <Modal
          isOpen={!!resolveFollowUpModal}
          onClose={() => setResolveFollowUpModal(null)}
          title={`Resolve Follow-Up for ${resolveFollowUpModal.studentName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Enter resolution notes detailing the outcome of the teacher consultation or faculty advisory meeting.
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Resolution Notes
              </label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="e.g. Conducted counseling session with parent and student. Extra tutorial slots arranged for Lab Batch 1."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setResolveFollowUpModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleResolveFollowUp}>
                Confirm Resolution
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 6: EDIT GUARDIAN CONTACT */}
      {showContactModal && (
        <Modal
          isOpen={!!showContactModal}
          onClose={() => setShowContactModal(null)}
          title={`Edit Guardian Contact (Student #${showContactModal.studentId})`}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await parentAlertService.updateParentContact(showContactModal.id, showContactModal);
                setActionSuccess('Guardian contact updated successfully.');
                setShowContactModal(null);
                loadData();
              } catch (err) {
                alert('Error updating contact: ' + (err.response?.data?.error || err.message));
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Guardian Name
              </label>
              <input
                type="text"
                className="input-field"
                value={showContactModal.guardianName || ''}
                onChange={(e) => setShowContactModal({ ...showContactModal, guardianName: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Relationship
              </label>
              <select
                className="input-field"
                value={showContactModal.relationship || 'GUARDIAN'}
                onChange={(e) => setShowContactModal({ ...showContactModal, relationship: e.target.value })}
              >
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="GUARDIAN">Guardian</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                className="input-field"
                value={showContactModal.phoneNumber || ''}
                onChange={(e) => setShowContactModal({ ...showContactModal, phoneNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Preferred Language
              </label>
              <select
                className="input-field"
                value={showContactModal.preferredLanguage || 'en-IN'}
                onChange={(e) => setShowContactModal({ ...showContactModal, preferredLanguage: e.target.value })}
              >
                <option value="en-IN">English (India, en-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="te-IN">Telugu (te-IN)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Consent Status
              </label>
              <select
                className="input-field"
                value={showContactModal.consentStatus || 'CONSENTED'}
                onChange={(e) => setShowContactModal({ ...showContactModal, consentStatus: e.target.value })}
              >
                <option value="CONSENTED">CONSENTED (Permitted for calls)</option>
                <option value="OPTED_OUT">OPTED_OUT (Do Not Call)</option>
                <option value="PENDING">PENDING (Awaiting confirmation)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowContactModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Contact
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ParentVoiceAlerts;
