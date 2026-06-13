/**
 * AISidebar.jsx — Code Ground AI pair programmer chat panel
 *
 * This is the reusable, standalone version of the AI sidebar.
 * It was extracted from Editor.jsx so it can be:
 *   - tested in isolation
 *   - imported by other pages if needed (e.g. a dedicated AI chat page)
 *   - developed and improved without touching Editor.jsx
 *
 * ── What this component owns ─────────────────────────────────────────
 *
 *   - The full chat message list (renders all messages, scroll state)
 *   - The auto-growing textarea input
 *   - The "scroll to bottom" button (appears when user scrolls up)
 *   - The "thinking" animation between user message and AI reply
 *   - Message timestamps (relative: "just now", "2 min ago")
 *   - Code block rendering inside AI messages (fenced ``` blocks)
 *   - Copy-to-clipboard on completed AI messages
 *
 * ── What this component does NOT own ────────────────────────────────
 *
 *   - The actual AI API call (Editor.jsx owns that — SSE streaming logic)
 *   - The message array (passed in as `messages` prop)
 *   - Auth state (receives `currentUser` as a prop)
 *
 *   This keeps the component pure and easy to test:
 *   you can render it with mock messages without any network calls.
 *
 * ── Props ────────────────────────────────────────────────────────────
 *
 *   messages     {Array}    — full chat history
 *                             Each message: {
 *                               id:        string | number,
 *                               role:      'user' | 'assistant',
 *                               content:   string,
 *                               username:  string (for user messages),
 *                               streaming: boolean (true while SSE is open),
 *                               timestamp: ISO string (optional),
 *                             }
 *
 *   loading      {boolean}  — true while the AI SSE stream is open
 *                             Controls the thinking indicator visibility
 *
 *   onSend       {Function} — called with (question: string) when user sends
 *                             Parent handles the API call, appends messages
 *
 *   onClear      {Function} — called when user clicks "Clear chat"
 *
 *   contextNote  {string}   — short text shown below the header, e.g.
 *                             "Watching you and Alice" or "Watching your edits"
 *                             Tells the user what the AI currently sees.
 *
 *   currentUser  {Object}   — { username: string } — used for avatar initials
 *
 * ── How to use in Editor.jsx ─────────────────────────────────────────
 *
 *   import AISidebar from '../components/AISidebar.jsx';
 *
 *   <AISidebar
 *     messages={aiMessages}
 *     loading={aiLoading}
 *     onSend={handleAISend}
 *     onClear={() => setAiMessages([])}
 *     contextNote={contextNote}
 *     currentUser={user}
 *   />
 *
 *   Remove the inline AISidebar and AIMessage functions from Editor.jsx
 *   after adding this import.
 */

import React, {
  useState, useEffect, useRef, useCallback, memo,
} from 'react';
import styles from './AISidebar.module.css';

/* ─────────────────────────────────────────────────────────────────────
   AVATAR COLOR — deterministic colour from username string.
   Same algorithm used in Editor.jsx and Dashboard.jsx so the
   same user always gets the same colour across the whole app.
───────────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  '#3B82F6', '#22D3EE', '#34D399', '#F59E0B',
  '#EC4899', '#8B5CF6', '#F87171', '#60A5FA',
];

function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ─────────────────────────────────────────────────────────────────────
   RELATIVE TIME — formats a timestamp as a human-friendly string.
   "just now" / "2 min ago" / "1 hr ago" / "Yesterday" / date string.
   We roll our own to avoid pulling in date-fns for one function.
───────────────────────────────────────────────────────────────────── */
function relativeTime(isoStr) {
  if (!isoStr) return '';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 10)    return 'just now';
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─────────────────────────────────────────────────────────────────────
   PARSE MESSAGE CONTENT
   Splits an AI response string into segments of two types:
     { type: 'text', content: string }
     { type: 'code', lang: string, content: string }

   Handles fenced code blocks: ```js\n...\n``` or ```\n...\n```
   Everything outside a fenced block is a text segment.
   This lets AIMessage render code in a styled <pre> block.
