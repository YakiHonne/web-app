import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Markdown } from "tiptap-markdown";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import Mathematics from "tiptap-math";
import "katex/dist/katex.min.css";
import NostrEntityExtension from "@/Extensions/NostrEntityExtension";
import { useSelector } from "react-redux";
import { FileUpload } from "@/Helpers/Helpers";
import ArticlePublishModalV2 from "@/Components/ArticlePublishModalV2";
import ArticleAIPanel from "@/Components/ArticleAIPanel";
import AIDiffViewer from "@/Components/AIDiffViewer";
import SecondReaderPanel from "@/Components/SecondReaderPanel";
import { AIDiffExtension } from "@/Extensions/AIDiffExtension";
import useLastEditedParagraph from "@/Hooks/useLastEditedParagraph";
import Button from "@/Components/UI/Button";
import { SelectTabs } from "@/Components/SelectTabs";
import PremiumFeatureGate from "@/Components/PremiumFeatureGate";
import MDEditorWrapper from "@/Components/MDEditorWrapper";
import PagePlaceholder from "@/Components/PagePlaceholder";
import LoadingScreen from "@/Components/LoadingScreen";
import LoadingDots from "@/Components/LoadingDots";
import ProfilesPicker from "@/Components/ProfilesPicker";
import Router, { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { getAppLang } from "@/Helpers/Helpers";
import { detectDirection } from "@/Helpers/Encryptions";
import Icon from "@/Components/Icon";
import Overlay from "@/Components/Overlay";
import { useDispatch } from "react-redux";
import { setToast } from "@/Store/Slides/Publishers";
import { useTranslation } from "react-i18next";
import {
  getArticleDraft,
  getPostToEdit,
  updateArticleDraft,
} from "@/Helpers/ClientHelpers";
import Spinner from "@/Components/Spinner";
import { iconsNames } from "@/Content/IconV2URL";

const draftKey = (pub) => `yh-article-draft-v2-${pub || "anon"}`;
const getDraft = (pub) => {
  try {
    return JSON.parse(localStorage.getItem(draftKey(pub)) || "{}");
  } catch {
    return {};
  }
};
const clearDraft = (pub) => {
  try {
    localStorage.removeItem(draftKey(pub));
  } catch { }
};

const ic = (children, extra = {}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...extra}
  >
    {children}
  </svg>
);

