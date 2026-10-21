import React from 'react';

/**
 * Safe, zero-dependency Markdown renderer for Academic Assistant.
 * Parses headings, bullet lists, numbered lists, bold text, italics,
 * inline code, and paragraphs safely without dangerouslySetInnerHTML.
 */
const formatInlineText = (text) => {
  if (!text) return null;

  // Split on bold (**text**), inline code (`code`), italics (*text*)
  // Tokens regex: (\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={index} style={{ fontWeight: 700, color: 'inherit' }}>
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={index}
          style={{
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            fontSize: '0.88em',
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={index} style={{ fontStyle: 'italic' }}>
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
};

const MarkdownMessage = ({ content = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = null;
  let listType = null; // 'ul' or 'ol'
  let listIndex = 0;

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag
          key={`list-${listIndex++}`}
          style={{
            margin: '0.4rem 0 0.75rem',
            paddingLeft: '1.4rem',
            lineHeight: 1.6,
          }}
        >
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.3rem' }}>
              {formatInlineText(item)}
            </li>
          ))}
        </Tag>
      );
      currentList = null;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Headings (###, ##, #)
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h4-${i}`}
          style={{
            fontSize: '1.05rem',
            fontWeight: 750,
            color: 'inherit',
            margin: '0.65rem 0 0.35rem',
            letterSpacing: '-0.01em',
          }}
        >
          {formatInlineText(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'inherit',
            margin: '0.75rem 0 0.4rem',
            letterSpacing: '-0.01em',
          }}
        >
          {formatInlineText(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'inherit',
            margin: '0.85rem 0 0.45rem',
            letterSpacing: '-0.02em',
          }}
        >
          {formatInlineText(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Bullet lists (- or *)
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
        currentList = [];
      }
      currentList.push(bulletMatch[1]);
      continue;
    }

    // Numbered lists (1. 2. etc.)
    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
        currentList = [];
      }
      currentList.push(numberMatch[1]);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        style={{
          margin: '0 0 0.65rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {formatInlineText(line)}
      </p>
    );
  }

  flushList();

  return <div className="markdown-body" style={{ fontSize: '0.925rem' }}>{elements}</div>;
};

export default MarkdownMessage;
