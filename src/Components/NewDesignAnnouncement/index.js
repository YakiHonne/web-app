import { useState, useCallback, useEffect } from "react";
import styles from "./styles.module.css";

const DUR = "5s";
const KT  = "0;0.28;0.28;0.50;0.72;0.72;1";
const KS  = ".4 0 .2 1; .4 0 .2 1; .4 0 .2 1; .4 0 .2 1; .4 0 .2 1; .4 0 .2 1";

function A({ a, s, n }) {
  return (
    <animate attributeName={a}
      values={`${s};${s};${s};${n};${n};${n};${s}`}
      keyTimes={KT} dur={DUR} repeatCount="indefinite"
      calcMode="spline" keySplines={KS} />
  );
}
function Fade({ s, n }) {
  return (
    <animate attributeName="opacity"
      values={`${s};${s};${n};${n};${n};${s};${s}`}
      keyTimes={KT} dur={DUR} repeatCount="indefinite"
      calcMode="spline" keySplines={KS} />
  );
}

/*
  ═══════════════════════════════════════════════════════════════
  REFERENCE: from screenshot, the real navbar has:

  LEFT:
    • Small circle  (logo icon, orange square in real app)
    • Wide dark pill  (search bar)

  CENTER:
    • Dark pill containing 5 equal circles:
        ○ ○ ● ○ ○   (gray gray ORANGE gray gray)
        The pill has tight padding, circles are evenly spaced

  RIGHT:
    • Dark pill  (balance chip)
    • Small circle  (bell)
    • Slightly larger circle  (avatar)

  ═══════════════════════════════════════════════════════════════
  ViewBox: 560 × 220   Frame: x=8 y=8 w=544 h=204 rx=10

  Navbar bar: y=8 h=34, items cy = 8+17 = 25

  LEFT (x=8..190):
    Logo circle:  cx=26  cy=25  r=10        (orange fill)
    Search pill:  x=42   y=15  w=148 h=20  rx=10  (dark fill)
      icon circle inside: cx=55 cy=25 r=4
      handle:     55+4→(61,31)
      text stub:  x=63 y=22 w=110 h=6 rx=3

  CENTER (centred at x=280, pill width=174):
    Pill:   x=193  y=14  w=174 h=22  rx=11  (dark fill)
    5 circles inside, evenly spaced, r=8 each:
      cy=25  (centred in pill)
      cx values (starting 8+r=16 from left of pill inner):
        Item spacing: pill inner w = 174-22=152, 5 circles r=8 (d=16)
        gaps = (152 - 5*16) / 6 = (152-80)/6 = 12 each
        cx[0] = 193+11+12+8  = 224   Home
        cx[1] = 224+8+12+8   = 252   Articles
        cx[2] = 252+8+12+8   = 280   Plus  (orange, r=10 slightly bigger)
        cx[3] = 280+8+12+8   = 308   Messages (but plus r=10 so adjust)
        Redo with plus r=10:
        Total inner = 152, items = 8+8+8+10+10+8+8+8+8 = don't mix r
        Keep all r=8, plus is just orange:
        cx: 224 / 249 / 274 / 299 / 324  (gap=17 between centers = r+gap+r = 8+1+8)
        Actually: gap=(174-22-5*16)/4 = (152-80)/4=18 between centers
        cx: 193+11+8=212  first circle center
            212+18=230, 230+18=248(plus), 248+18=266, 266+18=284

        Let me just space 5 circles in 174px pill with 11px padding each side:
        available = 174-22 = 152px for 5 circles (d=16 each)
        spacing between centers = (152-16*5)/(5-1) = (152-80)/4 = 18
        cx[0]=193+11+8=212
        cx[1]=212+18=230
        cx[2]=230+18=248  ← Plus (orange)
        cx[3]=248+18=266
        cx[4]=266+18=284
        Check: cx[4]+8 = 292, pill right=193+174=367, padding=367-292=75 too much!

        Better: use tight spacing like the screenshot shows.
        Screenshot shows pill is only slightly wider than the 5 circles.
        Pill padding ≈ 6px each side. Circle r=9.
        available = pillinnerw = 5*18 + 4*8 = 90+32=122 → pill w = 122+12=134
        Pill: x=213 y=14 w=134 h=22 rx=11
        cx[0]=213+6+9=228  Home
        cx[1]=228+9+8+9=254 Articles  (gap=8)
        cx[2]=254+9+8+9=280 Plus
        cx[3]=280+9+8+9=306 Messages
        cx[4]=306+9+8+9=332 More
        Check: 332+9=341, pill right=213+134=347, pad=6 ✓ PERFECT

  RIGHT (x=356..548):
    Balance pill: x=356 y=14 w=108 h=22 rx=11  (dark fill)
      BTC dot: cx=369 cy=25 r=8 (orange)
      sats stub: x=381 y=20 w=60 h=5 rx=2.5  (lighter)
      unit stub: x=381 y=27 w=38 h=4 rx=2    (dimmer)
    Bell circle:  cx=480 cy=25 r=11  (dark fill)
    Avatar circle: cx=508 cy=25 r=13  (orange ring)
      head: cx=508 cy=21 r=5
  ═══════════════════════════════════════════════════════════════
*/