───────────────────────────────────────────────────────────────────── */
function parseContent(text) {
  if (!text) return [{ type: 'text', content: '' }];

  const segments = [];
  /* Regex: matches ``` optionally followed by a language name, then content, then ``` */
  const FENCE_RE = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex  = 0;
  let match;

  while ((match = FENCE_RE.exec(text)) !== null) {
    /* Text before this code block */
    if (match.index > lastIndex) {
      segments.push({
        type:    'text',
        content: text.slice(lastIndex, match.index),
      });
    }
    /* The code block itself */
    segments.push({
      type:    'code',
      lang:    match[1] || 'code',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  /* Remaining text after the last code block */
  if (lastIndex < text.length) {
    segments.push({
      type:    'text',
      content: text.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

/* ─────────────────────────────────────────────────────────────────────
   ICONS — inline SVG, stroke-based, inherit currentColor.
   All are small (13–16px) and functional — no decorative icons.
───────────────────────────────────────────────────────────────────── */

const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 4 0v2" />
    <path d="M16 7V5a2 2 0 0 0-4 0v2" />
    <circle cx="9" cy="13" r="1" fill="currentColor" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
    <path d="M9 17h6" />
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/* Chevron-down — used in the scroll-to-bottom button */
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* Spinner — spinning arc */
const Spinner = () => (
  <svg className={styles.spinner} width="14" height="14"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" aria-hidden="true">
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────
   CODE BLOCK — rendered inside an AI message when the response
   contains a fenced ``` block. Shows the language label and a
   copy button in the header.
───────────────────────────────────────────────────────────────────── */
function CodeBlock({ lang, content }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={styles.code_block}>
      {/* Code block header: language label + copy button */}
      <div className={styles.code_block_header}>
        <span className={styles.code_lang}>{lang}</span>
        <button
          className={styles.code_copy_btn}
          onClick={handleCopy}
          aria-label={`Copy ${lang} code`}
        >
          <CopyIcon />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* The actual code — pre preserves indentation */}
      <pre className={styles.code_content}>
        <code>{content}</code>
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   AI MESSAGE — a single message bubble.

   Differences from the Editor.jsx inline version:
     1. Renders code blocks via parseContent() instead of raw pre-wrap
     2. Shows a relative timestamp below the message
     3. memo() wraps it — messages don't re-render when input changes
───────────────────────────────────────────────────────────────────── */
const AIMessage = memo(function AIMessage({ msg }) {
  const isUser   = msg.role === 'user';
  const segments = isUser ? null : parseContent(msg.content);

  /* Copy the entire message content */
  const [copied, setCopied] = useState(false);
  function handleCopyAll() {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className={`${styles.msg} ${isUser ? styles.msg_user : styles.msg_ai}`}
      /* Each message is a listitem in the log region */
    >
      {/* ── Avatar ── */}
      <div
        className={styles.msg_avatar}
        aria-hidden="true"
        style={isUser ? { background: avatarColor(msg.username || 'u') } : {}}
      >
        {isUser
          /* User: coloured initial */
          ? (msg.username?.[0]?.toUpperCase() ?? 'U')
          /* AI: the <CG/> logo mark */
          : <span className={styles.ai_logo_mark}>&lt;CG/&gt;</span>
        }
      </div>

      {/* ── Message body ── */}
      <div className={styles.msg_body}>

        {/* Label row: name + timestamp */}
        <div className={styles.msg_meta}>
          <span className={styles.msg_label}>
            {isUser ? (msg.username || 'You') : 'Code Ground AI'}
          </span>
          {msg.timestamp && (
            <time
              className={styles.msg_time}
              dateTime={msg.timestamp}
              title={new Date(msg.timestamp).toLocaleString()}
            >
              {relativeTime(msg.timestamp)}
            </time>
          )}
        </div>

        {/* ── Content area ── */}
        {isUser ? (
          /* User messages: plain pre-wrap text */
          <p className={styles.msg_content}>
            {msg.content}
          </p>
        ) : (
          /* AI messages: parsed segments — text + code blocks */
          <div className={styles.msg_segments}>
            {segments.map((seg, i) =>
              seg.type === 'code' ? (
                <CodeBlock key={i} lang={seg.lang} content={seg.content} />
              ) : (
                /* Text segment: pre-wrap preserves newlines from the AI */
                <p key={i} className={styles.msg_content}>
                  {seg.content}
                  {/* Blinking cursor on the LAST segment of a streaming message */}
                  {msg.streaming && i === segments.length - 1 && (
                    <span className={styles.stream_cursor} aria-hidden="true">▋</span>
                  )}
                </p>
              )
            )}
          </div>
        )}

        {/* ── Copy button — only on completed AI messages ── */}
        {!isUser && !msg.streaming && msg.content && (
          <button
            className={styles.msg_copy}
            onClick={handleCopyAll}
            aria-label="Copy full response"
          >
            <CopyIcon />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}

      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────
   THINKING INDICATOR — shown while waiting for the AI to start
   responding. Three bouncing dots with the <CG/> avatar.
   Only visible when loading=true AND the last message was from the user.
───────────────────────────────────────────────────────────────────── */
function ThinkingIndicator() {
  return (
    <div className={styles.thinking} aria-label="AI is thinking">
      <div className={styles.thinking_avatar} aria-hidden="true">
        &lt;CG/&gt;
      </div>
      <div className={styles.thinking_dots}>
        <span /><span /><span />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   EMPTY STATE — shown before any messages are sent.
   Four suggested prompts let users start with one click.
───────────────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'Explain what this code does',
  'Find bugs in this file',
  'How can this be optimised?',
  'Write tests for this function',
];

function EmptyState({ onSuggestion }) {
  return (
    <div className={styles.empty}>
      {/* Dimmed logo mark — decorative */}
      <div className={styles.empty_logo} aria-hidden="true">&lt;CG/&gt;</div>

      <p className={styles.empty_heading}>Your AI pair programmer</p>
      <p className={styles.empty_sub}>
        Ask anything about the code. The AI sees every edit made by
        every user in this session — not just your own.
      </p>

      {/* Suggested prompts — click to pre-fill the input */}
      <div className={styles.suggestions} role="list">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            role="listitem"
            className={styles.suggestion_btn}
            onClick={() => onSuggestion(s)}
          >
            {/* Mono prompt arrow — on-brand */}
            <span className={styles.suggestion_arrow} aria-hidden="true">›</span>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   AI SIDEBAR — the root exported component.
───────────────────────────────────────────────────────────────────── */
export default function AISidebar({
  messages     = [],
  loading      = false,
  onSend,
  onClear,
  contextNote  = '',
  currentUser  = null,
}) {
  /* ── Input state ── */
  const [input, setInput]   = useState('');

  /* ── Scroll state ── */
  const [atBottom, setAtBottom] = useState(true);

  /* ── Refs ── */
  const listRef  = useRef(null);   /* the scrollable message list  */
  const inputRef = useRef(null);   /* the textarea                 */

  /* ── Auto-scroll to bottom when new messages arrive ──
     Only scroll if the user is already near the bottom.
     If they've scrolled up to read history, don't yank them down. */
  useEffect(() => {
    if (atBottom && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, atBottom]);

  /* ── Track whether the user is at the bottom ──
     Threshold: 80px from the bottom counts as "at bottom". */
  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distFromBottom < 80);
  }

  /* ── Scroll to bottom button handler ── */
  function scrollToBottom() {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
    setAtBottom(true);
  }

  /* ── Send message ── */
  const handleSend = useCallback(() => {
    const q = input.trim();
    if (!q || loading) return;
    onSend?.(q);
    setInput('');
    /* Reset textarea height after clearing */
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    inputRef.current?.focus();
  }, [input, loading, onSend]);

  /* ── Keyboard: Enter sends, Shift+Enter inserts newline ── */
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* ── Auto-grow textarea up to 120px ── */
  function handleInputResize(e) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  /* ── Suggestion click: pre-fill input and focus ── */
  function handleSuggestion(text) {
    setInput(text);
    /* Small delay so state has updated before we focus */
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  /* ── Whether to show the thinking indicator ──
     Shows only when: loading=true AND the last message was from the user.
     (If the last message is already the AI streaming, no need for dots.) */
  const showThinking =
    loading && messages.length > 0 && messages[messages.length - 1]?.role === 'user';

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────── */
  return (
    <aside className={styles.root} aria-label="AI pair programmer">

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.header_left}>
          <BotIcon />
          <span className={styles.title}>AI Pair Programmer</span>
          {/* Pulsing dot signals "live — watching the session" */}
          <span className={styles.live_dot} aria-hidden="true" />
        </div>

        {/* Clear button — only shown when there are messages to clear */}
        {messages.length > 0 && (
          <button
            className={styles.clear_btn}
            onClick={onClear}
            aria-label="Clear chat history"
            title="Clear chat"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* ── Context note ──
          Tells the user what the AI currently "sees".
          e.g. "Watching you and Alice" or "Watching your edits" */}
      {contextNote && (
        <div className={styles.context_note} aria-live="polite">
          <span className={styles.context_dot} aria-hidden="true" />
          <span>{contextNote}</span>
        </div>
      )}

      {/* ── Message list ──
          role="log" + aria-live="polite" means screen readers
          announce new messages without interrupting the user. */}
      <div
        ref={listRef}
        className={styles.messages}
        role="log"
        aria-label="AI conversation history"
        aria-live="polite"
        onScroll={handleScroll}
      >
        {/* Empty state — before any messages */}
        {messages.length === 0 && !loading && (
          <EmptyState onSuggestion={handleSuggestion} />
        )}

        {/* Message bubbles */}
        {messages.map(msg => (
          <AIMessage key={msg.id} msg={msg} />
        ))}

        {/* Thinking indicator */}
        {showThinking && <ThinkingIndicator />}
      </div>

      {/* ── Scroll to bottom button ──
          Floats above the input. Only visible when user has scrolled up. */}
      {!atBottom && (
        <button
          className={styles.scroll_btn}
          onClick={scrollToBottom}
          aria-label="Scroll to latest message"
          title="Scroll to bottom"
        >
          <ChevronDownIcon />
        </button>
      )}

      {/* ── Input area ── */}
      <div className={styles.input_wrap}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInputResize}
          placeholder="Ask about the code… (Enter to send)"
          rows={1}
          disabled={loading}
          aria-label="Message to AI pair programmer"
          aria-describedby="ai-input-hint"
        />
        {/* Hidden hint for screen readers */}
        <span id="ai-input-hint" className={styles.sr_only}>
          Press Enter to send. Press Shift and Enter for a new line.
        </span>

        <button
          className={styles.send_btn}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? <Spinner /> : <SendIcon />}
        </button>
      </div>

      {/* Input hint — shown below textarea */}
      <p className={styles.input_hint} aria-hidden="true">
        Enter ↵ to send · Shift+Enter for newline
      </p>

    </aside>
  );
}
