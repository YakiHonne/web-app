import Link from "next/link";
import React from "react";
let s1 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/add-flash-news.png";
let s2 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/community-wallet.png";
let s3 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/flashNews-page.png";
let s4 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/flash-news-workflow.png";
let s5 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/sealed-misleading-note.png";
let s6 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/Uncensored-notes-page-rated-helpfful.png";
let s7 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/Uncensored-notes-page.png";
let s8 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/flashNews_payment.png";
let s9 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/writingRatingImpacts.png";
let s10 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/flashNews_page.png";
let s11 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes_page_new.png";
let s12 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes_page_newWEB.png";
let s13 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes-writing.png";
let s14 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes-rating.png";
let s15 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes_page_NeedsYourHelpWEB.png";
let s16 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/flashNewsPageWithHelpfulNote.png";
let s17 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotePageRatedHelpful.png";
let s18 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotePageRatedNotHelpful.png";
let s19 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes_ratingProcessWaitingClaim.png";
let s20 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotesMyRewardsNormalSATs.png";
let s21 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/un_authorrater_payment.png";
let s22 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNote_ratingImpact.png";
let s23 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNote_writingImpact.png";
let s24 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/uncensoredNotes_ratingProcess.png";
let s25 =
  "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/FN/writingRatingImpacts_.png";

