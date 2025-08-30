import React, { useState } from "react";
import Footer from "@/Components/Footer";
import Link from "next/link";

let icon1 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/no-code.svg";
let icon2 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/interact-with-widgets.svg";
let icon3 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/component-flexibility.svg";
let icon4 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/layered-validation.svg";
let icon5 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/easy-linking.svg";
let icon6 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/icons/nostr-compatible.svg";

const features = [
  {
    icon: icon1,
    title: "No Code Required",
    desc: "Easily create and customize widgets visually without any coding skills.",
  },
  {
    icon: icon2,
    title: "Interact with widgets",
    desc: "Intuitive controls, allowing you to easily input data, make redirections, and navigate content.",
  },
  {
    icon: icon3,
    title: "Component Flexibility",
    desc: "Mix and match various components to build tailored widgets experiences.",
  },
  {
    icon: icon4,
    title: "Layered Validation",
    desc: "Ensure accuracy with built-in tools that check the integrity of widget components.",
  },
  {
    icon: icon5,
    title: "Easy linking",
    desc: "Link smart widgets to any piece of content easily with its unique identifier.",
  },
  {
    icon: icon6,
    title: "Nostr compatible",
    desc: "Cross-client compatibility with the nostr protocol for a unified experience.",
  },
];

const templates = [
  {
    url: "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-videos/user-engagement-template-demo.mp4",
    title: "User Engagement",
    desc: "This smart widget enhances user experiences and drive active participation with features that keep your audience engaged and invested.",
  },
  {
    url: "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-videos/bitcoin-finance-template-demo.mp4",
    title: "Bitcoin Finance",
    desc: "This smart widget unlocks the potentials of Bitcoin finance, featuring Lightning Network transactions and Nostr-oriented actions.",
  },
  {
    url: "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-videos/product-growth-template-demo.mp4",
    title: "Product Growth",
    desc: "This smart widget accelerates product growth, equipped with crowdfunding capabilities and instant dynamic redirections. Seamlessly direct users to key actions with real-time flexibility.",
  },
  {
    url: "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-videos/governance-template-demo.mp4",
    title: "Governance",
    desc: "This smart widget empowers communities to express their collective voice, facilitating transparent decision-making and strengthening community governance.",
  },
];

const FAQs = [
  {
    title: "What are Smart Widgets and how do they work?",
    desc: "Smart Widgets are customizable interactive set of components that embed seamlessly into your content. They offer various functionalities such as transactional actions, user engagement features, and dynamic interactions, making it easier to enhance your audience experience and achieve your goals.",
  },
  {
    title: "How do I customize a Smart Widget for my needs?",
    desc: "Customizing a Smart Widget is simple with our intuitive design tools. You can create new widgets or select from our pre-designed templates, and tailor the widget’s appearance and functionality to match your specific requirements and branding.",
  },
  {
    title: "Can Smart Widgets integrate with other clients or services?",
    desc: "Yes, Smart Widgets are designed for nostr compatibility with various clients and services. They support integrations of social media links, and financial networks like the Lightning Network, enabling you to create a cohesive and versatile user experience.",
  },
  {
    title:
      "What kind of support is available if I encounter issues with Smart Widgets?",
    desc: "Our dedicated support team is here to help you with any issues or questions you may have. We offer comprehensive documentation, tutorials, and responsive customer service to ensure you get the most out of your Smart Widgets.",
  },
];

