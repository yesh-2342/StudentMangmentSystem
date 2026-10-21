import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import academicService from '../../services/academicService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const CATEGORIES = ['ALL', 'EXAM', 'ASSIGNMENT', 'REVISION', 'READING', 'GENERAL'];

const SmartAcademicTodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'ASSIGNMENT',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getTodos();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching to-dos:', err);
      setError('Could not load academic to-dos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleToggle = async (id) => {
    try {
      const updated = await academicService.toggleTodo(id);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: updated.completed } : t))
      );
    } catch (err) {
      console.error('Error toggling to-do:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await academicService.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setSuccess('Task removed.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting to-do:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setActionLoading(true);
    try {
      const created = await academicService.createTodo(form);
      setTodos((prev) => [created, ...prev]);
      setShowAddModal(false);
      setForm({
        title: '',
        category: 'ASSIGNMENT',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      });
      setSuccess('Academic to-do added successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating to-do:', err);
      setError('Failed to create academic to-do.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'ALL') return true;
    return t.category?.toUpperCase() === filter;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) return <LoadingSpinner message="Loading your academic tasks..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: '#ffffff',
          padding: '1.75rem',
          borderRadius: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: '0.45rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#60a5fa',
              }}
            >
              <CheckSquare size={22} />
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Smart Academic To-Do List
            </h2>
          </div>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem', maxWidth: '560px' }}>
            Automatically prioritized coursework deadlines, revision milestones, and custom study tasks.
          </p>
        </div>

        {/* Progress Metric & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Progress
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {completedCount} / {totalCount} <span style={{ fontSize: '0.9rem', color: '#34d399' }}>({progressPct}%)</span>
            </div>
            <div
              style={{
                width: '140px',
                height: '6px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '999px',
                marginTop: '0.35rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: '#10b981',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Plus size={18} />
            Add Academic Task
          </button>
        </div>
      </div>

      {success && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <Filter size={16} style={{ color: '#6b7280', marginRight: '0.25rem' }} />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filter === cat ? '1px solid #111827' : '1px solid #e5e7eb',
              background: filter === cat ? '#111827' : '#ffffff',
              color: filter === cat ? '#ffffff' : '#4b5563',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="card" style={{ padding: '0.5rem' }}>
        {filteredTodos.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
            <CheckCircle2 size={40} style={{ margin: '0 auto 0.75rem', color: '#9ca3af' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#111827' }}>
              All Caught Up!
            </h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              No tasks found in category &quot;{filter}&quot;. Use &quot;Add Academic Task&quot; to plan your study goals.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTodos.map((todo) => {
              const isHigh = todo.priority === 'HIGH';
              const isMed = todo.priority === 'MEDIUM';

              return (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderBottom: '1px solid #f3f4f6',
                    background: todo.completed ? '#f9fafb' : '#ffffff',
                    opacity: todo.completed ? 0.75 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto' }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(todo.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        color: todo.completed ? '#10b981' : '#9ca3af',
                      }}
                      aria-label="Toggle completed"
                    >
                      {todo.completed ? <CheckSquare size={22} /> : <Square size={22} />}
                    </button>

                    <div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: todo.completed ? '#6b7280' : '#111827',
                          textDecoration: todo.completed ? 'line-through' : 'none',
                        }}
                      >
                        {todo.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {/* Category Badge */}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#f3f4f6',
                            color: '#374151',
                          }}
                        >
                          {todo.category}
                        </span>

                        {/* Priority Badge */}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#ecfdf5',
                            color: isHigh ? '#b91c1c' : isMed ? '#b45309' : '#047857',
                          }}
                        >
                          {todo.priority} PRIORITY
                        </span>

                        {/* Due Date */}
                        {todo.dueDate && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Calendar size={13} />
                            Due: {todo.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                Add Academic To-Do
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revise Graphs and Trees for Midterm"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="ASSIGNMENT">ASSIGNMENT</option>
                    <option value="EXAM">EXAM</option>
                    <option value="REVISION">REVISION</option>
                    <option value="READING">READING</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={actionLoading}>
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAcademicTodoList;
