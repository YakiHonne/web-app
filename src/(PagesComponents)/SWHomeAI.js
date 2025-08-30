import React, { useEffect, useRef, useState } from "react";
import LoadingDots from "@/Components/LoadingDots";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  copyText,
  getAnswerFromAIRemoteAPI,
} from "@/Helpers/Helpers";
import {
  getKeys,
} from "@/Helpers/ClientHelpers";
import { nanoid } from "nanoid";
import { t } from "i18next";
import PagePlaceholder from "@/Components/PagePlaceholder";
import Link from "next/link";

const getSavedConversation = () => {
  const getUserKeys = getKeys();
  if (!getUserKeys) return [];
  let aiConversation = localStorage?.getItem("aiConversation");
  aiConversation = JSON.parse(aiConversation) || {};
  let conversation = aiConversation[getUserKeys.pub];
  if (!conversation) return [];
  return conversation;
};

const saveConversation = (pubkey, data) => {
  const aiConversation = localStorage?.getItem("aiConversation");
  let conversation = JSON.parse(aiConversation) || {};
  conversation[pubkey] = data;
  localStorage?.setItem("aiConversation", JSON.stringify(conversation));
};

export default function SWhomeAI() {
  return (
    <div>
      <Main />
    </div>
  );
}

const Main = () => {
  const userKeys = useSelector((state) => state.userKeys);
  const [status, setStatus] = useState(true);
  const [showTips, setShowtips] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const handleSearch = (e, searchKeywordInput) => {
    if (e) e.preventDefault();
    if (searchKeywordInput.trim()) {
      setSearchKeyword(searchKeywordInput.trim());
    }
  };
  useEffect(() => {
    if (showTips && searchKeyword) setShowtips(!showTips);
    if (!showTips && !searchKeyword) setShowtips(!showTips);
  }, [searchKeyword]);

  return (
    <div>
      {userKeys && (userKeys.ext || userKeys.sec || userKeys.bunker) ? (
        <div
          className="fx-centered fit-container fx-start-h fx-col box-pad-v box-pad-h-m"
          style={{ gap: 0, minHeight: "100vh" }}
        >
          <div className="fit-container fx-centered fx-col fx-start-v box-pad-h-m">
            <ChatWindow
              message={searchKeyword}
              setMessage={setSearchKeyword}
              setStatus={setStatus}
            />
          </div>

          <InputField
            handleSearch={handleSearch}
            setSearchKeyword={setSearchKeyword}
            status={status}
          />
        </div>
      ) : (
        <PagePlaceholder page={"nostr-not-connected"} />
      )}
    </div>
  );
};

