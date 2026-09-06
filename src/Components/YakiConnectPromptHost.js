import React from "react";
import { useDispatch, useSelector } from "react-redux";
import LoginWithAPI from "@/Components/LoginWithAPI";
import { closeYakiConnectPrompt } from "@/Store/Slides/YakiChest";

export default function YakiConnectPromptHost() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.yakiConnectPrompt?.open);

  if (!isOpen) return null;

  return <LoginWithAPI exit={() => dispatch(closeYakiConnectPrompt())} />;
}
