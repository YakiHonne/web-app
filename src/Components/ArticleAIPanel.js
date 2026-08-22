import React, { useState, useRef, useEffect, useCallback } from "react";
import { askArticleAI } from "@/Endpoints/ArticleAI";
import { getErrorReason, getErrorStatus } from "@/Hooks/useQuotaGuard";
import useFeatureQuota from "@/Hooks/useFeatureQuota";
import QuotaBanner from "@/Components/QuotaBanner";
import Button from "@/Components/UI/Button";
import aiChatDb, { scopeKey } from "@/lib/aiChatDb";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

let msgIdCounter = 0;
const nextId = () => ++msgIdCounter;

const SESSION_ID = "article-editor";

async function loadSession(pubkey) {
  try {
    const row = await aiChatDb.sessions.get(scopeKey(pubkey, SESSION_ID));
    return row?.messages ?? [];
  } catch {
    return [];
  }
}

async function saveSession(pubkey, messages) {
  try {
    await aiChatDb.sessions.put({
      sessionId: scopeKey(pubkey, SESSION_ID),
      pubkey: pubkey || "",
      messages,
      updatedAt: Date.now(),
    });
  } catch { }
}

async function clearSession(pubkey) {
  try {
    await aiChatDb.sessions.delete(scopeKey(pubkey, SESSION_ID));
  } catch { }
}

function UserBubble({ text }) {
  return (
    <div className="ai-msg-user">
      <span>{text}</span>
    </div>
  );
}

function AISkeleton() {
  return (
    <div className="ai-msg-ai">
      <div className="ai-skeleton" />
      <div className="ai-skeleton" style={{ width: "70%", marginTop: 6 }} />
    </div>
  );
}

function AIBubble({ msg }) {
  return (
    <div className="ai-msg-ai">
      <div className="ai-msg-ai-header">
        <span className="ai-spark">✦</span>
        <span className="ai-msg-ai-text">{msg.text}</span>
      </div>
    </div>
  );
}

export default function ArticleAIPanel({
  isOpen,
  onClose,
  getMarkdown,
  onDiffReady,
  isAILoading,
  setIsAILoading,
  prefillMessage,
}) {
  const { t } = useTranslation();
  const pubkey = useSelector((state) => state.userKeys?.pub) || "";
  const {
    exceeded: quotaExceeded,
    locked: quotaLocked,
    resetAt: quotaResetAt,
    refresh: refreshQuota,
    markExceeded,
  } = useFeatureQuota("chat-articles");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const closeTimerRef = useRef(null);
  const prefillTimerRef = useRef(null);
  const sendRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setSessionLoaded(false);
    setMessages([]);
    loadSession(pubkey).then((saved) => {
      if (cancelled) return;
      if (saved.length > 0) {
        const maxId = saved.reduce((m, msg) => Math.max(m, msg.id ?? 0), 0);
        if (maxId >= msgIdCounter) msgIdCounter = maxId + 1;
        setMessages(saved);
      }
      setSessionLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [pubkey]);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(prefillTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    saveSession(pubkey, messages);
  }, [pubkey, messages, sessionLoaded]);

  useEffect(() => {
    if (!isOpen || !prefillMessage) return;
    setInput(prefillMessage);
    clearTimeout(prefillTimerRef.current);
    prefillTimerRef.current = setTimeout(() => {
      setInput((current) => {
        if (current.trim()) {
          setTimeout(() => {
            sendRef.current?.();
          }, 0);
        }
        return current;
      });
    }, 300);
  }, [isOpen, prefillMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAILoading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 104) + "px";
  }, [input]);

  useEffect(() => {
    if (!isOpen) return;
    refreshQuota();
  }, [isOpen, refreshQuota]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isAILoading || quotaExceeded) return;

    const userMsg = { id: nextId(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsAILoading(true);

    try {
      const article = getMarkdown();
      const { explanation, content } = await askArticleAI(text, article);

      const aiMsg = { id: nextId(), role: "ai", text: explanation };
      setMessages((prev) => [...prev, aiMsg]);

      refreshQuota();

      if (content) {
        closeTimerRef.current = setTimeout(() => {
          onClose();
          onDiffReady(content);
        }, 700);
      }
    } catch (err) {
      const status = getErrorStatus(err);
      const reason = getErrorReason(err);

      if (status === 429 || status === 403) {
        markExceeded(reason);
        refreshQuota({ assumeExceeded: true });
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "ai",
            text: err.message || t("AEH0z9N"),
          },
        ]);
      }
    } finally {
      setIsAILoading(false);
    }
  }, [input, isAILoading, quotaExceeded, getMarkdown, onClose, onDiffReady, setIsAILoading, refreshQuota, markExceeded, t]);

  sendRef.current = handleSend;

  const handleClear = useCallback(() => {
    setMessages([]);
    clearSession(pubkey);
  }, [pubkey]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div
        className="ai-panel-backdrop"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <div
          className="ai-panel bg-dropdown"
          style={{ transform: isOpen ? "translateY(0)" : "translateY(100%)" }}
          aria-hidden={!isOpen}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="close pos-absolute pos-right-16 pos-top-16"
            onClick={onClose}
          >
            <div></div>
          </div>

          <div className="fit-container fx-centered box-pad-v">
            <h4>{t("AhlYBYo")}</h4>
          </div>

          <div className="ai-panel-messages">
            {messages.length === 0 && !isAILoading && (
              <div className="ai-empty-state">
                <span className="ai-spark" style={{ fontSize: "1.5rem" }}>✦</span>
                <p>{t("AJ7Kigj")}</p>
              </div>
            )}

            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserBubble key={msg.id} text={msg.text} />
              ) : (
                <AIBubble key={msg.id} msg={msg} />
              ),
            )}

            {isAILoading && <AISkeleton />}
            <div ref={bottomRef} />
          </div>

          {quotaExceeded && (
            <QuotaBanner locked={quotaLocked} resetAt={quotaResetAt} context="ai" />
          )}

          <div className="ai-panel-input-area">
            <textarea
              ref={textareaRef}
              className="ai-textarea no-scrollbar"
              placeholder={t("A79OLjw")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAILoading || quotaExceeded}
              rows={1}
            />
            <button
              className="ai-send-btn"
              onClick={handleSend}
              disabled={isAILoading || quotaExceeded || !input.trim()}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
            <Button
              label=""
              type="gray"
              size="m"
              leftIcon="trash"
              className="ai-clear-btn"
              disabled={messages.length === 0 || isAILoading}
              onClick={handleClear}
            />
          </div>
        </div>
      </div>
    </>
  );
}
