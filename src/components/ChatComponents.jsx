import React from 'react';
import { FiZap } from 'react-icons/fi';

export function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg-bot">
      <div className="chat-bot-avatar">
        <FiZap size={10} />
      </div>
      <div className="chat-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

export function ChatMessage({ msg }) {
  if (msg.role === 'bot') {
    const sections = parseCopilotSections(msg.text);
    return (
      <div className="chat-msg chat-msg-bot">
        <div className="chat-bot-avatar">
          <FiZap size={10} />
        </div>
        <article className="chat-release-card">
          <header className="chat-release-head">
            <span className="chat-release-repo">BugSentry Copilot Response</span>
            <span className="chat-release-time">now</span>
          </header>
          <h4 className="chat-release-title">{sections.title}</h4>
          <div className="chat-release-body">
            {sections.items.map((item, index) => (
              <section key={`${item.heading}-${index}`} className="chat-release-section">
                {item.heading && <h5>{item.heading}</h5>}
                {item.points.length > 0 ? (
                  <ul>
                    {item.points.map((point, pointIndex) => <li key={`${index}-${pointIndex}`}>{point}</li>)}
                  </ul>
                ) : (
                  <p>{item.body}</p>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
      <div className="chat-bubble">{msg.text}</div>
    </div>
  );
}

function parseCopilotSections(text) {
  const clean = (text || '').trim();
  if (!clean) {
    return {
      title: 'Repository Analysis Update',
      items: [{ heading: 'Summary', body: 'No content returned from AI.', points: [] }],
    };
  }

  const blocks = clean.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const firstLine = clean.split('\n').map((line) => line.trim()).find(Boolean);
  const title = (firstLine && !firstLine.startsWith('-') && !firstLine.startsWith('*') && !firstLine.startsWith('#'))
    ? firstLine.replace(/^["']|["']$/g, '')
    : 'Repository Analysis Update';

  const items = blocks.slice(0, 6).map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const headingLine = lines.find((line) => line.startsWith('#')) || '';
    const heading = headingLine ? headingLine.replace(/^#+\s*/, '') : (index === 0 ? 'Highlights' : '');
    const points = lines
      .filter((line) => line.startsWith('- ') || line.startsWith('* '))
      .map((line) => line.replace(/^[-*]\s+/, ''));

    const body = lines
      .filter((line) => !line.startsWith('#') && !line.startsWith('- ') && !line.startsWith('* '))
      .join(' ')
      .trim();

    return {
      heading,
      points,
      body: body || (points.length === 0 ? block : ''),
    };
  }).filter((item) => item.heading || item.body || item.points.length);

  return {
    title: title.slice(0, 120),
    items: items.length ? items : [{ heading: 'Summary', body: clean, points: [] }],
  };
}
