import dynamic from "next/dynamic";
import HeadMetadata from "@/Components/HeadMetadata";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Explore/Explore"),
  {
    ssr: false,
  },
);

export default function index() {
  let data = {
    path: "explore",
    title: "Explore",
    description: "Explore new packs to follow",
    image:
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };
  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent />
    </div>
  );
}
