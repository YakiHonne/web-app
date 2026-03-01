import React, { useEffect, useState } from "react";
import ArrowUp from "@/Components/ArrowUp";
import Sidebar from "@/(PagesComponents)/Docs/SW/Sidebar";
import SearchEngine from "@/(PagesComponents)/Docs/SW/SearchEngine";
import RightSidebar from "@/(PagesComponents)/Docs/SW/RightSidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import slugify from "slugify";
import { swContent } from "@/(PagesComponents)/Docs/SW/content";
import { copyText } from "@/Helpers/Helpers";
import Footer from "@/(PagesComponents)/Docs/SW/Footer";
import rehypeRaw from "rehype-raw";
import MobileNavbar from "@/(PagesComponents)/Docs/SW/MobileNavbar";

function DocContent({ keyword }) {
  keyword = keyword ? keyword.toLowerCase() : "";

  const handleCopyelement = (id) => {
    if (typeof document === "undefined") return;
    const codeRef = document.getElementById(id);
    if (!codeRef) return;
    const codeText = codeRef.innerText;
    copyText(codeText, "Code is copied");
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
        }
      }, 100);
    }
  }, [keyword]);

  return (
    <div className="fit-container">
      <MobileNavbar page={keyword} />
      <div
        className="fit-container fx-centered fx-start-v infinite-scroll"
        style={{ height: "100vh", overflow: "scroll" }}
      >
        <div className="main-container">
          <Sidebar page={keyword} />
          <main
            className="main-page-nostr-container "
            style={{ height: "unset" }}
          >
            <ArrowUp />
            <div
              className="fx-centered fit-container fx-start-h fx-start-v"
              style={{ gap: 0 }}
            >
              <div
                className="box-pad-h-m fx-col fx-centered fx-start-h fx-start-v main-middle-wide"
                style={{ gap: 0 }}
              >
                <div
                  className="fit-container mb-hide sticky"
                  style={{ zIndex: 10 }}
                >
                  <SearchEngine sticky={false} />
                </div>
                <div className="fit-container  box-pad-h-s md-content">
                  <ReactMarkdown
                    children={swContent[keyword].content}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    components={{
                      h1({ node, children }) {
                        const id = slugify(String(children), {
                          lower: true,
                          strict: true,
                        });
                        return <h1 id={id}>{children}</h1>;
                      },
                      h2({ node, children }) {
                        const id = slugify(String(children), {
                          lower: true,
                          strict: true,
                        });
                        return <h2 id={id}>{children}</h2>;
                      },
                      h3({ node, children }) {
                        const id = slugify(String(children), {
                          lower: true,
                          strict: true,
                        });
                        return <h3 id={id}>{children}</h3>;
                      },
                    }}
                  />
                </div>
                <Footer page={keyword} />
              </div>
              <div
                style={{
                  flex: 1,
                  border: "none",
                  paddingTop: "80px",
                }}
                className={`fx-centered  fx-wrap fx-start-v box-pad-v sticky extras-homepage`}
              >
                <RightSidebar page={keyword} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Doc({ keyword }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="fit-container">
        <div
          className="fit-container fx-centered fx-start-v infinite-scroll"
          style={{ height: "100vh", overflow: "scroll" }}
        >
          <div className="main-container">
            <main
              className="main-page-nostr-container"
              style={{ height: "unset" }}
            >
              <div className="fx-centered fit-container fx-start-h fx-start-v">
                <div className="box-pad-h-m fx-col fx-centered fx-start-h fx-start-v main-middle-wide">
                  <div className="fit-container box-pad-h-s">
                    <div
                      className="loading-placeholder"
                      style={{ height: "200px" }}
                    ></div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return <DocContent keyword={keyword} />;
}
