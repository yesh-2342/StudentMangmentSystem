import api from './api';

const parentAlertService = {
  // 1. Dashboard Statistics & Overview
  getDashboardStats: async () => {
    try {
      const res = await api.get('/api/parent-calling/dashboard-stats');
      return res.data;
    } catch (err) {
      // Fallback for compatibility
      const alerts = await api.get('/api/admin/academic-alerts');
      const history = await api.get('/api/admin/call-history');
      const followups = await api.get('/api/admin/call-followups');
      return {
        totalStudentsRequiringAttention: alerts.data?.length || 0,
        studentsLowAttendance: alerts.data?.filter((a) => a.attendancePercent < 75).length || 0,
        studentsLowMarks: alerts.data?.filter((a) => a.gradeAverage < 40).length || 0,
        callsCompleted: history.data?.filter((h) => h.status === 'COMPLETED').length || 0,
        callsUnanswered: history.data?.filter((h) => ['UNANSWERED', 'NO_ANSWER', 'BUSY'].includes(h.status)).length || 0,
        callsInterrupted: history.data?.filter((h) => ['INTERRUPTED', 'FAILED'].includes(h.status)).length || 0,
        followUpsRequired: followups.data?.length || 0,
        recentActivity: history.data?.slice(0, 10) || [],
        activeThresholds: { attendanceThreshold: 75, marksThreshold: 40, missingAssignmentsThreshold: 1 },
        aiStatus: { ollamaAvailable: false, localRuleEngineAvailable: true },
      };
    }
  },

  // 2. Flagged Students & Risk Identification
  getFlaggedStudents: async (params = {}) => {
    try {
      const res = await api.get('/api/parent-calling/flagged-students', { params });
      return res.data;
    } catch (err) {
      const res = await api.get('/api/admin/academic-alerts');
      return res.data;
    }
  },

  getAcademicAlerts: async () => {
    try {
      const res = await api.get('/api/parent-calling/flagged-students');
      return res.data;
    } catch {
      const res = await api.get('/api/admin/academic-alerts');
      return res.data;
    }
  },

  getAcademicAlertById: async (id) => {
    try {
      const res = await api.get(`/api/admin/academic-alerts/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },

  // 3. Student Academic Summary & Call Preparation
  getStudentAcademicSummary: async (studentId) => {
    const res = await api.get(`/api/parent-calling/students/${studentId}/academic-summary`);
    return res.data;
  },

  // 4. Configurable Risk Rules & Thresholds
  getRiskConfig: async () => {
    try {
      const res = await api.get('/api/parent-calling/risk-config');
      return res.data;
    } catch {
      return { attendanceThreshold: 75, marksThreshold: 40, missingAssignmentsThreshold: 1, preferredLanguage: 'en-IN' };
    }
  },

  updateRiskConfig: async (config) => {
    const res = await api.post('/api/parent-calling/risk-config', config);
    return res.data;
  },

  // 5. Simulated Voice Session Lifecycle
  startSimulatedVoiceSession: async (studentId, alertId = null, language = 'en-IN', academicConcerns = '') => {
    try {
      const res = await api.post('/api/parent-calling/session/start', {
        studentId,
        alertId,
        language,
        academicConcerns,
      });
      return res.data;
    } catch (err) {
      // Fallback to legacy demo endpoint
      const res = await api.post('/api/demo/voice-session', { studentId, alertId });
      return res.data;
    }
  },

  sendVoiceTurn: async (callId, currentState, parentInput, language = 'en-IN') => {
    try {
      const res = await api.post('/api/parent-calling/session/turn', {
        callId,
        currentState,
        parentInput,
        language,
      });
      return res.data;
    } catch (err) {
      const res = await api.post('/api/demo/voice-session/turn', {
        callId,
        currentState,
        parentInput,
        language,
      });
      return res.data;
    }
  },

  endVoiceSession: async (callId, payload = {}) => {
    const body = typeof payload === 'string' ? { reason: payload, status: 'COMPLETED' } : payload;
    try {
      const res = await api.post(`/api/parent-calling/session/${callId}/end`, body);
      return res.data;
    } catch (err) {
      const res = await api.post(`/api/demo/voice-session/${callId}/end`, {
        reason: body.reason || 'Session ended',
      });
      return res.data;
    }
  },

  // 6. Call History & Transcripts
  getCallHistory: async (params = {}) => {
    try {
      const res = await api.get('/api/parent-calling/history', { params });
      return res.data;
    } catch {
      const res = await api.get('/api/admin/call-history');
      return res.data;
    }
  },

  getCallRecordById: async (id) => {
    try {
      const res = await api.get(`/api/parent-calling/history/${id}`);
      return res.data;
    } catch {
      const res = await api.get(`/api/admin/call-history/${id}`);
      return res.data;
    }
  },

  // 7. Follow-Up Management
  getFollowUpRequests: async () => {
    try {
      const res = await api.get('/api/parent-calling/follow-ups');
      return res.data;
    } catch {
      const res = await api.get('/api/admin/call-followups');
      return res.data;
    }
  },

  resolveFollowUp: async (id, notes = '') => {
    const res = await api.put(`/api/parent-calling/follow-ups/${id}/resolve`, { notes });
    return res.data;
  },

  // 8. Guardian Contacts & Preferences
  getParentContacts: async () => {
    const res = await api.get('/api/admin/parent-contacts');
    return res.data;
  },

  updateParentContact: async (id, data) => {
    const res = await api.put(`/api/admin/parent-contacts/${id}`, data);
    return res.data;
  },

  recordOptOut: async (studentId, reason) => {
    const res = await api.post('/api/admin/parent-contacts/opt-out', { studentId, reason });
    return res.data;
  },

  reviewAlert: async (id, recommendedAction) => {
    const res = await api.post(`/api/admin/academic-alerts/${id}/review`, { recommendedAction });
    return res.data;
  },

  dismissAlert: async (id, reason) => {
    const res = await api.post(`/api/admin/academic-alerts/${id}/dismiss`, { reason });
    return res.data;
  },

  // 9. Local AI & Telephony Config
  getAiStatus: async () => {
    try {
      const res = await api.get('/api/parent-calling/ai-status');
      return res.data;
    } catch {
      return { ollamaAvailable: false, localRuleEngineAvailable: true };
    }
  },

  getTelephonyConfig: async () => {
    const res = await api.get('/api/admin/telephony/config');
    return res.data;
  },
};

export default parentAlertService;
