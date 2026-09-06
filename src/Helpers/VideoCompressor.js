const MIN_SIZE_TO_COMPRESS = 2 * 1024 * 1024;
const MAX_HEIGHT = 1080;

export const canCompressVideo = () => {
  if (typeof window === "undefined") return false;
  return (
    typeof window.VideoEncoder !== "undefined" &&
    typeof window.VideoDecoder !== "undefined"
  );
};

export const shouldCompressVideo = (file) => {
  if (!file || !canCompressVideo()) return false;
  return file.size >= MIN_SIZE_TO_COMPRESS;
};

export const compressVideoFile = async (file, onProgress) => {
  try {
    if (!shouldCompressVideo(file)) return false;

    const {
      ALL_FORMATS,
      BlobSource,
      BufferTarget,
      Conversion,
      Input,
      Mp4OutputFormat,
      Output,
      QUALITY_HIGH,
      canEncodeVideo,
    } = await import("mediabunny");

    const isCodecSupported = await canEncodeVideo("avc");
    if (!isCodecSupported) return false;

    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) return false;

    const height = videoTrack.displayHeight;
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new BufferTarget(),
    });

    const conversion = await Conversion.init({
      input,
      output,
      video: {
        codec: "avc",
        quality: QUALITY_HIGH,
        height: height > MAX_HEIGHT ? MAX_HEIGHT : undefined,
      },
      audio: { codec: "aac", forceTranscode: false },
    });

    if (!conversion.isValid) return false;

    if (onProgress) {
      onProgress(1);
      conversion.onProgress = (progress) => {
        onProgress(Math.max(1, Math.round(progress * 100)));
      };
    }

    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer) return false;

    const compressed = new File([buffer], "compressed.mp4", {
      type: "video/mp4",
    });
    if (compressed.size >= file.size) return false;

    return compressed;
  } catch (err) {
    console.log(err);
    return false;
  }
};
