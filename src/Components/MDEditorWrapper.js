import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

const MDEditorWrapper = ({
  direction,
  dataColorMode,
  preview,
  height,
  width,
  value,
  onChange,
  selectedTab,
  setSelectedTab,
  execute,
}) => {
  const [commands, setCommands] = useState(null);
  const [editorCommands, setEditorCommands] = useState(null);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;

      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();

            const reader = new FileReader();
            reader.onload = async (e) => {
              let fileName = await execute(file);
              if (fileName) {
                onChange(
                  value
                    ? value + ` ![image](${fileName})`
                    : `![image](${fileName})`
                );
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [value]);

  useEffect(() => {
    const loadCommands = async () => {
      try {
        const mdEditorModule = await import("@uiw/react-md-editor");
        const {
          commands,
          bold,
          italic,
          strikethrough,
          hr,
          link,
          quote,
          code,
          codeBlock,
          unorderedListCommand,
          orderedListCommand,
          checkedListCommand,
          comment,
          divider,
        } = mdEditorModule;

        setCommands({
          commands,
          bold,
          italic,
          strikethrough,
          hr,
          link,
          quote,
          code,
          codeBlock,
          unorderedListCommand,
          orderedListCommand,
          checkedListCommand,
          comment,
          divider,
        });
      } catch (error) {
        console.error("Failed to load MDEditor commands:", error);
      }
    };

    loadCommands();
  }, []);

  useEffect(() => {
    if (!commands) return;

    const {
      bold,
      italic,
      strikethrough,
      hr,
      link,
      quote,
      code,
      codeBlock,
      unorderedListCommand,
      orderedListCommand,
      checkedListCommand,
      comment,
      divider,
    } = commands;

    const customCommands = [
      commands.commands.group([], {
        name: "ltr",
        icon: (
          <svg
            fill="none"
            height="18"
            width="18"
            stroke={selectedTab === 0 ? "var(--c1)" : "currentColor"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0h24v24H0z" fill="none" stroke="none" />
            <path d="M5 19h14" />
            <path d="M17 21l2 -2l-2 -2" />
            <path d="M16 4h-6.5a3.5 3.5 0 0 0 0 7h.5" />
            <path d="M14 15v-11" />
            <path d="M10 15v-11" />
          </svg>
        ),
        execute: async (state, api) => {
          setSelectedTab(0);
        },
        buttonProps: {
          "aria-label": "LTR",
          title: "LTR",
        },
      }),
      commands.commands.group([], {
        name: "rtl",
        icon: (
          <svg
            fill="none"
            height="18"
            width="18"
            stroke={selectedTab === 1 ? "var(--c1)" : "currentColor"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0h24v24H0z" fill="none" stroke="none" />
            <path d="M16 4h-6.5a3.5 3.5 0 0 0 0 7h.5" />
            <path d="M14 15v-11" />
            <path d="M10 15v-11" />
            <path d="M5 19h14" />
            <path d="M7 21l-2 -2l2 -2" />
          </svg>
        ),
        execute: async (state, api) => {
          setSelectedTab(1);
        },
        buttonProps: {
          "aria-label": "RTL",
          title: "RTL",
        },
      }),
      divider,
      bold,
      italic,
      strikethrough,
      hr,
      commands.commands.group(
        [
          commands.commands.title1,
          commands.commands.title2,
          commands.commands.title3,
          commands.commands.title4,
          commands.commands.title5,
          commands.commands.title6,
        ],
        {
          name: "title",
          groupName: "title",
          buttonProps: {
            "aria-label": "Insert title",
            title: "Insert title",
          },
        }
      ),
      {
        ...link,
        execute: (state, api) => {
          const linkText = "URL here";
          let modifyText = `[](${linkText})`;
          if (state.selectedText) {
            modifyText = `[](${state.selectedText})`;
          }
          let cursorPosition = api.textArea.selectionStart + 3;
          api.replaceSelection(modifyText);
          api.setSelectionRange({
            start: cursorPosition,
            end: state.selectedText
              ? state.selectedText.length + cursorPosition
              : cursorPosition + 8,
          });
        },
      },
      quote,
      code,
      codeBlock,
      commands.commands.group([], {
        name: "functions",
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M11.9912 7.54323C12.1318 7.3645 12.197 7.13946 12.3125 6.94634C12.4288 6.75208 12.3625 6.71678 12.1662 6.7182C11.3901 6.72469 10.6136 6.71509 9.83741 6.72384C9.63044 6.72638 9.55957 6.68093 9.5991 6.45476C9.77105 5.47331 9.93623 4.49072 10.1864 3.52564C10.3343 2.95416 10.4925 2.3824 10.8084 1.87332C11.1232 1.36565 11.5617 1.23379 12.1016 1.49638C12.5528 1.71548 12.9198 2.04301 13.2228 2.44085C13.3552 2.61478 13.5294 2.75115 13.7313 2.6351C14.1201 2.41148 14.4615 2.13873 14.6594 1.69939C14.7738 1.44527 14.8381 1.16038 14.7052 0.900052C14.5205 0.539207 14.1791 0.287631 13.8042 0.148996C13.1813 -0.0811203 12.5082 -0.0269088 11.8907 0.19022C11.178 0.440666 10.4939 0.854594 9.90037 1.31878C9.68127 1.49017 9.46866 1.67144 9.26819 1.86485C8.53096 2.57553 7.98236 3.42117 7.5961 4.3679C7.32165 5.04102 7.10255 5.7277 6.99215 6.44742C6.9721 6.57984 6.92918 6.69843 6.78292 6.72102C6.6025 6.74897 6.38961 6.72158 6.20636 6.72215C5.79611 6.72328 5.37117 6.63547 5.06735 6.99095C4.93211 7.14906 4.78952 7.33344 4.67376 7.5068C4.5594 7.67876 4.56816 7.84676 4.77004 7.92299C4.99168 8.00629 5.28279 7.95264 5.50952 7.9453C5.80909 7.9357 6.10867 7.95094 6.40824 7.94445C6.61436 7.94021 6.68156 7.9789 6.64203 8.21155C6.6042 8.43715 6.55987 8.65287 6.52683 8.87621C6.41361 9.64393 6.28486 10.4097 6.15554 11.1751C5.97568 12.2368 5.79836 13.2993 5.60411 14.3592C5.4186 15.3717 5.28702 16.3935 5.05775 17.3996C4.87874 18.1868 4.76439 18.9892 4.5738 19.7733C4.41399 20.4306 4.27733 21.1026 3.9131 21.6939C3.64797 22.1242 3.26059 22.306 2.77409 22.1911C2.33419 22.0863 1.91941 21.9209 1.56111 21.6292C1.3245 21.4363 1.054 21.2926 0.764877 21.4587C0.492972 21.6148 0.297302 21.9045 0.147091 22.1722C-0.335166 23.0325 0.451748 23.8502 1.30106 23.9798C1.87141 24.0665 2.43414 23.8618 2.93532 23.6079C3.60449 23.2688 4.18275 22.7919 4.66783 22.2295C5.06538 21.7684 5.48185 21.3288 5.81305 20.8155C6.03384 20.473 6.23629 20.1189 6.42067 19.7561C7.07431 18.4683 7.48062 17.0785 7.81605 15.6795C7.97727 15.0066 8.1529 14.338 8.3017 13.6621C8.50442 12.7425 8.67129 11.8073 8.8232 10.8781C8.89859 10.417 8.96212 9.95677 9.0584 9.49936C9.13774 9.12214 9.20353 8.73136 9.25435 8.34962C9.31364 7.90548 9.59543 7.93316 9.97971 7.8908C10.3039 7.85494 10.6303 7.83829 10.9555 7.81429C11.2164 7.79537 11.516 7.8188 11.7616 7.71461C11.8494 7.67734 11.9288 7.62313 11.9912 7.54323Z"
              fill="currentColor"
            />
          </svg>
        ),
        execute: async (state, api) => {
          let modifyText = "`$$" + state.selectedText + "$$`";
          if (!state.selectedText) {
            modifyText = "`$$f(x) = 1^1_2$$`";
          }
          api.replaceSelection(modifyText);
        },
        buttonProps: {
          "aria-label": "Insert function",
          title: "Insert function",
        },
      }),
      comment,
      commands.commands.group([], {
        name: "image",
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.66992 18.9501L7.59992 15.6401C8.38992 15.1101 9.52992 15.1701 10.2399 15.7801L10.5699 16.0701C11.3499 16.7401 12.6099 16.7401 13.3899 16.0701L17.5499 12.5001C18.3299 11.8301 19.5899 11.8301 20.3699 12.5001L21.9999 13.9001"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5138 4.72471C19.2362 5.67443 19.0524 7.02699 18.1031 7.74568C17.1539 8.46437 15.8009 8.28423 15.0822 7.33502C14.3635 6.38581 14.5436 5.03275 15.4928 4.31405"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.4704 5.518C16.7191 4.5303 16.911 3.11828 17.8992 2.36326C18.8874 1.60824 20.2989 1.8039 21.054 2.79211C21.809 3.78031 21.6133 5.19182 20.6251 5.94684"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        execute: async (state, api) => {
          api.replaceSelection(`![image](${state.selectedText})`);
        },
        buttonProps: {
          "aria-label": "Insert image",
          title: "Insert image",
        },
      }),
      commands.commands.group([], {
        name: "update",
        icon: (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 8V2L20 4"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 2L16 4"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.66992 18.9501L7.59992 15.6401C8.38992 15.1101 9.52992 15.1701 10.2399 15.7801L10.5699 16.0701C11.3499 16.7401 12.6099 16.7401 13.3899 16.0701L17.5499 12.5001C18.3299 11.8301 19.5899 11.8301 20.3699 12.5001L21.9999 13.9001"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        execute: async (state, api) => {
          let file = await execute();
          if (
            file &&
            /(https?:\/\/[^ ]*\.(?:gif|png|jpg|jpeg|webp|tiff))/i.test(file)
          )
            api.replaceSelection(`![image](${file})`);
          else if (/(https?:\/\/[^ ]*\.(?:mp4|mov))/i.test(file))
            api.replaceSelection(`<video src="${file}" controls></video>`);
          else api.replaceSelection(file);
        },
        buttonProps: {
          "aria-label": "Upload image",
          title: "Upload image",
        },
      }),
      unorderedListCommand,
      orderedListCommand,
      checkedListCommand,
    ];

    setEditorCommands(customCommands);
  }, [commands, selectedTab, setSelectedTab, execute]);

  if (!commands || !editorCommands) {
    return <div></div>;
  }

  return (
    <MDEditor
      direction={direction}
      data-color-mode={dataColorMode}
      preview={preview}
      height={height}
      width={width}
      value={value}
      onChange={onChange}
      commands={editorCommands}
      previewOptions={{
        components: {
          p: ({ children }) => {
            return <p>{children}</p>;
          },
          h1: ({ children }) => {
            return <h1 dir="auto">{children}</h1>;
          },
          h2: ({ children }) => {
            return <h2 dir="auto">{children}</h2>;
          },
          h3: ({ children }) => {
            return <h3 dir="auto">{children}</h3>;
          },
          h4: ({ children }) => {
            return <h4 dir="auto">{children}</h4>;
          },
          h5: ({ children }) => {
            return <h5 dir="auto">{children}</h5>;
          },
          h6: ({ children }) => {
            return <h6 dir="auto">{children}</h6>;
          },
          li: ({ children }) => {
            return <li dir="auto">{children}</li>;
          },
        },
      }}
    />
  );
};

export default MDEditorWrapper;
