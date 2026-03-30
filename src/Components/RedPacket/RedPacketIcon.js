import { motion } from "framer-motion";

export const RedPacketIcon = ({ isOwner, enableClick }) => {
  const animate = !isOwner && enableClick;
  return (
    <motion.div
      animate={
        !animate
          ? false
          : {
              rotate: [0, -5, 5, -5, 5, 0],
            }
      }
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
      style={{
        width: "60px",
        aspectRatio: "9/11",
        backgroundColor: "var(--c1)",
        borderRadius: "8px",
        position: "relative",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "45%",
          backgroundColor: "rgba(0,0,0,0.12)",
          borderBottomLeftRadius: "50% 25%",
          borderBottomRightRadius: "50% 25%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            backgroundColor: "#FFD700",
            borderRadius: "50%",
            position: "absolute",
            bottom: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            border: "2px solid rgba(255,255,255,0.2)",
            zIndex: 3,
          }}
        />
      </div>
      {/* Decorative Sheen */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "-20%",
          width: "140%",
          height: "30%",
          backgroundColor: "rgba(255,255,255,0.03)",
          borderRadius: "50%",
          transform: "rotate(-8deg)",
          zIndex: 1,
        }}
      />
    </motion.div>
  );
};