export default function YakiSmartWidgets() {
  const [selectedFaq, setSelectedFaq] = useState(false);

  return (
    <div
      className="fit-container fx-centered box-pad-h  fx-start-v"
      style={{ backgroundColor: "black", minHeight: "100vh" }}
    >
      <div
        style={{ width: "min(100%,1200px)", rowGap: "24px", columnGap: "24px" }}
        className="fx-centered fx-col"
      >
        <div
          className="box-pad-h-s box-pad-v-s sc-s-18 fit-container fx-centered"
          style={{
            backgroundColor: "#202020",
            position: "sticky",
            border: "none",
            top: "1rem",
            zIndex: 100,
          }}
        >
          <Link href={"/"} className="fx-centered">
            <div
              className="yakihonne-logo"
              style={{
                filter: "brightness(0) invert()",
                width: "128px",
                height: "48px",
              }}
            ></div>
          </Link>
        </div>
        <h2 style={{ color: "white" }} className="box-pad-v">
          Introducing Smart Widgets
        </h2>
        <video
          autoPlay="autoplay"
          loop="loop"
          muted
          playsInline
          onContextMenu={() => {
            return false;
          }}
          preload="auto"
          id="myVideo"
          // controls={false}

          // autoPlay muted loop id="myVideo"
          style={{
            position: "relative",
            border: "none",
            zIndex: "0",
            borderRadius: "var(--border-r-18)",
          }}
          className="fit-container"
          // src={
          //   "https://yakihonne.s3.ap-east-1.amazonaws.com/video/yakihonne-mobile-app-promo.mp4"
          // }
        >
          <source
            src="https://yakihonne.s3.ap-east-1.amazonaws.com/sw-videos/smart-widgets.mp4"
            type="video/mp4"
          />{" "}
          Your browser does not support HTML5 video.
        </video>
        <div className="fx-centered fx-col">
          <p className="gray-c p-centered p-big" style={{ maxWidth: "1000px" }}>
            Discover the power of Smart Widgets, designed to enhance your user
            experience with unparalleled ease and efficiency. Our Smart Widgets
            offer seamless integration, allowing you to customize and deploy
            interactive components effortlessly.
          </p>
          <button className="btn btn-normal bt-small">Get started</button>
        </div>

        <div
          className="fit-container fx-centered fx-stretch fx-wrap box-pad-v box-pad-h fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          {features.map((feature, index) => {
            return (
              <div
                key={index}
                className="fx-scattered fx-col fx fx-stretch box-pad-h box-pad-v fx-start-h fx-start-v sc-s-18 option"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "transparent",
                  borderColor: "#444444",
                  flex: "1 1 350px",
                }}
              >
                <div className="fx-centered fit-container fx-start-h box-pad-v-s">
                  <div
                    style={{
                      minWidth: "42px",
                      minHeight: "42px",
                      filter: "brightness(30%) invert()",
                      backgroundImage: `url(${feature.icon})`,
                      backgroundPosition: "center center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                    }}
                  ></div>
                </div>
                <h4 style={{ color: "white" }}>{feature.title}</h4>
                <p style={{ color: "var(--gray)" }}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
        <div
          className="fx-centered fx-col sc-s box-pad-v-m"
          style={{ backgroundColor: "#101010", borderColor: "#444444" }}
        >
          <div className="box-pad-v-m"></div>
          <h3 style={{ color: "white" }} className="box-marg-s">
            Ready-to-use templates
          </h3>
          <div className="fx-centered fx-col">
            <p
              className="gray-c p-centered p-big"
              style={{ maxWidth: "1000px" }}
            >
              Simplify your Smart Widget publishing with our pre-designed
              templates. These ready-to-use templates are crafted to help you
              get your widgets live faster and more efficiently, eliminating the
              need for extensive customization.
            </p>
          </div>
          <div
            className="fit-container fx-centered  fx-wrap box-pad-v box-pad-h"
            style={{
              rowGap: "0px",
              columnGap: "24px",
              //   width: "min(100%, 1000px)",
            }}
          >
            {templates.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="fx-scattered fx-col fx  box-pad-h box-pad-v fx-start-h fx-start-v"
                  style={{
                    borderRadius: "var(--border-r-18)",
                    backgroundColor: "transparent",
                    borderColor: "#444444",
                    flex: "1 1 400px",
                  }}
                >
                  <video
                    controls={true}
                    autoPlay={false}
                    name="media"
                    width={"100%"}
                    className="sc-s-18"
                    style={{
                      margin: "1rem auto",
                      aspectRatio: "16/9",
                      borderColor: "#222222",
                    }}
                  >
                    <source src={feature.url} type="video/mp4" /> Your browser
                    does not support HTML5 video.
                  </video>
                  <p style={{ color: "white" }}>{feature.title}</p>
                  <p style={{ color: "var(--gray)" }}>{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fit-container fx-centered  fx-start-h box-pad-v-m">
          <h3 style={{ color: "white" }}>Frequently asked questions</h3>
        </div>
        <div className="fx-centered fx-col fit-container box-marg-s">
          {FAQs.map((feature, index) => {
            return (
              <div
                key={index}
                className="fx-centered fx-col sc-s-18 option pointer box-pad-h box-pad-v-m fit-container"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                  borderColor: "#444444",
                }}
                onClick={() =>
                  selectedFaq === index
                    ? setSelectedFaq(false)
                    : setSelectedFaq(index)
                }
              >
                <div className="fit-container fx-scattered">
                  <p style={{ color: "white" }}>{feature.title}</p>
                  <div
                    className="arrow"
                    style={{ filter: "brightness(0) invert()" }}
                  ></div>
                </div>
                {selectedFaq === index && (
                  <div className="fit-container">
                    <p style={{ color: "var(--gray)" }}>{feature.desc}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="fx-centered">
          <Link href={"/smart-widgets"}>
            <button className="btn btn-orange fx-centered">
              <div
                className="smart-widget-24"
                style={{ filter: "brightness(0) invert()" }}
              ></div>{" "}
              /Community smart widgets
            </button>
          </Link>
          <Link href={"/smart-widget-builder"}>
            <button className="btn btn-normal">Get started now</button>
          </Link>
        </div>
        <div
          className="fit-container box-pad-v"
          style={{ filter: "brightness(0) invert()" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}
