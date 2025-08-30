import React, { useEffect } from "react";
import ArrowUp from "@/Components/ArrowUp";
import Sidebar from "@/(PagesComponents)/Docs/SW/Sidebar";
import SearchEngine from "@/(PagesComponents)/Docs/SW/SearchEngine";
import RightSidebar from "@/(PagesComponents)/Docs/SW/RightSidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import slugify from "slugify";
import { swContent } from "@/(PagesComponents)/Docs/SW/content";
import { nanoid } from "nanoid";
import { copyText, straightUp } from "@/Helpers/Helpers";
import Footer from "@/(PagesComponents)/Docs/SW/Footer";
import rehypeRaw from "rehype-raw";
import MobileNavbar from "@/(PagesComponents)/Docs/SW/MobileNavbar";

export default function Doc({ keyword }) {
  keyword = keyword ? keyword.toLowerCase() : "";

  const handleCopyelement = (id) => {
    const codeRef = document.getElementById(id);
    if (!codeRef) return;
    const codeText = codeRef.innerText;
    copyText(codeText, "Code is copied");
  };
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
        }
      }, 100);
    } else {
      let el = document.querySelector(".infinite-scroll");
      if (!el) return;
      el.scrollTop = 0;
    }
  }, [keyword]);

  //   if (!swContent[keyword]) {
  //     router.push("/docs/sw/intro");
  //     return;
  //   }

  return (
    <div className="fit-container">
      <MobileNavbar page={keyword} />
      <div className="fit-container fx-centered fx-start-v infinite-scroll" style={{height: "100vh", overflow: "scroll"}}>
        <div className="main-container">
          <Sidebar page={keyword} />
          <main className="main-page-nostr-container " style={{height: "unset"}}>
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
                    //   code({ node, inline, className, children, ...props }) {
                    //     const match = /language-(\w+)/.exec(className || "");
                    //     const codeRef = nanoid();
                    //     return !inline ? (
                    //       <pre style={{ padding: "1rem 0" }}>
                    //         <span
                    //           className="sc-s-18 box-pad-v-s box-pad-h-m fit-container fx-scattered"
                    //           style={{
                    //             borderBottomRightRadius: 0,
                    //             borderBottomLeftRadius: 0,
                    //             top: "0px",
                    //             position: "sticky",
                    //             border: "none",
                    //           }}
                    //         >
                    //           <p className="gray-c p-italic">
                    //             {match?.length > 0 ? match[1] : ""}
                    //           </p>
                    //           <span
                    //             className="copy pointer"
                    //             onClick={() => {
                    //               handleCopyelement(codeRef);
                    //             }}
                    //           ></span>
                    //         </span>
                    //         <code
                    //           className={`hljs ${className}`}
                    //           {...props}
                    //           id={codeRef}
                    //         >
                    //           {children}
                    //         </code>
                    //       </pre>
                    //     ) : (
                    //       <code
                    //         className="inline-code"
                    //         {...props}
                    //         style={{ margin: "1rem 0" }}
                    //       >
                    //         {children}
                    //       </code>
                    //     );
                    //   },
                    }}
                  />
                </div>
                <Footer page={keyword}/>
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
