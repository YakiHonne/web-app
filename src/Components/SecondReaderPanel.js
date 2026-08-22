import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { analyzeFullArticle, analyzeParagraph } from "@/Endpoints/SecondReaderAI";
import { PERSONAS } from "@/Content/SecondReaderPersonas";
import aiChatDb, { scopeKey } from "@/lib/aiChatDb";
import { setToast } from "@/Store/Slides/Publishers";
import { getErrorReason, getErrorStatus } from "@/Hooks/useQuotaGuard";
import useFeatureQuota from "@/Hooks/useFeatureQuota";
import QuotaBanner from "@/Components/QuotaBanner";
import Icon from "@/Components/Icon";
import { iconsNames } from "@/Content/IconV2URL";
import { useTranslation } from "react-i18next";

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return String(h);
}

async function loadStoredReactions(pubkey, personaId) {
  try {
    const row = await aiChatDb.secondReaderReactions.get(
      scopeKey(pubkey, personaId),
    );
    if (!row) return null;
    return { reactions: row.reactions ?? [], contentHash: row.contentHash };
  } catch {
    return null;
  }
}

async function saveStoredReactions(pubkey, personaId, reactions, contentHash) {
  try {
    await aiChatDb.secondReaderReactions.put({
      personaId: scopeKey(pubkey, personaId),
      pubkey: pubkey || "",
      reactions,
      contentHash,
      updatedAt: Date.now(),
    });
  } catch { }
}

async function deleteStoredReactions(pubkey, personaId) {
  try {
    await aiChatDb.secondReaderReactions.delete(scopeKey(pubkey, personaId));
  } catch { }
}