export default function YakiFN() {
  return (
    <div
      className="fit-container fx-centered box-pad-h box-pad-v fx-start-v"
      style={{ backgroundColor: "black", minHeight: "100vh" }}
    >
      <div
        style={{ width: "min(100%,1000px)", rowGap: "24px", columnGap: "24px" }}
        className="fx-centered fx-col"
      >
        <div
          className="box-pad-h-s box-pad-v-s sc-s-18 fit-container fx-scattered"
          style={{
            backgroundColor: "#202020",
            position: "sticky",
            border: "none",
            top: "1rem",
            zIndex: 100,
            overflow: "visible",
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

          <div className="fx-centered">
            <Link
              href={"/verify-notes"}
              target={"_blank"}
              className="round-icon-tooltip"
              data-tooltip="Verify notes"
            >
              <button
                className="btn btn-normal fx-centered"
                style={{ padding: "1rem", height: "32px" }}
              >
                <div className="note" style={{ filter: "invert()" }}></div>
                {/* <span className="p-medium">Check Uncensored Notes</span> */}
              </button>
            </Link>
          </div>
        </div>

        <div
          className="fit-container fx-centered fx-stretch fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <h2 className="  p-centered box-pad-h" style={{ color: "white" }}>
            Introducing Flash News and Uncensored notes
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
              src="https://yakihonne.s3.ap-east-1.amazonaws.com/videos/fn-un-promo-video.mp4"
              type="video/mp4"
            />{" "}
            Your browser does not support HTML5 video.
          </video>
        </div>
        <div
          className="fit-container fx-centered fx-start-v fx-col fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <h3 className="  p-left fit-container" style={{ color: "white" }}>
            Flash News
          </h3>
          <p className="gray-c">
            Flash News is where we bring you timely and accurate information
            from trusted sources. In today's rapidly evolving world, staying
            informed is crucial, and our commitment is to deliver news that is
            both authentic and reliable. From global events to local
            developments, we strive to provide a snapshot of the most
            significant happenings, keeping you in the know. Our dedication to
            journalistic integrity ensures that you receive news from credible
            sources, empowering you to make well-informed decisions in an
            ever-changing landscape. Join us as we navigate the headlines
            together, offering a glimpse into the stories that shape our world.
          </p>
          <div
            className="fx-centered fx-end-v fit-container box-pad-v"
            style={{
              borderRadius: "var(--border-r-18)",
              backgroundColor: "#202020",
            }}
          >
            <img
              style={{ objectFit: "contain", width: "50%", height: "90%" }}
              src={s1}
            />
          </div>
          <h4 className="c1-c">
            1- Flash News (with no rated uncensored notes)
          </h4>
          <div className="fx-centered fx-col fx-start-v">
            <p className="  box-pad-h-m p-bold" style={{ color: "white" }}>
              A- Flash news publishing process
            </p>
            <p className="gray-c box-pad-h">
              I- Create a plain flash news or link the news to one of your
              articles/curations
            </p>
            <p className="gray-c box-pad-h">
              II. Add media files or links (preferable with known extensions){" "}
            </p>
            <p className="gray-c box-pad-h">
              III. Include the source of the news to convey that your news is
              authentic
            </p>
            <p className="gray-c box-pad-h">
              IV. Add relevant tags to categorize the flash news
            </p>
            <p className="gray-c box-pad-h">
              V. Flag the flash news as important or not (additional payment
              required)
            </p>
            <p className="gray-c box-pad-h">
              VI. Pay the overall amount for publishing the flash news
            </p>
            <p className="  box-pad-h-m p-bold" style={{ color: "white" }}>
              B- Flash news workflow
            </p>
            <p className="gray-c box-pad-h">
              I. Payments for the flash news publishing go directly to the funds
              pool used for the uncensored notes contributions{" "}
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "var(--gray)",
                }}
              >
                <img
                  style={{ objectFit: "contain", width: "50%", height: "100%" }}
                  src={s2}
                />
              </div>
            </div>
            <p className="gray-c box-pad-h">
              II. Chronologically ordered flash news based on date and time,
              with the ability to select a specific date{" "}
            </p>
            <p className="gray-c box-pad-h">
              III. Users can toggle between existing flash news only or view all
              dates at once, including dates with no flash news
            </p>
            <p className="gray-c box-pad-h">
              IV. Users can toggle only important flash news to keep track of
              what is highlighted
            </p>
            <p className="gray-c box-pad-h">
              V. Users can view their notes on the “My Flash News” tab and
              delete their flash news if desired
            </p>
            <p className="gray-c box-pad-h">
              VI. Users are not allowed to alter flash news to prevent news
              manipulation
            </p>
            <p className="gray-c box-pad-h">
              VII. Users can zap, bookmark, upvote/downvote the flash flash
              based on their point of view
            </p>
            <p className="gray-c box-pad-h">
              VIII. Users can view the original source of the flash news if it
              is added by the author
            </p>
            <div className="box-pad-h fx-centered fit-container box-pad-v-m fx-stretch">
              <div
                className="fx-centered fx-end-v fx box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "var(--c1)",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s3}
                />
              </div>
              <div
                className="fx-centered fx-end-v fx box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                  flex: 2,
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s4}
                />
              </div>
            </div>
          </div>
          <h4 className="c1-c">2- Flash News (with rated uncensored notes)</h4>
          <div className="fx-centered fx-col fx-start-v">
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              A- Each flash news may have a verified and rated uncensored note
              that assesses the flash news as misleading and provides false
              information.
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{ objectFit: "contain", width: "50%", height: "100%" }}
                  src={s5}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              B- Community reviews determine whether both the flash news and the
              uncensored note are sealed, based on their perceived helpfulness
              (whether misleading or not) or lack of helpfulness altogether.
            </p>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              C- If the rated helpful uncensored note contradicts the original
              flash news, labeling it as misleading, it will be attached to the
              related flash news. Users can then view all notes (sealed helpful
              or deemed unhelpful) contributed by the community.
            </p>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              D- Similar to flash news, the uncensored note associated with it
              may include a valid source that contradicts the original flash
              news source.
            </p>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              E- A flash news might feature a rated helpful uncensored note
              asserting the flash news is accurate and authentic. This note is
              not visible within the flash news page but can be accessed by
              viewing the flash news itself.
            </p>
            <div className="box-pad-h fx-centered fit-container box-pad-v-m fx-stretch">
              <div
                className="fx-centered fx-end-v fx box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                  flex: 2,
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s7}
                />
              </div>
            </div>
            <div className="box-pad-h fx-centered fit-container fx-stretch">
              <div
                className="fx-centered fx-end-v fx box-pad-h box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "var(--c1)",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s6}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="fit-container fx-centered fx-start-v fx-col fx-wrap"
          style={{ rowGap: "24px", columnGap: "24px" }}
        >
          <h3 className="  p-left fit-container" style={{ color: "white" }}>
            Uncensored Notes
          </h3>
          <p className="gray-c">
            Introducing Uncensored Notes, a revolutionary feature where the
            power of community collaboration meets real-world news verification.
            In an age of rapid information dissemination, YakiHonne uncensored
            notes was inspired from the Twitter “Community Notes” to empower
            users to actively participate in verifying the authenticity of
            published news all while using the Nostr Protocol. Here, users play
            a vital role as contributors by adding notes to existing flash news,
            offering valuable insights, context, or additional evidence that
            either supports or questions the veracity of the information and
            getting rewarded for that.
          </p>
          <p className="gray-c">
            Our commitment to transparency and accuracy sets us apart. By
            harnessing the collective wisdom of our community, we create a
            dynamic environment inspired from the Twitter “Community Notes”
            where users contribute to the ongoing validation of the flash news.
            This collaborative effort not only enhances the credibility of news
            but also fosters a sense of shared responsibility and benefits in
            ensuring the dissemination of accurate information.
          </p>
          <h4 className="c1-c">1- Uncensored Notes</h4>
          <div className="fx-centered fx-col fx-start-v">
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              A- Uncensored notes contributors receive funds mainly from the
              flash news publishers
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{ objectFit: "contain", width: "50%", height: "100%" }}
                  src={s8}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              B- Each user has an associated writing impact and rating impact,
              which are updated based on their activities related to the
              uncensored notes.
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{ objectFit: "contain", width: "50%", height: "100%" }}
                  src={s9}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              C- Simply put, flash news publishers support the uncensored notes
              contributors to prove their news are correct and beneficial or not
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{ objectFit: "contain", width: "50%", height: "100%" }}
                  src={s10}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              D- The published flash news goes straight to the new tab within
              the uncensored notes page for contributor to view and validate
            </p>
            <div className="box-pad-h fx-centered fit-container box-pad-v-m fx-stretch">
              <div
                className="fx-centered fx-end-v fx box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                  flex: 2,
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s12}
                />
              </div>
              <div
                className="fx-centered fx-end-v fx box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "var(--c1)",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s11}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              E- The validation is achieved based on 2 factors: uncensored notes
              and ratings
            </p>
            <p className="gray-c box-pad-h">
              I- Contributors have the ability to write a single uncensored note
              to a published flash news with the ability to flag the flash news
              as misleading or not
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s13}
                />
              </div>
            </div>
            <p className="gray-c box-pad-h">
              II. The uncensored notes will then be rated based on raters
              judgement whether they think this uncensored notes is helpful or
              not (whether it says the flash news is misleading or not)
            </p>
            <div className="box-pad-h fit-container box-pad-v">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s14}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              F- Based on the initial raters threshold, the flash news and its
              associated uncensored notes will jump from the new tab to the need
              your help tab where raters can view all uncensored notes that need
              rating and close from reaching the final status (helpful or not)
            </p>
            <div className="box-pad-h fit-container box-pad-v-m">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s15}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              F- Based on the overall raters that agrees whether the associated
              uncensored note is helpful or not, the final status of the
              uncensored note and the flash news it belongs to will be
              determined:
            </p>
            <p className="gray-c box-pad-h">
              I- If the uncensored note final status is helpful and says that
              the flash news is misleading, it will consider the flash news
              sealed and show the associated uncensored note within the flash
              news page and the uncensored notes “Rated helpful” tab. However,
              If it says the flash news is not misleading then it won’t show up
              and the flash news is considered sealed, while it stays viewable
              within the “Rated helpful” tab
            </p>
            <div className="box-pad-h fit-container box-pad-v">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s16}
                />
              </div>
            </div>
            <div className="box-pad-h fit-container">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s17}
                />
              </div>
            </div>
            <p className="gray-c box-pad-h">
              II- If the uncensored note final status is not helpful, then the
              flash news will not be considered sealed and will wait for the
              next uncensored note to catch the final status
            </p>
            <div className="box-pad-h fit-container">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s18}
                />
              </div>
            </div>
            <p className="gray-c box-pad-h">
              III- At the current time, only a single uncensored note is
              considered a final status of a flash news meaning the first
              uncensored note reaches the final status it will be considered the
              sealing trigger. Later on, uncensored notes can be overtaken or
              overturn.
            </p>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              H- All uncensored notes writers and raters (until the flash news
              does not have a sealed uncensored note) will be incentivized by a
              portion of SATs sent automatically to the my rewards tab whenever
              a user writes an uncensored note or a user rates one the only
              different is that the raters needs to wait 5m countdown to claim
              their SATs while the writers can directly claim their initial SATs
              rewards.
            </p>
            <div className="box-pad-h-m fit-container box-pad-v">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s19}
                />
              </div>
            </div>
            <div className="box-pad-h-m fit-container">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s20}
                />
              </div>
            </div>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              I- When a flash news reaches the final status by having a sealed
              uncensored note, both the author of the uncensored notes and its
              raters which their rate matches the final status of the uncensored
              note (Helpful or Not Helpful) will be rewarded by a predetermined
              portion of SATs.
            </p>
            <div className="box-pad-h-m fit-container">
              <div
                className="fx-centered fx-end-v fit-container box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s21}
                />
              </div>
            </div>
          </div>
          <h4 className="c1-c">
            2- Upon the sealing of the uncensored note all related entities
            whether the raters or the author of the uncensored notes will
            receive an update for their impact attributes:{" "}
          </h4>

          <div className="fx-centered fx-col fx-start-v">
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              A- If the uncensored note is sealed as a helpful note:
            </p>
            <p className="gray-c box-pad-h">
              I. The writing impact of the uncensored note author will increase
            </p>
            <p className="gray-c box-pad-h">
              II. The rating impact of the uncensored note raters that have a
              rating matches the final status of the note will increase
            </p>
            <p className="gray-c box-pad-h">
              III. The rating impact of the uncensored note raters that have a
              rating contradict the final status of the note will decrease
            </p>
            <p className="  box-pad-h-m" style={{ color: "white" }}>
              B- If the uncensored note is sealed as a not helpful note:
            </p>
            <p className="gray-c box-pad-h">
              I. The writing impact of the uncensored note author will decrease
            </p>
            <p className="gray-c box-pad-h">
              II. The rating impact of the uncensored note raters that have a
              rating matches the final status of the note will increase
            </p>
            <p className="gray-c box-pad-h">
              III. The rating impact of the uncensored note raters that have a
              rating contradicts the final status of the note will twice
              decrease (supporting low-quality notes)
            </p>
            <div className="box-pad-h fx-centered fit-container box-pad-v-m fx-stretch">
              <div
                className="fx-centered fx-end-v fx box-pad-v"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "var(--c1)",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s22}
                />
              </div>
              <div
                className="fx-centered fx-end-v fx box-pad-v box-pad-h"
                style={{
                  borderRadius: "var(--border-r-18)",
                  backgroundColor: "#202020",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  src={s23}
                />
              </div>
            </div>
          </div>
          <h4 className="c1-c">
            3- Raters will have a countdown of 5 minutes to change their
            judgement on an uncensored note after the countdown is finished it
            is not possible to edit the rate
          </h4>
          <div className="fit-container box-pad-v-m">
            <div
              className="fx-centered fx-end-v fit-container box-pad-v"
              style={{
                borderRadius: "var(--border-r-18)",
                backgroundColor: "#202020",
              }}
            >
              <img
                style={{ objectFit: "contain", width: "50%", height: "100%" }}
                src={s24}
              />
            </div>
          </div>
          <h4 className="c1-c">
            4- At the current time, users can write only a single uncensored
            note to each flash news, with no ability to rate their written
            notes. Later on, changes may be applied for restricting the maximum
            number of uncensored notes that can be written in a day based on
            both writing and rating impacts
          </h4>
          <h4 className="c1-c">
            5- Writing and Rating impacts are viewable from the user profile
            page, where others can determine the credibility of each user
          </h4>
          <div className="fit-container box-pad-v-m">
            <div
              className="fx-centered fx-end-v fit-container box-pad-v"
              style={{
                borderRadius: "var(--border-r-18)",
                backgroundColor: "#202020",
              }}
            >
              <img
                style={{ objectFit: "contain", width: "50%", height: "100%" }}
                src={s25}
              />
            </div>
          </div>
          <h4 className="c1-c">
            6- Users will not be able to delete the uncensored notes they wrote,
            and if deleted from elsewhere the associated flash news will be
            considered ignored
          </h4>
          <p className=" " style={{ color: "white" }}>
            Join us in redefining how news is verified to uphold the standards
            of truth and authenticity in the ever-evolving landscape of global
            information. All while guaranteeing the decentralization of global
            information via the nostr protocol.
          </p>
        </div>
      </div>
    </div>
  );
}