const I = {
  undo: ic(<><path d="M3 7v6h6" /><path d="M21 17A9 9 0 0 0 3 13" /></>),
  redo: ic(<><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 18-4" /></>),
  bold: ic(<><path d="M6 4h8a4 4 0 0 1 0 8H6z" /><path d="M6 12h9a4 4 0 0 1 0 8H6z" /></>),
  italic: ic(<><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></>),
  under: ic(<><path d="M6 3v7a6 6 0 0 0 12 0V3" /><line x1="4" y1="21" x2="20" y2="21" /></>),
  strike: ic(<><line x1="5" y1="12" x2="19" y2="12" /><path d="M16 6c0 0-1.5-2-4-2s-6 1-6 4c0 1.5 1 2.5 2.5 3" /><path d="M8 18c0 0 1.5 2 4 2s6-1 6-4c0-1.5-1-2.5-2.5-3" /></>),
  code: ic(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>),
  hi: ic(<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  link: ic(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>),
  unlink: ic(<><path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M5.17 11.75l-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" /><line x1="8" y1="2" x2="8" y2="5" /><line x1="2" y1="8" x2="5" y2="8" /><line x1="16" y1="19" x2="16" y2="22" /><line x1="19" y1="16" x2="22" y2="16" /></>),
  ul: ic(<><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" /></>),
  ol: ic(<><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></>),
  quote: ic(<><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></>),
  cb: ic(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /><line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" /></>),
  img: ic(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>),
  hr: ic(<><line x1="4" y1="12" x2="20" y2="12" strokeWidth="2.5" /></>),
  alL: ic(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></>),
  alC: ic(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>),
  alR: ic(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" /></>),
  alJ: ic(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>),
  plus: ic(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>),
  sup: ic(<><path d="M4 19l8-8M12 19L4 11" /><path d="M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.33 20 7c0-.47-.17-.93-.484-1.29a2.1 2.1 0 0 0-2.617-.436c-.42.24-.738.614-.899 1.06" /></>),
  sub: ic(<><path d="M4 5l8 8M12 5L4 13" /><path d="M20 21h-4c0-1.5.442-2 1.5-2.5S20 17.33 20 16c0-.47-.17-.93-.484-1.29a2.1 2.1 0 0 0-2.617-.436c-.42.24-.738.614-.899 1.06" /></>),
  math: ic(<path d="M18 7H6l6 5-6 5h12" />),
  nostr: ic(<><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>),
  chevron: ic(<polyline points="6 9 12 15 18 9" />),
};

function Tb({ icon, onClick, active, disabled, title }) {
  return (
    <button
      className={`tiptap-tb${active ? " is-active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      title={title}
      disabled={!!disabled}
    >
      {icon}
    </button>
  );
}

const Sep = () => <span className="tiptap-toolbar-sep" />;

function Toolbar({ editor, onImageUpload, isUploading }) {
  const { t } = useTranslation();
  const [showLink, setShowLink] = useState(false);
  const [linkVal, setLinkVal] = useState("");
  const [showInsert, setShowInsert] = useState(false);
  const [showHeadings, setShowHeadings] = useState(false);
  const [showNostr, setShowNostr] = useState(false);
  const [nostrVal, setNostrVal] = useState("");
  const insertRef = useRef(null);
  const headingsRef = useRef(null);
  const nostrRef = useRef(null);

  const s = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor;
      if (!e)
        return {
          bold: false, italic: false, underline: false, strike: false,
          code: false, highlight: false, link: false, bulletList: false,
          orderedList: false, blockquote: false, codeBlock: false,
          superscript: false, subscript: false, alL: false, alC: false,
          alR: false, alJ: false, hlevel: 0, linkHref: "", canUndo: false, canRedo: false,
        };
      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        code: e.isActive("code"),
        highlight: e.isActive("highlight"),
        link: e.isActive("link"),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        codeBlock: e.isActive("codeBlock"),
        superscript: e.isActive("superscript"),
        subscript: e.isActive("subscript"),
        alL: e.isActive({ textAlign: "left" }),
        alC: e.isActive({ textAlign: "center" }),
        alR: e.isActive({ textAlign: "right" }),
        alJ: e.isActive({ textAlign: "justify" }),
        hlevel: [1, 2, 3, 4, 5, 6].find((l) => e.isActive("heading", { level: l })) ?? 0,
        linkHref: e.getAttributes("link").href ?? "",
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      };
    },
  });

  useEffect(() => {
    const handler = (e) => {
      if (insertRef.current && !insertRef.current.contains(e.target)) setShowInsert(false);
      if (headingsRef.current && !headingsRef.current.contains(e.target)) setShowHeadings(false);
      if (nostrRef.current && !nostrRef.current.contains(e.target)) {
        setShowNostr(false);
        setNostrVal("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyNostrEntity = () => {
    const clean = nostrVal.trim().replace(/^nostr:/, "").replace(/[,.:;@?!]+$/, "");
    const nostrRe = /^(naddr1|note1|nevent1|npub1|nprofile1)[a-zA-Z0-9]+$/;
    if (!nostrRe.test(clean)) return;
    editor.chain().focus().insertNostrEntity({ addr: clean }).run();
    setShowNostr(false);
    setNostrVal("");
  };

  if (!editor) return null;

  const applyLink = () => {
    if (!linkVal.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: linkVal.trim() }).run();
    setShowLink(false);
    setLinkVal("");
  };

  return (
    <div className="tiptap-toolbar">
      <Tb icon={I.undo} onClick={() => editor.chain().focus().undo().run()} disabled={!s.canUndo} title="Undo (⌘Z)" />
      <Tb icon={I.redo} onClick={() => editor.chain().focus().redo().run()} disabled={!s.canRedo} title="Redo (⌘⇧Z)" />
      <Sep />

      <div className="tiptap-insert-wrap" ref={headingsRef}>
        <button
          className={`tiptap-insert-btn${showHeadings ? " is-open" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); setShowHeadings((v) => !v); }}
          title={t("AXbrvY0")}
          style={{ minWidth: "100px" }}
        >
          {s.hlevel === 0 ? t("AqfLRVU") : `${t("A16LR9D")} ${s.hlevel}`}
          <span style={{ marginLeft: "auto", display: "flex" }}>{I.chevron}</span>
        </button>
        {showHeadings && (
          <div className="tiptap-insert-dropdown">
            {[0, 1, 2, 3, 4, 5, 6].map((l) => (
              <button
                key={l}
                className="tiptap-insert-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (l === 0) editor.chain().focus().setParagraph().run();
                  else editor.chain().focus().toggleHeading({ level: l }).run();
                  setShowHeadings(false);
                }}
                style={{
                  fontWeight: s.hlevel === l ? "700" : "400",
                  backgroundColor: s.hlevel === l ? "var(--dim-bg)" : "",
                }}
              >
                {l === 0 ? t("AqfLRVU") : `${t("A16LR9D")} ${l}`}
              </button>
            ))}
          </div>
        )}
      </div>
      <Sep />

      <Tb icon={I.ul} onClick={() => editor.chain().focus().toggleBulletList().run()} active={s.bulletList} title={t("AjvsiLx")} />
      <Tb icon={I.ol} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={s.orderedList} title={t("AeKcAdp")} />
      <Sep />

      <Tb icon={I.bold} onClick={() => editor.chain().focus().toggleBold().run()} active={s.bold} title="Bold (⌘B)" />
      <Tb icon={I.italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={s.italic} title="Italic (⌘I)" />
      <Tb icon={I.strike} onClick={() => editor.chain().focus().toggleStrike().run()} active={s.strike} title={t("AOJEI2o")} />
      <Tb icon={I.code} onClick={() => editor.chain().focus().toggleCode().run()} active={s.code} title={t("ACNzuOK")} />
      <Tb icon={I.under} onClick={() => editor.chain().focus().toggleUnderline().run()} active={s.underline} title="Underline (⌘U)" />
      <Tb icon={I.hi} onClick={() => editor.chain().focus().toggleHighlight().run()} active={s.highlight} title={t("AWdFMmw")} />
      <Sep />

      <Tb icon={I.sup} onClick={() => editor.chain().focus().toggleSuperscript().run()} active={s.superscript} title={t("AYihYup")} />
      <Tb icon={I.sub} onClick={() => editor.chain().focus().toggleSubscript().run()} active={s.subscript} title={t("AqSa7z3")} />
      <Sep />

      <Tb
        icon={s.link ? I.unlink : I.link}
        active={s.link}
        title={s.link ? t("AkxGsQs") : t("AV6IvZ3")}
        onClick={() => {
          if (s.link) { editor.chain().focus().unsetLink().run(); setShowLink(false); }
          else { setLinkVal(s.linkHref); setShowLink((v) => !v); }
        }}
      />
      <Sep />

      <Tb icon={I.alL} onClick={() => editor.chain().focus().setTextAlign("left").run()} active={s.alL} title={t("A16X4k8")} />
      <Tb icon={I.alC} onClick={() => editor.chain().focus().setTextAlign("center").run()} active={s.alC} title={t("AX8w3v5")} />
      <Tb icon={I.alR} onClick={() => editor.chain().focus().setTextAlign("right").run()} active={s.alR} title={t("ADxfbbU")} />
      <Tb icon={I.alJ} onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={s.alJ} title={t("AyYSgnc")} />

      <div className="tiptap-insert-wrap" ref={insertRef}>
        <button
          className={`tiptap-insert-btn${showInsert ? " is-open" : ""}`}
          onMouseDown={(e) => { e.preventDefault(); setShowInsert((v) => !v); }}
          title={t("AWsufZn")}
        >
          {I.plus}
          {t("ARWeWgJ")}
          {I.chevron}
        </button>
        {showInsert && (
          <div className="tiptap-insert-dropdown">
            <button
              className="tiptap-insert-item"
              onMouseDown={(e) => {
                e.preventDefault();
                onImageUpload();
                setShowInsert(false);
              }}
            >
              {I.img}
              {t("A37QlLV")}
              {isUploading && <span style={{ marginLeft: "auto", fontSize: "0.72rem", opacity: 0.5 }}>{t("A40iXzu")}</span>}
            </button>
            <button className="tiptap-insert-item" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); setShowInsert(false); }}>
              {I.quote} {t("AxAw4rf")}
            </button>
            <button className="tiptap-insert-item" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); setShowInsert(false); }}>
              {I.cb} {t("A6ckd8N")}
            </button>
            <button
              className="tiptap-insert-item"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().insertContent({ type: "math", content: [{ type: "text", text: "E = mc^2" }] }).run();
                setShowInsert(false);
              }}
            >
              {I.math} {t("AjCjjJC")}
            </button>
            <button className="tiptap-insert-item" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); setShowInsert(false); }}>
              {I.hr} {t("A0KB6RD")}
            </button>
          </div>
        )}
      </div>

      {showLink && (
        <div className="tiptap-link-row">
          <input
            autoFocus
            className="tiptap-link-input if if-full"
            style={{ height: "40px" }}
            type="url"
            placeholder="https://..."
            value={linkVal}
            onChange={(e) => setLinkVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") { setShowLink(false); setLinkVal(""); }
            }}
          />
          <button className="btn btn-normal btn-small" onMouseDown={(e) => { e.preventDefault(); applyLink(); }}>{t("AAqu8CO")}</button>
          <button className="btn btn-gst btn-small" onMouseDown={(e) => { e.preventDefault(); setShowLink(false); setLinkVal(""); }}>{t("AB4BSCe")}</button>
        </div>
      )}

      {showNostr && (
        <div className="tiptap-link-row" ref={nostrRef}>
          <input
            autoFocus
            className="tiptap-link-input if if-full"
            style={{ height: "40px" }}
            type="text"
            placeholder="npub1… / naddr1… / note1… / nevent1… / nprofile1…"
            value={nostrVal}
            onChange={(e) => setNostrVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyNostrEntity();
              if (e.key === "Escape") { setShowNostr(false); setNostrVal(""); }
            }}
          />
          <button className="btn btn-normal btn-small" onMouseDown={(e) => { e.preventDefault(); applyNostrEntity(); }}>{t("AISC8KU")}</button>
          <button className="btn btn-gst btn-small" onMouseDown={(e) => { e.preventDefault(); setShowNostr(false); setNostrVal(""); }}>{t("AB4BSCe")}</button>
        </div>
      )}
    </div>
  );
}

