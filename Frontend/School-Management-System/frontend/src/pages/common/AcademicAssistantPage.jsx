import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { Bot, Sparkles, HelpCircle, BookOpen, CalendarCheck, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import AcademicAssistantDrawer from '../../components/chat/AcademicAssistantDrawer';
import { useAuth } from '../../hooks/useAuth';

const AcademicAssistantPage = () => {
  const { user } = useAuth();
  const [activePrompt, setActivePrompt] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);

  const role = user?.role?.replace('ROLE_', '') || 'User';

  const studentFeatures = [
    {
      title: 'Verified Attendance Audit',
      desc: 'Calculate precise attendance percentage across all enrolled classes and check 75% rule compliance.',
      prompt: 'Explain my attendance',
      icon: CalendarCheck,
      color: 'blue',
    },
    {
      title: 'Pending Coursework & Deadlines',
      desc: 'List unfinished assignments, submission due dates, and remaining days for continuous evaluation.',
      prompt: 'What assignments are pending?',
      icon: FileText,
      color: 'green',
    },
    {
      title: 'Academic Progress & CGPA',
      desc: 'Review published internal grades, estimated semester CGPA, and course standing.',
      prompt: 'Explain my academic progress',
      icon: BookOpen,
      color: 'purple',
    },
    {
      title: 'Personalized Study Plan',
      desc: 'Generate a structured study allocation based on your enrolled subjects and upcoming coursework.',
      prompt: 'Help me create a study plan',
      icon: Sparkles,
      color: 'amber',
    },
  ];

  const teacherFeatures = [
    {
      title: 'Class Attendance Oversight',
      desc: 'Summarize cohort attendance averages and flag student records falling below the 75% threshold.',
      prompt: 'Summarize my class attendance',
      icon: CalendarCheck,
      color: 'blue',
    },
    {
      title: 'Pending Evaluations',
      desc: 'Review assignment submissions awaiting marks entry across your assigned course sections.',
      prompt: 'Which assignments need evaluation?',
      icon: FileText,
      color: 'green',
    },
    {
      title: 'Cohort Risk Monitoring',
      desc: 'Inspect early warning flags and trigger personalized academic intervention cases.',
      prompt: 'Suggest academic interventions based on verified records',
      icon: ShieldCheck,
      color: 'rose',
    },
    {
      title: 'Advising & Office Hours',
      desc: 'Check pending student consultation bookings and verify published availability slots.',
      prompt: 'Show pending consultation requests',
      icon: HelpCircle,
      color: 'purple',
    },
  ];

  const adminFeatures = [
    {
      title: 'Campus Attendance Governance',
      desc: 'Extract campus-wide student and faculty attendance metrics for accreditation monitoring.',
      prompt: 'Summarize institutional attendance',
      icon: CalendarCheck,
      color: 'blue',
    },
    {
      title: 'Institutional Risk Summary',
      desc: 'Review authorized high and moderate academic risk alerts across departments.',
      prompt: 'Show authorized institutional risk statistics',
      icon: ShieldCheck,
      color: 'rose',
    },
    {
      title: 'Course Catalog & Workloads',
      desc: 'Audit course enrollment distributions and active faculty assignments.',
      prompt: 'Summarize course performance',
      icon: BookOpen,
      color: 'green',
    },
    {
      title: 'Accreditation Reports',
      desc: 'Explain the available institutional performance, grade distribution, and audit exports.',
      prompt: 'Explain the available institutional reports',
      icon: FileText,
      color: 'purple',
    },
  ];

  const currentFeatures =
    role === 'STUDENT'
      ? studentFeatures
      : role === 'TEACHER'
      ? teacherFeatures
      : adminFeatures;

  const handleLaunchPrompt = (prompt) => {
    setActivePrompt(prompt);
    setDrawerOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="DAPMIAS Academic Assistant"
        subtitle={`Role-aware intelligent assistant powered by verified institutional records for ${role.toLowerCase()} operations.`}
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setDrawerOpen(true)}
          >
            <Bot size={16} /> Open Chat Assistant
          </button>
        }
      />

      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderColor: 'var(--primary-border)',
          marginBottom: '1.75rem',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'grid',
              placeItems: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Bot size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{ margin: '0 0 0.25rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 750 }}>
              Verified Academic Intelligence Assistant
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.45 }}>
              Answers are computed directly against your live course enrollments, attendance registers, internal grades, and institutional records in MySQL.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Capabilities Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
        Recommended Questions for Your Role
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.1rem' }}>
        {currentFeatures.map((f, i) => (
          <div
            key={i}
            className="card card-hover"
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onClick={() => handleLaunchPrompt(f.prompt)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className={`stat-icon-box ${f.color}`} style={{ width: 38, height: 38 }}>
                  <f.icon size={18} />
                </div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{f.title}</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem', lineHeight: 1.45 }}>
                {f.desc}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light)',
                color: 'var(--primary)',
                fontWeight: 650,
                fontSize: '0.82rem',
              }}
            >
              <span>Ask: "{f.prompt}"</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Drawer */}
      <AcademicAssistantDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialPrompt={activePrompt}
      />
    </div>
  );
};

export default AcademicAssistantPage;
