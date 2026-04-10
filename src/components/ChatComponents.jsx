import React from 'react';
import { FiZap, FiCopy, FiCheck } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCard = (content, type) => {
    if (type === 'PR') {
      const lines = content.split('\n').filter(l => l.trim());
      const title = lines[0]?.replace(/^Title: /, '') || 'Proposed Remediation Plan';
      const points = lines.slice(1);
      return (
        <div className="ai-ui-card pr-card">
          <div className="card-tag">BugSentry Analysis • Solution</div>
          <h2 className="card-title-md">{title}</h2>
          <ul className="card-list-md">{points.map((p, i) => <li key={i}>{p.replace(/^[-*]\s*/, '')}</li>)}</ul>
          <button className="btn-card-action" onClick={() => handleCopyCode(content)}>
            {copied ? <><FiCheck /> Copied</> : <><FiCopy /> Copy Solution</>}
          </button>
        </div>
      );
    }
    if (type === 'ISSUE') {
      const lines = content.split('\n').filter(l => l.trim());
      const title = lines[0]?.replace(/^Title: /, '') || 'Security Finding Details';
      const severity = lines[1]?.replace(/^Severity: /, '') || 'Critical';
      const desc = lines.slice(2).join(' ');
      return (
        <div className="ai-ui-card issue-card">
          <div className="card-tag">{severity.toUpperCase()} PRIORITY ALERT</div>
          <h2 className="card-title-md">{title}</h2>
          <p className="card-desc-md">{desc}</p>
          <div className="card-actions">
            <button className="btn-card-action primary">Commit Patch</button>
            <button className="btn-card-action">Ignore</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const isBot = msg.role === 'bot';
  const text = msg.text || '';

  // Check for specialized cards
  const prMatch = text.match(/\[PR_CARD\]([\s\S]*?)\[\/PR_CARD\]/);
  const issueMatch = text.match(/\[ISSUE_CARD\]([\s\S]*?)\[\/ISSUE_CARD\]/);

  if (prMatch) return (
    <div className={`chat-msg ${isBot ? 'chat-msg-bot' : 'chat-msg-user'}`}>
      {isBot && <div className="chat-bot-avatar"><FiZap size={10} /></div>}
      <div className="chat-bubble-raw">{renderCard(prMatch[1].trim(), 'PR')}</div>
    </div>
  );

  if (issueMatch) return (
    <div className={`chat-msg ${isBot ? 'chat-msg-bot' : 'chat-msg-user'}`}>
      {isBot && <div className="chat-bot-avatar"><FiZap size={10} /></div>}
      <div className="chat-bubble-raw">{renderCard(issueMatch[1].trim(), 'ISSUE')}</div>
    </div>
  );

  return (
    <div className={`chat-msg ${isBot ? 'chat-msg-bot' : 'chat-msg-user'}`}>
      {isBot && (
        <div className="chat-bot-avatar">
          <FiZap size={10} />
        </div>
      )}
      <div className="chat-bubble markdown-chat">
        {isBot && <h2 className="chat-h2" style={{ marginTop: 0 }}>BugSentry Report</h2>}
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="code-block-wrapper">
                  <div className="code-header">
                    <span>{match[1].toUpperCase()}</span>
                    <button onClick={() => handleCopyCode(String(children).replace(/\n$/, ''))}>
                      {copied ? <FiCheck /> : <FiCopy />}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => <h1 className="chat-h1">{children}</h1>,
            h2: ({ children }) => <h2 className="chat-h2">{children}</h2>,
            h3: ({ children }) => <h3 className="chat-h3">{children}</h3>,
            h4: ({ children }) => <h4 className="chat-h4">{children}</h4>,
            p: ({ children }) => <p className="chat-p">{children}</p>,
            ul: ({ children }) => <ul className="chat-ul">{children}</ul>,
            li: ({ children }) => <li className="chat-li">{children}</li>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
