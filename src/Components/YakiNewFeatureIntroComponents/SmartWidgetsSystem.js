const urls = [
  "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/feature-1.png",
  "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/feature-2.png",
  "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/feature-3.png",
  "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/feature-4.png",
  "https://yakihonne.s3.ap-east-1.amazonaws.com/sw-thumbnails/feature-5.png",
];

const SmartWidgetsSystem = urls.map((url) => {
  return (
    <div
      key={url}
      className="fit-container fit-height box-pad-h fx-wrap bg-img cover-bg"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${url})`,
        aspectRatio: "16/9"
      }}
    ></div>
  );
});

export default SmartWidgetsSystem;
