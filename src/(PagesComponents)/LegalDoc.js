import React, { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/Components/Icon";

const NAV_ITEMS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
];

export default function LegalDoc({ eyebrow, title, updated, current, sections, hideNav = false, children }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);
  const [mounted, setMounted] = useState(false);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("[data-legal-heading]"));
    const scrollEl = scrollRef.current;
    if (!headings.length || !scrollEl) return;

    const handleScroll = () => {
      const probeY = 140;
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= probeY) {
          current = heading.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    handleScroll();
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTocClick = (e, id) => {
    e.preventDefault();
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="legal-doc-page" ref={scrollRef}>
      <div className="legal-doc-topbar">
        <div className="legal-doc-topbar-inner">
          <Link href="/" className="legal-doc-brand">
            <span
              className="legal-doc-brand-mark-wrap"
              style={{ opacity: mounted ? 1 : 0 }}
            >
              <Icon
                name="yaki-logomark"
                className="legal-doc-brand-mark"
                width={44}
                height={44}
                isColored
              />
            </span>
          </Link>
          {!hideNav && (
            <nav className="legal-doc-switcher">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`legal-doc-switcher-item${item.href === current ? " is-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="legal-doc-wrap">
        <aside className="legal-doc-toc">
          <span className="legal-doc-toc-label">On this page</span>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={activeId === s.id ? "is-active" : ""}
                  onClick={(e) => handleTocClick(e, s.id)}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <main className="legal-doc-main">
          <header className="legal-doc-header">
            <span className="legal-doc-eyebrow">{eyebrow}</span>
            <h1 className="legal-doc-title">{title}</h1>
            <span className="legal-doc-updated">Last updated: {updated}</span>
          </header>

          <div className="legal-doc-body">{children}</div>
        </main>
      </div>
    </div>
  );
}
