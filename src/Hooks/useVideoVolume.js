import { setVideoVolume } from "@/Store/Slides/Extras";
import { useDispatch, useSelector } from "react-redux";

export default function useVideoVolume() {
  const dispatch = useDispatch();
  const videoVolume = useSelector((state) => state.videoVolume);

  const handleMutedVideos = (e) => {
    let state = e.currentTarget.muted;
    dispatch(setVideoVolume(state));
    if (!state) {
      localStorage.removeItem("video-volume");
    } else {
      localStorage.setItem("video-volume", Date.now());
    }
  };
  return { videoVolume, handleMutedVideos };
}