function LayoutMorphSVG() {
  const SBX = 80;   // card-left in sidebar state
  const NBX = 14;   // card-left in navbar state

  // Navbar item cy
  const CY = 25;

  // Nav-pill circles
  const PILL_X = 213, PILL_W = 134, PILL_H = 22, PILL_Y = 14;
  const NAV_CX = [228, 254, 280, 306, 332];
  const NAV_R  = 9;

  return (
    <svg className={styles.illustration}
      viewBox="0 0 560 220" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

      <defs>
        <clipPath id="nda-clip">
          <rect x="8" y="8" width="544" height="204" rx="10"/>
        </clipPath>
        <filter id="og">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Screen frame */}
      <rect x="8" y="8" width="544" height="204" rx="10"
        fill="rgba(13,13,17,0.98)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>

      <g clipPath="url(#nda-clip)">

        {/* ── Navbar bar background (grows 0→34) ── */}
        <rect x="8" y="8" width="544" fill="rgba(255,255,255,0.04)">
          <A a="height" s="0" n="34"/>
        </rect>
        <line x1="8" x2="552" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6">
          <A a="y1" s="8" n="42"/>
          <A a="y2" s="8" n="42"/>
        </line>

        {/* ── Sidebar bar (collapses 64→0) ── */}
        <rect x="8" y="8" height="204" fill="rgba(255,255,255,0.045)">
          <A a="width" s="64" n="0"/>
        </rect>
        <line y1="8" y2="212" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6">
          <A a="x1" s="72" n="8"/>
          <A a="x2" s="72" n="8"/>
        </line>

        {/* ══════════════════════════
            LOGO
            Sidebar: orange pill x=14 y=17 w=48 h=16 rx=4
            Navbar:  orange circle cx=26 cy=25 r=10
        ══════════════════════════ */}
        {/* sidebar logo pill → fades into circle */}
        <rect fill="rgba(238,119,0,0.9)" filter="url(#og)">
          <A a="x"      s="14" n="16"/>
          <A a="y"      s="17" n="15"/>
          <A a="width"  s="48" n="20"/>
          <A a="height" s="16" n="20"/>
          <A a="rx"     s="4"  n="10"/>
        </rect>

        {/* ══════════════════════════
            SEARCH PILL — slides out rightward from logo
            Grows width: 0 → 148, anchored at x=42
        ══════════════════════════ */}
        <rect y="15" height="20" rx="10"
          fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <A a="x"     s="42"  n="42"/>
          <A a="width" s="0"   n="148"/>
          <Fade s="0" n="1"/>
        </rect>
        {/* icon + text inside pill — fade in after pill has grown */}
        <circle cx="55" cy={CY} r="4"
          fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.9">
          <Fade s="0" n="1"/>
        </circle>
        <line x1="58.2" y1="28.2" x2="60.5" y2="30.5"
          stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeLinecap="round">
          <Fade s="0" n="1"/>
        </line>
        <rect x="66" y="22" width="112" height="6" rx="3"
          fill="rgba(255,255,255,0.15)">
          <Fade s="0" n="1"/>
        </rect>

        {/* ══════════════════════════
            NAV-PILL BORDER — grows from center outward (height 0→22, y collapses to centre)
        ══════════════════════════ */}
        <rect rx="11"
          fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <A a="x"      s={PILL_X}              n={PILL_X}/>
          <A a="width"  s={PILL_W}              n={PILL_W}/>
          <A a="y"      s={PILL_Y + PILL_H / 2} n={PILL_Y}/>
          <A a="height" s="0"                   n={PILL_H}/>
          <Fade s="0" n="1"/>
        </rect>

        {/* ══════════════════════════
            NAV ITEMS: morph from sidebar pills → navbar circles

            Sidebar: x=14, y=44/60/76/92/108, w=50, h=11, rx=5.5
            Navbar:  circles at NAV_CX[], cy=CY, r=NAV_R
        ══════════════════════════ */}

        {/*
          ── NAV ITEMS: single <rect> per item, physically travels ──
          Sidebar state: x=14, w=50, h=11, rx=5.5  (horizontal pill in sidebar column)
          Navbar state:  x=cx-r, w=2r, h=2r, rx=r  (circle in navbar pill)

          Each item animates x/y/width/height/rx simultaneously so it
          physically moves from sidebar → navbar and morphs shape.
          Item 6 is sidebar-only and fades out.
        */}

        {/* Item 1 — Home (orange) */}
        <rect fill="rgba(238,119,0,0.92)" filter="url(#og)">
          <A a="x"      s="14"             n={NAV_CX[0] - NAV_R}/>
          <A a="y"      s="44"             n={CY - NAV_R}/>
          <A a="width"  s="50"             n={NAV_R * 2}/>
          <A a="height" s="11"             n={NAV_R * 2}/>
          <A a="rx"     s="5.5"            n={NAV_R}/>
        </rect>

        {/* Item 2 — Articles */}
        <rect fill="rgba(255,255,255,0.18)">
          <A a="x"      s="14"             n={NAV_CX[1] - NAV_R}/>
          <A a="y"      s="60"             n={CY - NAV_R}/>
          <A a="width"  s="50"             n={NAV_R * 2}/>
          <A a="height" s="11"             n={NAV_R * 2}/>
          <A a="rx"     s="5.5"            n={NAV_R}/>
        </rect>

        {/* Item 3 — Plus (solid orange in navbar, larger circle) */}
        <rect>
          <A a="x"      s="14"             n={NAV_CX[2] - (NAV_R + 2)}/>
          <A a="y"      s="76"             n={CY - (NAV_R + 2)}/>
          <A a="width"  s="50"             n={(NAV_R + 2) * 2}/>
          <A a="height" s="11"             n={(NAV_R + 2) * 2}/>
          <A a="rx"     s="5.5"            n={NAV_R + 2}/>
          <animate attributeName="fill"
            values="rgba(255,255,255,0.18);rgba(255,255,255,0.18);rgba(238,119,0,1);rgba(238,119,0,1);rgba(238,119,0,1);rgba(255,255,255,0.18);rgba(255,255,255,0.18)"
            keyTimes={KT} dur={DUR} repeatCount="indefinite"
            calcMode="spline" keySplines={KS}/>
        </rect>
        {/* plus cross (fades in as item arrives at navbar) */}
        <line stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <A a="x1" s={NAV_CX[2]}     n={NAV_CX[2]}/>
          <A a="x2" s={NAV_CX[2]}     n={NAV_CX[2]}/>
          <A a="y1" s="76"            n={CY - 6}/>
          <A a="y2" s="87"            n={CY + 6}/>
          <Fade s="0" n="1"/>
        </line>
        <line stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <A a="x1" s={NAV_CX[2] - 6} n={NAV_CX[2] - 6}/>
          <A a="x2" s={NAV_CX[2] + 6} n={NAV_CX[2] + 6}/>
          <A a="y1" s="81.5"          n={CY}/>
          <A a="y2" s="81.5"          n={CY}/>
          <Fade s="0" n="1"/>
        </line>

        {/* Item 4 — Messages */}
        <rect fill="rgba(255,255,255,0.18)">
          <A a="x"      s="14"             n={NAV_CX[3] - NAV_R}/>
          <A a="y"      s="92"             n={CY - NAV_R}/>
          <A a="width"  s="50"             n={NAV_R * 2}/>
          <A a="height" s="11"             n={NAV_R * 2}/>
          <A a="rx"     s="5.5"            n={NAV_R}/>
        </rect>

        {/* Item 5 — More */}
        <rect fill="rgba(255,255,255,0.18)">
          <A a="x"      s="14"             n={NAV_CX[4] - NAV_R}/>
          <A a="y"      s="108"            n={CY - NAV_R}/>
          <A a="width"  s="50"             n={NAV_R * 2}/>
          <A a="height" s="11"             n={NAV_R * 2}/>
          <A a="rx"     s="5.5"            n={NAV_R}/>
        </rect>


        {/* ══════════════════════════
            BALANCE CHIP — slides in from the right edge
            x: 552 (off-screen right) → 356
        ══════════════════════════ */}
        <rect y="14" width="108" height="22" rx="11"
          fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <A a="x" s="552" n="356"/>
          <Fade s="0" n="1"/>
        </rect>
        <circle cy={CY} r="8" fill="rgba(238,119,0,0.92)" filter="url(#og)">
          <A a="cx" s="566" n="370"/>
          <Fade s="0" n="1"/>
        </circle>
        <rect y="22" width="6" height="6" rx="1" fill="rgba(255,255,255,0.85)">
          <A a="x" s="563" n="367"/>
          <Fade s="0" n="1"/>
        </rect>
        <rect y="18" width="48" height="6" rx="3" fill="rgba(255,255,255,0.3)">
          <A a="x" s="578" n="382"/>
          <Fade s="0" n="1"/>
        </rect>
        <rect y="26" width="30" height="4" rx="2" fill="rgba(255,255,255,0.14)">
          <A a="x" s="578" n="382"/>
          <Fade s="0" n="1"/>
        </rect>

        {/* ══════════════════════════
            BELL — drops down from above navbar
            cy: 8 (top of frame) → 25
        ══════════════════════════ */}
        <circle cx="480" r="11"
          fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <A a="cy" s="8" n={CY}/>
          <Fade s="0" n="1"/>
        </circle>
        <path d="M475 27 Q475 21 480 21 Q485 21 485 27 L486.5 29 L473.5 29 Z"
          fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="0.8">
          <Fade s="0" n="1"/>
        </path>
        <line x1="478" y1="29.5" x2="482" y2="29.5"
          stroke="rgba(255,255,255,0.32)" strokeWidth="0.9" strokeLinecap="round">
          <Fade s="0" n="1"/>
        </line>

        {/* ══════════════════════════
            AVATAR — grows from r=0 → r=13 in place
        ══════════════════════════ */}
        <circle cx="508" cy={CY}
          fill="rgba(238,119,0,0.2)" stroke="rgba(238,119,0,0.65)" strokeWidth="1.2"
          filter="url(#og)">
          <A a="r" s="0" n="13"/>
          <Fade s="0" n="1"/>
        </circle>
        <circle cx="508" cy="20" fill="rgba(238,119,0,0.6)">
          <A a="r" s="0" n="5"/>
          <Fade s="0" n="1"/>
        </circle>

        {/* ══════════════════════════
            KINDONE CARD
        ══════════════════════════ */}
        <rect rx="8"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.07)" strokeWidth="0.7">
          <A a="x"      s={SBX}  n={NBX}/>
          <A a="y"      s="48"   n="48"/>
          <A a="width"  s="462"  n="528"/>
          <A a="height" s="148"  n="148"/>
        </rect>

        {/* card avatar */}
        <circle r="13" fill="rgba(255,255,255,0.09)">
          <A a="cx" s={SBX+26} n={NBX+26}/>
          <A a="cy" s="72" n="72"/>
        </circle>
        <circle r="5" fill="rgba(255,255,255,0.2)">
          <A a="cx" s={SBX+26} n={NBX+26}/>
          <A a="cy" s="68" n="68"/>
        </circle>

        {/* name */}
        <rect height="7" rx="3.5" fill="rgba(255,255,255,0.25)">
          <A a="x"     s={SBX+46} n={NBX+46}/>
          <A a="y"     s="65" n="65"/>
          <A a="width" s="80" n="80"/>
        </rect>
        {/* verified */}
        <circle r="3.5" fill="rgba(238,119,0,0.85)">
          <A a="cx" s={SBX+131} n={NBX+131}/>
          <A a="cy" s="68.5" n="68.5"/>
        </circle>
        {/* date */}
        <rect height="5" rx="2.5" fill="rgba(255,255,255,0.12)">
          <A a="x"     s={SBX+46} n={NBX+46}/>
          <A a="y"     s="76" n="76"/>
          <A a="width" s="40" n="40"/>
        </rect>

        {/* options dots */}
        {[0, 8, 16].map((d, i) => (
          <circle key={i} r="2" fill="rgba(255,255,255,0.15)">
            <A a="cx" s={SBX+440-d} n={NBX+506-d}/>
            <A a="cy" s="68.5" n="68.5"/>
          </circle>
        ))}

        {/* text lines */}
        <rect height="7" rx="3.5" fill="rgba(255,255,255,0.18)">
          <A a="x"     s={SBX+46} n={NBX+46}/>
          <A a="y"     s="88" n="88"/>
          <A a="width" s="400" n="466"/>
        </rect>
        <rect height="6" rx="3" fill="rgba(255,255,255,0.12)">
          <A a="x"     s={SBX+46} n={NBX+46}/>
          <A a="y"     s="100" n="100"/>
          <A a="width" s="330" n="396"/>
        </rect>
        <rect height="6" rx="3" fill="rgba(255,255,255,0.07)">
          <A a="x"     s={SBX+46} n={NBX+46}/>
          <A a="y"     s="111" n="111"/>
          <A a="width" s="250" n="310"/>
        </rect>

        {/* reactions */}
        {[0,1,2,3].map((i) => (
          <g key={i}>
            <rect height="13" rx="6.5" fill="rgba(255,255,255,0.05)">
              <A a="x"     s={SBX+46+i*68} n={NBX+46+i*68}/>
              <A a="y"     s="124" n="124"/>
              <A a="width" s="56" n="56"/>
            </rect>
            <rect height="5" rx="2" fill="rgba(255,255,255,0.22)">
              <A a="x" s={SBX+52+i*68} n={NBX+52+i*68}/>
              <A a="y" s="128" n="128"/>
              <A a="width" s="10" n="10"/>
            </rect>
            <rect height="5" rx="2" fill="rgba(255,255,255,0.12)">
              <A a="x" s={SBX+66+i*68} n={NBX+66+i*68}/>
              <A a="y" s="128" n="128"/>
              <A a="width" s="24" n="24"/>
            </rect>
          </g>
        ))}

      </g>
    </svg>
  );
}

export default function NewDesignAnnouncement({ onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss?.(), 280);
  }, [onDismiss]);

  return (
    <div
      className={`${styles.backdrop}${exiting ? ` ${styles.exiting}` : ""}`}
      onClick={(e) => e.target === e.currentTarget && handleDismiss()}
    >
      <div className={`${styles.card}${exiting ? ` ${styles.exiting}` : ""}`}>
        <div className={styles.badgeRow}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            What&apos;s New
          </div>
        </div>
        <h3 className={styles.title} style={{ fontSize: "1.25rem", lineHeight: 1.25 }}>YakiHonne just got a new look</h3>
        <p className={styles.brief}>
          Your navigation has moved. The sidebar is gone — everything lives in
          the top navbar now, cleaner and faster.
        </p>
        <div className={styles.svgWrapper}>
          <LayoutMorphSVG />
        </div>
        <button className={styles.ctaButton} onClick={handleDismiss}>
          Got it!
        </button>
      </div>
    </div>
  );
}
