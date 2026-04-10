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
  const renderCard = (content, type) => {
    if (type === 'PR') {
      const lines = content.split('\n').filter(l => l.trim());
      const title = lines[0]?.replace(/^Title: /, '') || 'Fix Security Vulnerabilities';
      const points = lines.slice(1);
      return (
        <div className="ai-ui-card pr-card">
          <div className="card-tag">PULL REQUEST DRAFT</div>
          <h4>{title}</h4>
          <ul>{points.map((p, i) => <li key={i}>{p.replace(/^[-*]\s*/, '')}</li>)}</ul>
          <button className="btn-card-action">Copy PR Description</button>
        </div>
      );
    }
    if (type === 'ISSUE') {
      const lines = content.split('\n').filter(l => l.trim());
      const title = lines[0]?.replace(/^Title: /, '') || 'New Security Finding';
      const severity = lines[1]?.replace(/^Severity: /, '') || 'Medium';
      const desc = lines.slice(2).join(' ');
      return (
        <div className="ai-ui-card issue-card">
          <div className="card-tag severity-high">{severity.toUpperCase()} ISSUE</div>
          <h4>{title}</h4>
          <p>{desc}</p>
          <div className="card-actions">
            <button className="btn-card-action primary">Create GitHub Issue</button>
            <button className="btn-card-action">Ignore</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderText = (text) => {
    if (!text) return null;
    
    // Check for special cards first
    const prMatch = text.match(/\[PR_CARD\]([\s\S]*?)\[\/PR_CARD\]/);
    if (prMatch) return renderCard(prMatch[1].trim(), 'PR');

    const issueMatch = text.match(/\[ISSUE_CARD\]([\s\S]*?)\[\/ISSUE_CARD\]/);
    if (issueMatch) return renderCard(issueMatch[1].trim(), 'ISSUE');

    // Default basic markdown parser
    return text.split('\n').map((line, i) => {
      let content = line.trim();
      if (!content) return <br key={i} />;
      if (content.startsWith('- ') || content.startsWith('* ')) {
        return <li key={i} className="chat-li">{content.substring(2)}</li>;
      }
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, pi) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pi}>{part.substring(2, part.length - 2)}</strong>;
        }
        return part;
      });
      return <p key={i} className="chat-p">{elements}</p>;
    });
  };

  const isBot = msg.role === 'bot';
  return (
    <div className={`chat-msg ${isBot ? 'chat-msg-bot' : 'chat-msg-user'}`}>
      {isBot && (
        <div className="chat-bot-avatar">
          <FiZap size={10} />
        </div>
      )}
      <div className="chat-bubble">
        {renderText(msg.text)}
      </div>
    </div>
  );
}