const lowlight = createLowlight(all);

function ArticleEditorV2({ editEvent = null, onMarkdownChange, externalMarkdown, onSaveStatusChange, onHasContentChange, onClearRequest, onImetasChange, onExportRequest, onImportRequest, draftTitle = "" }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const subscription = useSelector((state) => state.subscription);
  const isPremiumPlan = subscription?.status?.plan === "premium" && subscription?.status?.active;
  const pub = userKeys?.pub ?? "anon";

  const initialDraft = useRef(null);
  if (initialDraft.current === null)
    initialDraft.current = editEvent ? {} : getDraft(pub);
  const draft = initialDraft.current;

  const editMeta = editEvent
    ? {
      title: editEvent.tags?.find((t_) => t_[0] === "title")?.[1] ?? "",
      summary: editEvent.tags?.find((t_) => t_[0] === "summary")?.[1] ?? "",
      image: editEvent.tags?.find((t_) => t_[0] === "image")?.[1] ?? "",
      identifier: editEvent.tags?.find((t_) => t_[0] === "d")?.[1] ?? "",
      publishedAt: editEvent.created_at,
    }
    : null;

  const [imetas, setImetas] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSecondReader, setShowSecondReader] = useState(false);
  const [showAIGate, setShowAIGate] = useState(false);
  const [aiChatPrefill, setAiChatPrefill] = useState("");
  const [diffHunks, setDiffHunks] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [showRestored, setShowRestored] = useState(!!(draft.title || draft.content));
  const saveTimer = useRef(null);
  const savedTimer = useRef(null);
  const srSuppressInvalidationRef = useRef(false);
  const syncedExternalRef = useRef(null);
  const editorRef = useRef(null);


  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] }, codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Mathematics.configure({ evaluation: true }),
      NostrEntityExtension,
      Markdown.configure({
        html: false,
        linkify: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: t("A0z7xpp") }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Superscript,
      Subscript,
      AIDiffExtension.configure({
        onDiffStart: (hunks) => setDiffHunks(hunks.map((h) => ({ ...h, status: null }))),
        onHunkUpdate: (hunks) => setDiffHunks([...hunks]),
        onDiffEnd: (finalMarkdown) => {
          setDiffHunks(null);
          srSuppressInvalidationRef.current = true;
          syncedExternalRef.current = finalMarkdown;
          setTimeout(() => editorRef.current?.commands.setContent(finalMarkdown), 0);
        },
      }),
    ],
    editorProps: { attributes: { class: "tiptap-content" } },
    content: "",
  });

  useEffect(() => {
    if (!editor) return;
    const initialContent = editEvent
      ? (editEvent.content || "")
      : (externalMarkdown ?? draft.content ?? "");
    syncedExternalRef.current = initialContent;
    if (!initialContent) return;
    setTimeout(() => { editor.commands.setContent(initialContent); }, 0);
  }, [editor]);

  useEffect(() => {
    if (!editor || externalMarkdown == null) return;
    if (syncedExternalRef.current === externalMarkdown) return;
    syncedExternalRef.current = externalMarkdown;
    const current = editor.storage.markdown?.getMarkdown() ?? "";
    if (current.trim() === externalMarkdown.trim()) return;
    setTimeout(() => { editor.commands.setContent(externalMarkdown); }, 0);
  }, [externalMarkdown, editor]);

  useEffect(() => {
    if (!showRestored) return;
    const t_ = setTimeout(() => setShowRestored(false), 700);
    return () => clearTimeout(t_);
  }, [showRestored]);

  const onMarkdownChangeRef = useRef(onMarkdownChange);
  useEffect(() => { onMarkdownChangeRef.current = onMarkdownChange; }, [onMarkdownChange]);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  const draftTitleRef = useRef(draftTitle);
  useEffect(() => { draftTitleRef.current = draftTitle; }, [draftTitle]);

  useEffect(() => {
    if (!editor) return;
    const fn = () => {
      const md = editor.storage.markdown.getMarkdown();
      if (!editEvent) {
        updateArticleDraft({ title: draftTitleRef.current, content: md });
        setSaveStatus("saving");
        onSaveStatusChange?.("saving");
        clearTimeout(saveTimer.current);
        clearTimeout(savedTimer.current);
        saveTimer.current = setTimeout(() => {
          setSaveStatus("saved");
          onSaveStatusChange?.("saved");
          savedTimer.current = setTimeout(() => { setSaveStatus("idle"); onSaveStatusChange?.("idle"); }, 3000);
        }, 1000);
      }
      onMarkdownChangeRef.current?.(md);
    };
    editor.on("update", fn);
    return () => editor.off("update", fn);
  }, [editor, editEvent, onSaveStatusChange]);

  useEffect(
    () => () => { clearTimeout(saveTimer.current); clearTimeout(savedTimer.current); },
    [],
  );

  const uploadImage = useCallback(
    async (file) => {
      setIsUploading(true);
      const result = await FileUpload({ file, userKeys, includeImeta: true });
      setIsUploading(false);
      if (!result) return;
      const url = typeof result === "string" ? result : result?.url;
      const imeta = typeof result === "object" ? result?.imeta : null;
      if (imeta) setImetas((p) => { const next = [...p, imeta]; onImetasChange?.(next); return next; });
      if (url) editor?.chain().focus().setImage({ src: url }).run();
    },
    [editor, userKeys],
  );

  const triggerImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); };
    input.click();
  }, [uploadImage]);

  useEffect(() => {
    const fn = (e) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (!item) return;
      e.preventDefault();
      uploadImage(item.getAsFile());
    };
    document.addEventListener("paste", fn);
    return () => document.removeEventListener("paste", fn);
  }, [uploadImage]);

  const getMarkdown = useCallback(() => editor?.storage.markdown.getMarkdown() ?? "", [editor]);

  const [hasContent, setHasContent] = useState(!!(externalMarkdown || draft.content || editEvent?.content));
  useEffect(() => {
    if (!editor) return;
    const fn = () => {
      const has = !!editor.storage.markdown.getMarkdown().trim();
      setHasContent(has);
      onHasContentChange?.(has);
    };
    editor.on("update", fn);
    return () => editor.off("update", fn);
  }, [editor, onHasContentChange]);

  const lastEditedParagraph = useLastEditedParagraph(editor, 9000);

  const getParagraphs = useCallback(() => {
    if (!editor) return [];
    const paragraphs = [];
    editor.state.doc.forEach((node) => { paragraphs.push(node.textContent); });
    return paragraphs;
  }, [editor]);

  const handleParagraphFocus = useCallback(
    (index) => {
      if (!editor) return;
      let pos = 0;
      editor.state.doc.forEach((node, offset, i) => { if (i === index) pos = offset; });
      editor.chain().focus().setTextSelection(pos + 1).run();
      editor.view.dom.children[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [editor],
  );

  const handleOpenAIChat = useCallback((prefillMessage) => {
    setAiChatPrefill(prefillMessage);
    setShowAIPanel(true);
    setShowSecondReader(false);
  }, []);

  const handleDiffReady = useCallback(
    (proposedContent) => {
      const originalMarkdown = getMarkdown();
      editor?.commands.startDiff(proposedContent, originalMarkdown);
    },
    [editor, getMarkdown],
  );

  const handleClear = useCallback(() => {
    editor?.commands.setContent("");
    setImetas([]);
    onImetasChange?.([]);
    clearDraft(pub);
    setSaveStatus("idle");
    onSaveStatusChange?.("idle");
    setShowRestored(false);
    onMarkdownChange?.("");
    onHasContentChange?.(false);
  }, [editor, pub, onMarkdownChange, onSaveStatusChange, onHasContentChange]);

  useEffect(() => {
    if (onClearRequest) onClearRequest(handleClear);
  }, [handleClear, onClearRequest]);

  useEffect(() => {
    onExportRequest?.(() => getMarkdown());
  }, [onExportRequest, getMarkdown]);

  useEffect(() => {
    onImportRequest?.((md) => {
      if (!editor) return;
      try {
        editor.commands.setContent(md);
        if (!editEvent) updateArticleDraft({ title: draftTitleRef.current, content: md });
      } catch (err) {
        console.error("Markdown import error:", err);
        dispatch(setToast({ type: 2, desc: "Failed to import the file. It may contain unsupported syntax." }));
      }
    });
  }, [onImportRequest, editor, editEvent, dispatch]);

  const handleAITabClick = (value) => {
    if (!isPremiumPlan) {
      setShowAIGate(true);
      return;
    }
    if (value === 0 && !showSecondReader) {
      setShowSecondReader(true);
      setShowAIPanel(false);
    } else if (value === 0 && showSecondReader) {
      setShowSecondReader(false);
    } else if (value === 1 && !showAIPanel) {
      setShowAIPanel(true);
      setShowSecondReader(false);
    } else if (value === 1 && showAIPanel) {
      setShowAIPanel(false);
    }
  };

  return (
    <>
      <div className="fit-container fx-centered fx-col" style={{ gap: "1rem" }}>
        <div className="fit-container fx-centered" style={{ gap: "8px" }}>
          <div>

            <SelectTabs
              selectedTab={showSecondReader ? 0 : showAIPanel ? 1 : -1}
              tabs={[`✦ ${t("ASLmW7h")}`, `✦ ${t("APshghB")}`]}
              setSelectedTab={handleAITabClick}
            />
          </div>

        </div>

        <div className="tiptap-shell fit-container">
          <Toolbar editor={editor} onImageUpload={triggerImageUpload} isUploading={isUploading} />
          {diffHunks ? (
            <AIDiffViewer
              hunks={diffHunks}
              onAccept={(id) => editor?.commands.acceptHunk(id)}
              onReject={(id) => editor?.commands.rejectHunk(id)}
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      </div>

      <ArticleAIPanel
        isOpen={showAIPanel}
        onClose={() => { setShowAIPanel(false); setAiChatPrefill(""); }}
        getMarkdown={getMarkdown}
        editor={editor}
        onDiffReady={handleDiffReady}
        isAILoading={isAILoading}
        setIsAILoading={setIsAILoading}
        prefillMessage={aiChatPrefill}
      />

      <SecondReaderPanel
        isOpen={showSecondReader}
        onClose={() => setShowSecondReader(false)}
        editor={editor}
        getMarkdown={getMarkdown}
        getParagraphs={getParagraphs}
        onParagraphFocus={handleParagraphFocus}
        onOpenAIChat={handleOpenAIChat}
        lastEditedParagraph={lastEditedParagraph}
        suppressInvalidationRef={srSuppressInvalidationRef}
      />

      {showAIGate && <PremiumFeatureGate feature="ai" onClose={() => setShowAIGate(false)} />}
    </>
  );
}

const getUploadsHistory = () => {
  let history = localStorage?.getItem("YakihonneUploadsHistory");
  if (history) return JSON.parse(history);
  return [];
};

function EditorSwitcherDropdown({ useV2Editor, onToggle }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn btn-normal btn-gray fx-centered bg-dropdown"
        style={{ gap: "8px", padding: "0 14px", height: "44px", borderRadius: "22px", fontSize: "0.82rem", fontWeight: 600 }}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{useV2Editor ? t("AMT1D0j") : t("ADBVicw")}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="bg-dropdown"
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, minWidth: "160px", padding: "6px", zIndex: 300, borderRadius: "14px",
            transformOrigin: "top left",
            animation: "popout 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          {[
            { label: t("AMT1D0j"), isV2: true },
            { label: t("ADBVicw"), isV2: false },
          ].map(({ label, isV2 }) => (
            <button
              key={label}
              onClick={() => { if (useV2Editor !== isV2) onToggle(); setOpen(false); }}
              className="wa-dropdown-item"
              style={{
                fontFamily: "inherit",
                fontWeight: useV2Editor === isV2 ? 700 : 400,
                color: useV2Editor === isV2 ? "var(--c1)" : "",
              }}
            >
              {label}
              {useV2Editor === isV2 && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorOptionsMenu({ onImport, onExport }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { label: t("AiINSld"), icon: iconsNames.file_upload, action: onImport, disabled: false },
    { label: t("A4A5psW"), icon: iconsNames.file_download, action: onExport, disabled: false },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="btn btn-normal btn-gray fx-centered bg-dropdown"
        style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0, flexShrink: 0 }}
        onClick={() => setOpen((v) => !v)}
        title={t("Ayc6Y5B")}
      >
        <Icon v={2} name={iconsNames.more_horizontal} size={18} />
      </button>
      {open && (
        <div
          className="bg-dropdown"
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            minWidth: "170px", padding: "6px", zIndex: 300, borderRadius: "14px",
            transformOrigin: "top right",
            animation: "popout 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
          }}
        >
          {items.map(({ label, icon, action, disabled }) => (
            <button
              key={label}
              onClick={() => { if (!disabled) { action(); setOpen(false); } }}
              className="wa-dropdown-item"
              style={{
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Icon v={2} name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WritingArticle() {
  const { query } = useRouter();
  const { edit } = query || {};
  const {
    post_pubkey, post_id, post_kind, post_title, post_desc, post_thumbnail,
    post_tags, post_d, post_content, post_published_at,
  } = getPostToEdit(edit);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const userKeys = useSelector((state) => state.userKeys);
  const isConnectedToYaki = useSelector((state) => state.isConnectedToYaki);
  const [showEditorGate, setShowEditorGate] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = ["dark", "gray", "system"].includes(resolvedTheme);
  const [draftData, setDraftData] = useState({});
  const [sharedMarkdown, setSharedMarkdown] = useState(post_content || "");
  const [content, setContent] = useState(post_content);
  const [title, setTitle] = useState(post_title);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [v2SaveStatus, setV2SaveStatus] = useState("idle");
  const [v2HasContent, setV2HasContent] = useState(false);
  const v2ClearRef = useRef(null);
  const [imetas, setImetas] = useState([]);
  const [v2Imetas, setV2Imetas] = useState([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const mdImportRef = useRef(null);
  const v2ExportRef = useRef(null);
  const v2ImportRef = useRef(null);
  const [uploadsHistory, setUploadsHistory] = useState(getUploadsHistory());
  const [showUploadsHistory, setShowUploadsHistory] = useState(false);
  const [showClearEditPopup, setShowClearEditPopup] = useState(false);
  const [selectedTab, setSelectedTab] = useState(
    ["ar", "he", "fa", "ur"].includes(getAppLang()) ? 1 : 0,
  );
  const [isEdit, setIsEdit] = useState(true);
  const [triggerHTMLWarning, setTriggerHTMLWarning] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(false);
  const [useV2Editor, setUseV2Editor] = useState(() => {
    try {
      return localStorage.getItem("yh-editor-v2") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isConnectedToYaki && useV2Editor) {
      setUseV2Editor(false);
      try { localStorage.setItem("yh-editor-v2", "false"); } catch { }
    }
  }, [isConnectedToYaki]);

  useEffect(() => {
    if (userKeys) setSelectedProfile(userKeys);
  }, [userKeys]);

  useEffect(() => {
    if (userKeys && !post_id) {
      let draft = getArticleDraft();
      let direction = detectDirection(draft.content);
      if (direction === "RTL") setSelectedTab(1);
      else setSelectedTab(0);
      setDraftData(draft);
      setTitle(draft.title);
      setContent(draft.content);
      setSharedMarkdown(draft.content || "");
    }
  }, [userKeys]);

  useEffect(() => {
    if (!title && !content) return;
    setIsSaving(true);
    let timeout = setTimeout(() => { setIsSaving(false); }, 600);
    return () => { clearTimeout(timeout); };
  }, [title, content]);

  const handleChange = (e) => {
    let value = e.target.value;
    let element = e.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
    updateArticleDraft({ title: value, content });
    setTitle(value);
    if (!value || value === "\n") { setTitle(""); return; }
  };

  const execute = (file) => {
    return new Promise(async (resolve, reject) => {
      if (file) {
        setIsLoading(true);
        let imgPath = await FileUpload({ file, userKeys });
        setIsLoading(false);
        resolve(imgPath);
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.click();
        input.onchange = async (e) => {
          if (e.target.files[0]) {
            setIsLoading(true);
            let uploadedFile = await FileUpload({ file: e.target.files[0], userKeys, includeImeta: true });
            setIsLoading(false);
            const imeta = typeof uploadedFile === "object" ? uploadedFile?.imeta : null;
            const url = typeof uploadedFile === "string" ? uploadedFile : uploadedFile?.url;
            if (imeta) setImetas((prev) => [...prev, imeta]);
            resolve(url);
          } else {
            resolve(false);
          }
        };
      }
    });
  };

  const hasHTMLOutsideCodeblocks = () => {
    const codeblockPatterns = /```([^`]+)```|``([^`]+)``|`([^`]+)`/g;
    const excludedTags =
      /(<iframe[^>]*>(?:.|\n)*?<\/iframe>)|(<video[^>]*>(?:.|\n)*?<\/video>)|(<source[^>]*>)|(<img[^>]*>)|(<>)|<\/>/g;
    let tempContent = content;
    const sanitizedText = tempContent
      .replace(new RegExp(codeblockPatterns, "g"), "")
      .replace(excludedTags, "");
    let res = /<[^>]*>/.test(sanitizedText);
    if (res) setTriggerHTMLWarning(true);
    else setTriggerHTMLWarning(false);
    return false;
  };

  const handleSetContent = (data) => {
    let direction = detectDirection(data);
    if (direction === "RTL") setSelectedTab(1);
    else setSelectedTab(0);
    updateArticleDraft({ title, content: data });
    setContent(data);
    setSharedMarkdown(data);
  };

  const clearContent = () => {
    setTitle("");
    setContent("");
    setSharedMarkdown("");
    updateArticleDraft({ title: "", content: "" });
  };

  const handleClearOptions = (data) => {
    if (data) clearContent();
    setShowClearEditPopup(false);
  };

  const toggleEditor = () => {
    const next = !useV2Editor;
    if (next && !isConnectedToYaki) {
      setShowEditorGate(true);
      return;
    }
    setUseV2Editor(next);
    try { localStorage.setItem("yh-editor-v2", String(next)); } catch { }
  };

  const handlePublish = () => setShowPublishModal(true);

  const handleMdExport = () => {
    const md = v2ExportRef.current?.();
    if (!md) return;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMdImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const allowed = [".md", ".markdown", ".txt"];
    const isAllowed = allowed.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isAllowed) {
      dispatch(setToast({ type: 2, desc: "Only .md, .markdown, or .txt files can be imported." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const md = ev.target?.result;
      if (typeof md === "string") v2ImportRef.current?.(md);
    };
    reader.onerror = () => {
      dispatch(setToast({ type: 2, desc: "Failed to read file." }));
    };
    reader.readAsText(file);
  };

  return (
    <>
      {showEditorGate && (
        <PremiumFeatureGate feature="editor" onClose={() => setShowEditorGate(false)} />
      )}
      {showPublishModal && (
        <ArticlePublishModalV2
          exit={() => setShowPublishModal(false)}
          initialTitle={post_title || ""}
          initialSummary={post_desc || ""}
          initialCoverUrl={post_thumbnail || ""}
          postContent={sharedMarkdown}
          imetas={useV2Editor ? v2Imetas : imetas}
          editId={post_d || ""}
          editPublishedAt={post_published_at}
        />
      )}
      {isLoading && <LoadingScreen />}
      {showUploadsHistory && (
        <UploadHistoryList
          exit={() => setShowUploadsHistory(false)}
          list={uploadsHistory}
        />
      )}
      {showClearEditPopup && (
        <ClearEditPopup handleClearOptions={handleClearOptions} />
      )}
      <div>
        <div className="fit-container fx-centered">
          <div className="fit-container">
            <main className="fit-container" style={{ overflow: "visible" }}>
              <div className="fx-centered fit-container fx-start-h fx-start-v">
                <div className="box-pad-h-m fit-container">
                  {userKeys && (
                    <>
                      {(userKeys.sec || userKeys.ext || userKeys.bunker) && (
                        <>
                          <div className="fit-container">
                            <div
                              className="fx-scattered fit-container fx-wrap"
                              style={{
                                marginBottom: "1rem",
                                position: "sticky",
                                top: "50px",
                                zIndex: 150,
                                padding: "8px 0",
                                backgroundColor: "transparent",
                              }}
                            >
                              <div className="fx-centered" style={{ gap: "8px" }}>
                                <button
                                  className="btn btn-normal btn-gray fx-centered bg-dropdown"
                                  style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0, flexShrink: 0 }}
                                  onClick={() => Router.back()}
                                >
                                  <Icon name="arrow" transform="rotate(90deg)" />
                                </button>
                                <EditorSwitcherDropdown useV2Editor={useV2Editor} onToggle={toggleEditor} />
                              </div>
                              <input
                                ref={mdImportRef}
                                type="file"
                                accept=".md,.markdown,text/markdown"
                                style={{ display: "none" }}
                                onChange={handleMdImport}
                              />
                              <div className="fx-centered" style={{ gap: "8px" }}>
                                {useV2Editor && (
                                  <>
                                    <EditorOptionsMenu
                                      onImport={() => mdImportRef.current?.click()}
                                      onExport={handleMdExport}
                                    />
                                    <button
                                      className="btn btn-normal btn-gray fx-centered bg-dropdown"
                                      style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0, flexShrink: 0, opacity: v2HasContent ? 1 : 0.35, cursor: v2HasContent ? "pointer" : "not-allowed" }}
                                      onClick={() => v2HasContent && v2ClearRef.current?.()}
                                      title={t("AUdbtv8")}
                                    >
                                      {v2SaveStatus === "saving" ? <Spinner size={18} /> : <Icon v={2} name={iconsNames.trash_full} size={18} />}
                                    </button>
                                  </>
                                )}
                                {!useV2Editor && (
                                  <button
                                    className="btn btn-normal btn-gray fx-centered bg-dropdown"
                                    style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0, flexShrink: 0, opacity: (content || title) ? 1 : 0.35, cursor: (content || title) ? "pointer" : "not-allowed" }}
                                    onClick={() => (content || title) && setShowClearEditPopup(true)}
                                    title={t("AUdbtv8")}
                                  >
                                    {isSaving ? <Spinner size={18} /> : <Icon v={2} name={iconsNames.trash_full} size={18} />}
                                  </button>
                                )}
                                <button
                                  className="btn btn-normal fx-centered "
                                  style={{ gap: "6px", fontSize: "0.82rem", height: "44px", padding: "0 20px", borderRadius: "22px", fontWeight: 600 }}
                                  onClick={handlePublish}
                                >
                                  {t("As7IjvV")}
                                </button>
                                <div className="bg-dropdown fx-centered" style={{ borderRadius: "50%", width: "44px", height: "44px", flexShrink: 0, overflow: "visible" }}>
                                  <ProfilesPicker setSelectedProfile={setSelectedProfile} />
                                </div>
                              </div>
                            </div>

                            {useV2Editor ? (
                              <ArticleEditorV2
                                editEvent={post_id ? { content: post_content, tags: [["title", post_title || ""], ["summary", post_desc || ""], ["image", post_thumbnail || ""], ["d", post_d || ""]], created_at: post_published_at } : null}
                                externalMarkdown={sharedMarkdown}
                                draftTitle={title}
                                onMarkdownChange={(md) => setSharedMarkdown(md)}
                                onImetasChange={setV2Imetas}
                                onSaveStatusChange={setV2SaveStatus}
                                onHasContentChange={setV2HasContent}
                                onClearRequest={(fn) => { v2ClearRef.current = fn; }}
                                onExportRequest={(fn) => { v2ExportRef.current = fn; }}
                                onImportRequest={(fn) => { v2ImportRef.current = fn; }}
                              />
                            ) : (
                              <div className="article fit-container" style={{ position: "relative" }}>
                                <MDEditorWrapper
                                  direction={selectedTab === 0 ? "ltr" : "rtl"}
                                  dataColorMode={isDarkMode ? "dark" : "light"}
                                  preview={!isEdit ? "preview" : "live"}
                                  height="80vh"
                                  width="100%"
                                  value={sharedMarkdown}
                                  onChange={handleSetContent}
                                  selectedTab={selectedTab}
                                  setSelectedTab={setSelectedTab}
                                  execute={execute}
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {!userKeys.sec && !userKeys.ext && !userKeys.bunker && (
                        <PagePlaceholder page="nostr-unauthorized" />
                      )}
                    </>
                  )}
                  {!userKeys && <PagePlaceholder page="nostr-not-connected" />}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

const UploadHistoryList = ({ exit, list = [] }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    dispatch(setToast({ type: 1, desc: `${t("AfnTOQk")} 👏` }));
  };
  return (
    <Overlay exit={exit} width={400}>
      <section
        className="box-pad-v box-pad-h fx-centered fx-col fx-start-h fx-start-v"
        style={{ height: "100%", overflow: "scroll" }}
      >
        <div className="close" onClick={exit}><div></div></div>
        <div className="fit-container fx-centered fx-col box-marg-s">
          <h4>{t("AP17LmU")}</h4>
          <p className="c1-c">{t("A6Mjx8g", { count: list.length })}</p>
        </div>
        {list.map((item) => (
          <div
            key={item}
            className="sc-s bg-img cover-bg fit-container fx-centered fx-end-h fx-start-v box-pad-h-m box-pad-v-m"
            style={{ position: "relative", aspectRatio: "16 / 9", backgroundImage: `url(${item})` }}
          >
            <div
              style={{ aspectRatio: "1/1", minWidth: "48px", backgroundColor: "var(--dim-gray)", borderRadius: "var(--border-r-50)" }}
              className="fx-centered pointer"
              onClick={() => copyLink(item)}
            >
              <Icon name="copy" size={24} />
            </div>
          </div>
        ))}
      </section>
    </Overlay>
  );
};

const ClearEditPopup = ({ handleClearOptions }) => {
  const { t } = useTranslation();
  return (
    <Overlay exit={() => handleClearOptions(false)} width={450}>
      <div className="fx-centered fx-col box-pad-h box-pad-v slide-up">
        <div
          className="fx-centered box-marg-s"
          style={{ minWidth: "54px", minHeight: "54px", borderRadius: "var(--border-r-50)", backgroundColor: "var(--red-main)" }}
        >
          <Icon name="warning" />
        </div>
        <h3 className="p-centered" style={{ wordBreak: "break-word" }}>{t("AirKalq")}</h3>
        <p className="p-centered gray-c box-pad-v-m">{t("ASGtOLO")}</p>
        <div className="fx-centered fit-container">
          <button className="fx btn btn-gst-red" onClick={() => handleClearOptions(true)}>{t("AUdbtv8")}</button>
          <button className="fx btn btn-red" onClick={() => handleClearOptions(false)}>{t("AB4BSCe")}</button>
        </div>
      </div>
    </Overlay>
  );
};