function PersonaPicker({ onSelect, isAnalyzing, onClose, lastUsedPersonaId, quotaExceeded, quotaLocked, quotaResetAt }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",

      }}
      className="b bg-dropdown "
    >
      <div
        className="close pos-absolute pos-right-16 pos-top-16"
        onClick={onClose}
        style={{ zIndex: 1 }}
      >
        <div></div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        <h3>{t("AHqnlwE")}</h3>
        <p>{t("ARCmOET")}</p>
        <p className="gray-c p-medium">{t("AYKqIP8")}</p>
      </div>

      {quotaExceeded && (
        <div style={{ padding: "12px 16px 0" }}>
          <QuotaBanner locked={quotaLocked} resetAt={quotaResetAt} context="ai" />
        </div>
      )}

      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <div
          className="fx-centered fx-col fx-start-h fit-container fx-gap-v-m box-pad-h-m box-pad-v-m"
          style={{ overflowY: "auto", height: "100%" }}
        >
          {PERSONAS.map((p) => {
            const isLastUsed = p.id === lastUsedPersonaId;
            return (
              <div
                key={p.id}
                className="pointer fx-centered fx-start-v fx-gap-h-l fit-container border-all round-corner-m bg-hover box-pad-h-m box-pad-v-m"
                onClick={() => !isAnalyzing && !quotaExceeded && onSelect(p)}
                style={{
                  opacity: isAnalyzing || quotaExceeded ? 0.5 : 1,
                  cursor: isAnalyzing || quotaExceeded ? "not-allowed" : "pointer",
                  borderColor: isLastUsed ? "var(--c1)" : undefined,
                  position: "relative",
                }}
              >
                <div
                  className="round-corner-xl bg-img cover-bg"
                  style={{
                    backgroundImage: `url(${p.image})`,
                    minWidth: "58px",
                    minHeight: "58px",
                    borderRadius: "50%"
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="p-caps-s">{p.name}</p>
                  <p className="p-medium c1-c">{p.role}</p>
                  <p className="p-medium gray-c">{p.description}</p>
                </div>
                {isLastUsed && (
                  <span className="sr-switch-btn" style={{ cursor: "default" }}>
                    {t("AaXnygd")}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {isAnalyzing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--bg-main-color)",
              opacity: 0.88,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <div className="sr-analyzing-dot" style={{ width: 10, height: 10 }} />
            <p style={{ fontSize: "0.82rem" }} className="gray-c">
              {t("AXqzNKE")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SentimentIcon({ sentiment }) {
  if (sentiment === "positive") return <span>👍</span>;
  if (sentiment === "negative") return <span>👎</span>;
  return <span>💬</span>;
}

function ReactionCard({ reaction, onFocus, onFix, onIgnore, aiQuotaExceeded }) {
  const { t } = useTranslation();
  const isIgnored = reaction.status === "ignored";
  const isFixed = reaction.status === "fixed";
  const isResolved = isIgnored || isFixed;

  const severityClass =
    reaction.severity === "warning"
      ? " severity-warning"
      : reaction.severity === "critical"
        ? " severity-critical"
        : "";

  return (
    <div
      className={`sr-reaction-card${severityClass}${isResolved ? " sr-reaction-ignored" : ""}`}
      onClick={() => !isResolved && onFocus(reaction.paragraphIndex)}
    >
      <div className="sr-reaction-meta">
        <span className="sr-para-label">¶{reaction.paragraphIndex + 1}</span>
        <SentimentIcon sentiment={reaction.sentiment} />
      </div>
      <p className="sr-reaction-text">{reaction.comment}</p>

      {!isResolved && (
        <div className="sr-reaction-actions">
          <button
            className={`sr-fix-btn${aiQuotaExceeded ? " sr-fix-btn-disabled" : ""}`}
            disabled={aiQuotaExceeded}
            title={aiQuotaExceeded ? "AI quota exceeded" : undefined}
            onClick={(e) => {
              e.stopPropagation();
              if (aiQuotaExceeded) return;
              onFix(reaction);
            }}
          >
            {aiQuotaExceeded ? (
              <>
                <Icon name={iconsNames.circle_warning} size={13} />
                Limit reached
              </>
            ) : (
              <>{t("AvGTiVQ")} →</>
            )}
          </button>
          <button
            className="sr-ignore-btn"
            onClick={(e) => {
              e.stopPropagation();
              onIgnore(reaction);
            }}
          >
            {t("Aza3KHG")}
          </button>
        </div>
      )}

      {isFixed && <p className="sr-ignored-label">✓ {t("A07lIrt")}</p>}
      {isIgnored && <p className="sr-ignored-label">{t("AzWK36X")}</p>}
    </div>
  );
}

function ActiveReader({
  persona,
  reactions,
  isAnalyzingParagraph,
  onSwitch,
  onFocus,
  onFix,
  onIgnore,
  onClose,
  onClear,
  reduced,
  onToggleReduced,
  quotaExceeded,
  quotaLocked,
  quotaResetAt,
  aiQuotaExceeded,
}) {
  const { t } = useTranslation();
  const activeReactions = reactions.filter((r) => !r.status);
  const resolvedReactions = reactions.filter(
    (r) => r.status === "ignored" || r.status === "fixed",
  );

  return (
    <div
      className="bg-dropdown"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: reduced ? "0 0 auto" : 1,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--dim-border)",
          flexShrink: 0,
        }}
      >
        {!reduced && <h4 className="box-pad-h-s box-pad-v-s">{t("AHqnlwE")}</h4>}
        {reduced && <div></div>}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {reactions.length > 0 && (
            <button
              className="sr-switch-btn"
              onClick={onClear}
              title={t("AvHdzWg")}
              style={{
                borderColor: "var(--red-side)",
                backgroundColor: "var(--red-side)",
                color: "var(--red-main)",
              }}
            >
              {t("AUdbtv8")}
            </button>
          )}

          <div
            className={reduced ? "enlarge" : "reduce"}
            onClick={onToggleReduced}
            title={reduced ? t("An3se9s") : t("ARulmDc")}
          >
            <div></div>
          </div>

          <div
            className="close"
            onClick={onClose}
            style={{ position: "static" }}
          >
            <div></div>
          </div>
        </div>
      </div>

      {!reduced && quotaExceeded && (
        <div style={{ padding: "12px 14px 0" }}>
          <QuotaBanner locked={quotaLocked} resetAt={quotaResetAt} context="ai" />
        </div>
      )}

      {!reduced && (
        <div className="sr-reactions">
          {activeReactions.length === 0 && resolvedReactions.length === 0 ? (
            <div className="sr-empty-state">
              ✦ {t("AlYPtj8")}
            </div>
          ) : (
            <>
              {activeReactions.map((r) => (
                <ReactionCard
                  key={`${r.paragraphIndex}-${r.id || r.comment.slice(0, 10)}`}
                  reaction={r}
                  onFocus={onFocus}
                  onFix={onFix}
                  onIgnore={onIgnore}
                  aiQuotaExceeded={aiQuotaExceeded}
                />
              ))}

              {resolvedReactions.length > 0 && (
                <>
                  <p style={{ fontSize: "0.68rem", margin: "8px 0 4px" }} className="gray-c">
                    {t("A9Ifmyg", { count: resolvedReactions.length })}
                  </p>
                  {resolvedReactions.map((r) => (
                    <ReactionCard
                      key={`resolved-${r.paragraphIndex}-${r.id || r.comment.slice(0, 10)}`}
                      reaction={r}
                      onFocus={onFocus}
                      onFix={onFix}
                      onIgnore={onIgnore}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="sr-active-footer">
        <div className="sr-active-avatar-wrap">
          <div
            className="sr-active-avatar round-corner-xl bg-img cover-bg"
            style={{ backgroundImage: `url(${persona.image})` }}
          />
        </div>

        <div className="sr-active-footer-body">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p className="p-caps-s" style={{ margin: 0 }}>{persona.name}</p>
                {isAnalyzingParagraph && (
                  <span className="sr-analyzing-indicator">
                    <span className="sr-analyzing-dot" />
                    {t("AXyCYKa")}
                  </span>
                )}
              </div>
              <p className="p-medium c1-c">{persona.role}</p>
              <p className="p-medium gray-c" style={{ marginTop: 2 }}>
                {persona.description}
              </p>
            </div>
            <button className="sr-switch-btn" onClick={onSwitch}>
              {t("AZDTbiy")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SecondReaderPanel({
  isOpen,
  onClose,
  editor,
  getMarkdown,
  getParagraphs,
  onParagraphFocus,
  onOpenAIChat,
  lastEditedParagraph,
  suppressInvalidationRef,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    exceeded: quotaExceeded,
    locked: quotaLocked,
    resetAt: quotaResetAt,
    refresh: refreshQuota,
    markExceeded,
  } = useFeatureQuota("second-reader");
  const { exceeded: aiQuotaExceeded, refresh: refreshAiQuota } =
    useFeatureQuota("chat-articles");
  const pubkey = useSelector((state) => state.userKeys?.pub) || "";
  const [view, setView] = useState("picker");
  const [reduced, setReduced] = useState(false);
  const [activePersona, setActivePersona] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingParagraph, setIsAnalyzingParagraph] = useState(false);
  const reactionsCache = useRef({});
  const baseMarkdownRef = useRef(null);

  useEffect(() => {
    reactionsCache.current = {};
    setReactions([]);
    setView("picker");
    try {
      const id = localStorage.getItem(scopeKey(pubkey, "sr-last-persona"));
      setActivePersona(PERSONAS.find((p) => p.id === id) ?? null);
    } catch {
      setActivePersona(null);
    }
  }, [pubkey]);

  useEffect(() => {
    if (!activePersona) return;
    let cancelled = false;
    loadStoredReactions(pubkey, activePersona.id).then((stored) => {
      if (cancelled) return;
      if (stored && stored.reactions.length > 0) {
        reactionsCache.current[activePersona.id] = stored.reactions;
        setReactions(stored.reactions);
        setView("active");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pubkey, activePersona]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const md = getMarkdown();
      if (!md.trim()) return;

      // Track the latest markdown so stored reactions hash against current
      // content. We intentionally do NOT wipe reactions / reset to the picker
      // while the user keeps typing — existing thoughts are kept as history and
      // per-paragraph re-analysis (below) refreshes them incrementally.
      if (suppressInvalidationRef?.current) {
        suppressInvalidationRef.current = false;
      }
      baseMarkdownRef.current = md;
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, getMarkdown, suppressInvalidationRef]);

  const handleSelectPersona = useCallback(
    async (persona) => {
      const persistPersona = (p) => {
        try {
          localStorage.setItem(scopeKey(pubkey, "sr-last-persona"), p.id);
        } catch { }
      };

      if (reactionsCache.current[persona.id]) {
        persistPersona(persona);
        setActivePersona(persona);
        setReactions(reactionsCache.current[persona.id]);
        setView("active");
        return;
      }

      const stored = await loadStoredReactions(pubkey, persona.id);
      if (stored && stored.reactions.length > 0) {
        reactionsCache.current[persona.id] = stored.reactions;
        persistPersona(persona);
        setActivePersona(persona);
        setReactions(stored.reactions);
        setView("active");
        return;
      }

      if (quotaExceeded) return;

      const article = getMarkdown();
      const wordCount = article.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < 50) {
        dispatch(setToast({ type: 2, desc: t("ACEV9xr") }));
        return;
      }

      setIsAnalyzing(true);
      try {
        const result = await analyzeFullArticle(article, persona.id);
        const loaded = (result.reactions ?? []).map((r) => ({
          ...r,
          status: null,
        }));
        reactionsCache.current[persona.id] = loaded;
        await saveStoredReactions(pubkey, persona.id, loaded, hashString(article));
        persistPersona(persona);
        setActivePersona(persona);
        setReactions(loaded);
        setView("active");
        refreshQuota();
      } catch (err) {
        console.error("[SecondReader] full analysis failed", err);
        const status = getErrorStatus(err);
        if (status === 429 || status === 403) {
          markExceeded(getErrorReason(err));
          refreshQuota({ assumeExceeded: true });
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [getMarkdown, dispatch, t, pubkey, quotaExceeded, markExceeded, refreshQuota],
  );

  useEffect(() => {
    if (!isOpen) return;
    refreshQuota();
    refreshAiQuota();
  }, [isOpen, refreshQuota, refreshAiQuota]);

  const activePersonaRef = useRef(null);
  activePersonaRef.current = activePersona;

  useEffect(() => {
    const persona = activePersonaRef.current;
    if (!persona) return;
    if (reactions.length === 0 && !reactionsCache.current[persona.id]) return;
    reactionsCache.current[persona.id] = reactions;
    saveStoredReactions(
      pubkey,
      persona.id,
      reactions,
      hashString(baseMarkdownRef.current || ""),
    );
  }, [pubkey, reactions]);

  useEffect(() => {
    if (!activePersona || !lastEditedParagraph) return;
    if (quotaExceeded) return;
    const { index, text, before, after } = lastEditedParagraph;
    if (!text.trim()) return;

    let cancelled = false;
    setIsAnalyzingParagraph(true);

    analyzeParagraph(text, before, after, activePersona.id)
      .then((result) => {
        if (cancelled) return;
        setReactions((prev) => {
          const without = prev.filter((r) => r.paragraphIndex !== index);
          const updated = result.reaction
            ? [
              ...without,
              { ...result.reaction, paragraphIndex: index, status: null },
            ]
            : without;
          return updated;
        });
        refreshQuota();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[SecondReader] paragraph analysis failed", err);
        const status = getErrorStatus(err);
        if (status === 429 || status === 403) {
          markExceeded(getErrorReason(err));
          refreshQuota({ assumeExceeded: true });
        }
      })
      .finally(() => {
        if (!cancelled) setIsAnalyzingParagraph(false);
      });

    return () => {
      cancelled = true;
      setIsAnalyzingParagraph(false);
    };
  }, [lastEditedParagraph, activePersona, quotaExceeded, markExceeded, refreshQuota]);

  const handleFix = useCallback(
    (reaction) => {
      const msg = `Fix paragraph ${reaction.paragraphIndex + 1}: ${reaction.comment}`;
      setReactions((prev) =>
        prev.map((r) => (r === reaction ? { ...r, status: "fixed" } : r)),
      );
      onClose();
      onOpenAIChat(msg);
    },
    [onClose, onOpenAIChat],
  );

  const handleIgnore = useCallback((reaction) => {
    setReactions((prev) =>
      prev.map((r) => (r === reaction ? { ...r, status: "ignored" } : r)),
    );
  }, []);

  const handleSwitch = useCallback(() => setView("picker"), []);

  const handleClear = useCallback(() => {
    if (!activePersona) return;
    delete reactionsCache.current[activePersona.id];
    deleteStoredReactions(pubkey, activePersona.id);
    setReactions([]);
  }, [pubkey, activePersona]);

  return (
    <div
      className={`sr-panel${isOpen ? " is-open" : ""}`}
      style={{
        justifyContent:
          reduced && view === "active" && activePersona ? "flex-end" : "flex-start",
      }}
    >
      {view === "picker" || !activePersona ? (
        <PersonaPicker
          onSelect={handleSelectPersona}
          isAnalyzing={isAnalyzing}
          onClose={onClose}
          lastUsedPersonaId={activePersona?.id ?? null}
          quotaExceeded={quotaExceeded}
          quotaLocked={quotaLocked}
          quotaResetAt={quotaResetAt}
        />
      ) : (
        <ActiveReader
          persona={activePersona}
          reactions={reactions}
          isAnalyzingParagraph={isAnalyzingParagraph}
          onSwitch={handleSwitch}
          onFocus={onParagraphFocus}
          onFix={handleFix}
          onIgnore={handleIgnore}
          onClose={onClose}
          onClear={handleClear}
          reduced={reduced}
          onToggleReduced={() => setReduced((r) => !r)}
          quotaExceeded={quotaExceeded}
          quotaLocked={quotaLocked}
          quotaResetAt={quotaResetAt}
          aiQuotaExceeded={aiQuotaExceeded}
        />
      )}
    </div>
  );
}
