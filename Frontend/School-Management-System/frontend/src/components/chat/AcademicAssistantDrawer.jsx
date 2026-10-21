import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import chatbotService from '../../services/chatbotService';
import { useAuth } from '../../hooks/useAuth';
import MarkdownMessage from './MarkdownMessage';

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

const STUDENT_SUGGESTIONS = [
  'What is my current attendance?',
  'Which assignments are pending?',
  'Explain my academic performance',
  'How can I improve my attendance?',
  'Help me create a study plan',
  'How can I book a consultation with my teacher?',
];

const TEACHER_SUGGESTIONS = [
  'Summarize my class attendance',
  'Show students below the 75% attendance threshold',
  'Which assignments need evaluation?',
  'Show pending consultation requests',
  'Summarize class performance',
];

const ADMIN_SUGGESTIONS = [
  'Summarize institutional attendance',
  'Show institutional academic risk statistics',
  'Summarize course performance',
  'Explain the available institutional reports',
];

const AcademicAssistantDrawer = ({ isOpen, onClose, initialPrompt = '' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role?.replace('ROLE_', '').toUpperCase() || 'STUDENT';

  // Load suggested questions and initial welcome message
  useEffect(() => {
    let isMounted = true;
    const defaultSuggestions =
      role === 'STUDENT'
        ? STUDENT_SUGGESTIONS
        : role === 'TEACHER'
        ? TEACHER_SUGGESTIONS
        : ADMIN_SUGGESTIONS;

    setSuggestions(defaultSuggestions);

    const fetchSuggestions = async () => {
      try {
        const data = await chatbotService.getSuggestions();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
        }
      } catch (err) {
        // Fallback to role suggestions
        if (isMounted) setSuggestions(defaultSuggestions);
      }
    };

    fetchSuggestions();

    // Set initial welcome greeting
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ASSISTANT',
        text: `Hello **${user?.firstName || user?.username || 'there'}**! I am your **DAPMIAS Academic Assistant**.\n\nI can retrieve your live attendance statistics, check upcoming assignment deadlines, review continuous assessment performance, and guide you through faculty consultation booking.\n\nAsk a question below or choose from the suggested prompts to get started.`,
        verifiedRecord: true,
        timestamp: new Date().toISOString(),
      },
    ]);

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle incoming initial prompt trigger
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Scroll to bottom on new message or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setError(null);
    setLastFailedMessage(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage(text, sessionId);
      if (response && response.message) {
        setMessages((prev) => [...prev, response.message]);
        if (response.suggestions && Array.isArray(response.suggestions) && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
        }
      } else {
        throw new Error('Received unexpected empty response from Assistant.');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to connect to the Academic Assistant service. Please try again.';
      setError(errMsg);
      setLastFailedMessage(text);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSend(lastFailedMessage);
    } else if (messages.length > 0) {
      const lastUser = [...messages].reverse().find((m) => m.sender === 'USER');
      if (lastUser) {
        handleSend(lastUser.text);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = async () => {
    try {
      await chatbotService.resetSession(sessionId);
    } catch (err) {
      // Ignored
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ASSISTANT',
        text: 'New session started. How can I assist you with your academics today?',
        verifiedRecord: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    setError(null);
    setLastFailedMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="chat-drawer-container"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className={`chat-panel-window ${expanded ? 'expanded' : ''}`}
        style={{
          width: expanded ? 'min(760px, 94vw)' : 'min(460px, 94vw)',
          height: expanded ? 'min(780px, 88vh)' : 'min(620px, 80vh)',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.18)',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '0.85rem 1.15rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'grid',
                placeItems: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Bot size={19} />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block', fontWeight: 700 }}>
                Academic Assistant
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {role} Context • Verified Academic Intelligence
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              type="button"
              style={{
                width: 30,
                height: 30,
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                display: 'grid',
                placeItems: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={handleResetChat}
              title="New Conversation"
              aria-label="New Conversation"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              style={{
                width: 30,
                height: 30,
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                display: 'grid',
                placeItems: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Minimize Panel' : 'Expand Panel'}
              aria-label={expanded ? 'Minimize Panel' : 'Expand Panel'}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              style={{
                width: 30,
                height: 30,
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                display: 'grid',
                placeItems: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={onClose}
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Message Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map((m) => {
            const isUser = m.sender === 'USER';
            return (
              <div
                key={m.id || Math.random()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                }}
              >
                <div
                  style={{
                    maxWidth: isUser ? '85%' : '92%',
                    backgroundColor: isUser ? '#2563eb' : '#ffffff',
                    color: isUser ? '#ffffff' : '#0f172a',
                    padding: '0.85rem 1.15rem',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    boxShadow: isUser
                      ? '0 2px 8px rgba(37, 99, 235, 0.25)'
                      : '0 2px 6px rgba(15, 23, 42, 0.04)',
                    fontSize: '0.925rem',
                    lineHeight: 1.55,
                    wordBreak: 'break-word',
                  }}
                >
                  {!isUser && m.verifiedRecord && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        marginBottom: '0.55rem',
                      }}
                    >
                      <ShieldCheck size={12} />
                      <span>Verified Academic Database Record</span>
                    </div>
                  )}

                  <MarkdownMessage content={m.text} />

                  {m.evidenceItems && m.evidenceItems.length > 0 && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.5rem 0.75rem',
                        background: '#f1f5f9',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.78rem',
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#334155' }}>
                        Extracted Database Records:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#64748b' }}>
                        {m.evidenceItems.map((e, idx) => (
                          <li key={idx} style={{ marginBottom: '0.15rem' }}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {m.timestamp && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#94a3b8',
                      marginTop: '0.25rem',
                      padding: '0 0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <Clock size={10} />
                    {formatTime(m.timestamp)}
                  </span>
                )}
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0.85rem 1.15rem',
                borderRadius: '16px 16px 16px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#64748b',
                fontSize: '0.88rem',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid #cbd5e1',
                  borderTopColor: '#2563eb',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Consulting verified academic records...</span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={handleRetry}
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {suggestions && suggestions.length > 0 && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              scrollbarWidth: 'none',
            }}
          >
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.15s ease',
                  opacity: loading ? 0.6 : 1,
                  flexShrink: 0,
                }}
                onClick={() => handleSend(s)}
                disabled={loading}
              >
                <Sparkles size={11} />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Footer */}
        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              style={{
                flex: 1,
                minHeight: '42px',
                maxHeight: '120px',
                resize: 'none',
                padding: '0.6rem 0.85rem',
                fontSize: '0.92rem',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                lineHeight: 1.5,
              }}
              placeholder="Ask attendance, assignments, performance, study plans..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                minHeight: '42px',
                padding: '0 1rem',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !inputValue.trim() ? 0.6 : 1,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                transition: 'background-color 0.15s ease',
              }}
              disabled={loading || !inputValue.trim()}
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
          <div
            style={{
              marginTop: '0.4rem',
              textAlign: 'center',
              fontSize: '0.72rem',
              color: '#64748b',
            }}
          >
            <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line • Grounded in institutional database records
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicAssistantDrawer;