const ChatWindow = ({ message, setMessage, setStatus }) => {
  const userKeys = useSelector((state) => state.userKeys);
  const [messages, setMessages] = useState(getSavedConversation());
  const [loading, setLoading] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState("");
  const [stopSnapping, setStopSnapping] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    if (message) handleSend(message);
  }, [message]);

  useEffect(() => {
    if (containerRef.current && !stopSnapping) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom =
        Math.abs(
          container.scrollHeight - container.scrollTop - container.clientHeight
        ) <= 7;

      if (!atBottom) {
        setStopSnapping(true);
      } else {
        setStopSnapping(false);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef]);

  const handleSend = async (input) => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input, created_at: Date.now() },
    ];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);
    setStatus(false);
    try {
      const res = await getAnswerFromAIRemoteAPI(userKeys.pub, input);

      if (res.status) {
        const data = res.message;
        saveConversation(userKeys.pub, [
          ...newMessages,
          { role: "assistant", content: data, created_at: Date.now() },
        ]);
        animateTyping(data, newMessages);
      }
      if (!res.status) {
        const data = res.message;
        setQuotaMessage(data);
      }
      if (stopSnapping) setStopSnapping(false);
      setLoading(false);
      setStatus(true);
    } catch (err) {
      console.log(err);
      setStatus(true);
      setLoading(false);
    }
  };
  // const handleSend = async (input) => {
  //   if (!input.trim()) return;

  //   const newMessages = [
  //     ...messages,
  //     { role: "user", content: input, created_at: Date.now() },
  //   ];
  //   setMessages(newMessages);
  //   setMessage("");
  //   setLoading(true);
  //   setStatus(false);
  //   try {
  //     const res = await getAnswerFromAIRemoteAPI(userKeys.pub, input)
  //     // const res = await axios.post("https://yakiai.yakihonne.com/api/v1/ai", {
  //     //   input,
  //     // });

  //     // const data = res.data.message.content;
  //     // saveConversation(userKeys.pub, [
  //     //   ...newMessages,
  //     //   { role: "assistant", content: data, created_at: Date.now() },
  //     // ]);
  //     // if (stopSnapping) setStopSnapping(false);
  //     // setLoading(false);
  //     // animateTyping(data, newMessages);
  //   } catch (err) {
  //     console.log(err);
  //     setStatus(true);
  //     setLoading(false);
  //   }
  // };

  const animateTyping = (text, history) => {
    const words = text.split(" ");
    let index = 0;
    let current = "";

    const typing = () => {
      if (index < words.length) {
        current += (index === 0 ? "" : " ") + words[index++];
        setMessages([
          ...history,
          { role: "assistant", content: current, created_at: Date.now() },
        ]);
        setTimeout(typing, 30);
      } else {
        setLoading(false);
        setStatus(true);
      }
    };

    typing();
  };

  const handleCopyelement = (id) => {
    const codeRef = document.getElementById(id);
    if (!codeRef) return;
    const codeText = codeRef.innerText;
    copyText(codeText, t("AwszVHZ"));
  };

  return (
    <div className="chat-container">
      <div className="messages" ref={containerRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message-${msg.role}`}>
            <ReactMarkdown
              children={msg.content}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeRef = nanoid();
                  return !inline ? (
                    <pre style={{ padding: "1rem 0" }}>
                      <div
                        className="sc-s-18 box-pad-v-s box-pad-h-m fit-container fx-scattered"
                        style={{
                          borderBottomRightRadius: 0,
                          borderBottomLeftRadius: 0,
                          top: "0px",
                          position: "sticky",
                          border: "none",
                        }}
                      >
                        <p className="gray-c p-italic">
                          {match?.length > 0 ? match[1] : ""}
                        </p>
                        <div
                          className="copy pointer"
                          onClick={() => {
                            handleCopyelement(codeRef);
                          }}
                        ></div>
                      </div>
                      <code
                        className={`hljs ${className}`}
                        {...props}
                        id={codeRef}
                      >
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className="inline-code"
                      {...props}
                      style={{ margin: "1rem 0" }}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            />
          </div>
        ))}
        {loading && (
          <div
            className="sc-s box-pad-h-m box-pad-v-m"
            style={{ width: "60px", border: "none" }}
          >
            <LoadingDots />
          </div>
        )}
      </div>
      {quotaMessage && (
        <div
          className="fit-container fx-centered fx-start-h sc-s-18 box-pad-h box-pad-v box-marg-s slide-up"
          style={{
            position: "relative",
            backgroundColor: "var(--orange-side)",
            borderColor: "var(--c1)",
          }}
        >
          <div className="close" onClick={() => setQuotaMessage("")}>
            <div></div>
          </div>
          <div className="info"></div>
          <p className="c1-c">{t(quotaMessage)}</p>
        </div>
      )}
    </div>
  );
};

function InputField({ status = true, handleSearch }) {
  const [searchKeywordInput, setSearchKeywordInput] = useState("");
  const inputFieldRef = useRef(null);

  useEffect(() => {
    if (inputFieldRef.current) {
      inputFieldRef.current.style.height = "20px";
      inputFieldRef.current.style.height = `${inputFieldRef.current.scrollHeight}px`;
      inputFieldRef.current.scrollTop = inputFieldRef.current.scrollHeight;
      inputFieldRef.current.focus();
      const chatContainer = document.querySelector(".chat-container");
      if (chatContainer) {
        if (inputFieldRef.current.scrollHeight > 50)
          chatContainer.style.height = `calc(80vh - ${Math.min(
            inputFieldRef.current.scrollHeight - 50,
            200
          )}px)`;
        else chatContainer.style.height = "80vh";
      }
    }
  }, [searchKeywordInput]);

  useEffect(() => {
    if (status && inputFieldRef.current) inputFieldRef.current.focus();
  }, [status]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        setSearchKeywordInput("");
        handleSearch(e, searchKeywordInput);
      }
    }
  };

  const handleTyping = (e) => {
    let value = e.target.value;
    setSearchKeywordInput(value);
  };

  return (
    <div
      className="sc-s box-pad-h-s box-pad-v-s fx-centered fx-col sw-search-box fit-container"
      style={{
        cursor: status ? "unset" : "not-allowed",
        overflow: "visible",
      }}
      onClick={() => inputFieldRef?.current?.focus()}
    >
      <form
        onSubmit={(e) => {
          if (status) {
            setSearchKeywordInput("");
            handleSearch(e, searchKeywordInput);
          }
        }}
        style={{ position: "relative" }}
        className="fit-container"
      >
        <textarea
          type="text"
          className={`if ifs-full if-no-border ${status ? "" : "if-disabled"}`}
          value={searchKeywordInput}
          onChange={handleTyping}
          placeholder={t("AmClLqP")}
          ref={inputFieldRef}
          onKeyDown={handleKeyDown}
          disabled={!status}
          style={{
            padding: "1rem 0rem 1rem 1rem",
            height: "20px",
            maxHeight: "250px",
            borderRadius: 0,
          }}
        />
      </form>
      <div className="fit-container fx-scattered box-pad-h-m box-pad-v-m">
        <div className="fx-centered">
          <Link
            className={`sc-s box-pad-h-m box-pad-v-s ${
              status ? "option pointer" : "if-disabled"
            } fx-centered`}
            href={"/smart-widgets"}
          >
            <div className="search"></div>
            {t("AYZh36g")}
          </Link>
          <Link
            className={`sc-s box-pad-h-m box-pad-v-s ${
              status ? "option pointer" : "if-disabled"
            } fx-centered`}
            style={{
              backgroundColor: "var(--pale-gray)",
            }}
            href={"/sw-ai"}
          >
            <div className="ringbell"></div>
            {t("A6U9fNT")}
          </Link>
        </div>
        {status && (
          <div
            className="round-icon slide-up"
            style={{
              minWidth: "40px",
              minHeight: "40px",
              backgroundColor: "var(--c1)",
            }}
            onClick={() => {
              if (status) {
                setSearchKeywordInput("");
                handleSearch(undefined, searchKeywordInput);
              }
            }}
          >
            <div className="send"></div>
          </div>
        )}
      </div>
    </div>
  );
}
