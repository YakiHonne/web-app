import dynamic from "next/dynamic";
import HeadMetadata from "@/Components/HeadMetadata";
import { getDataForSSG } from "@/Helpers/lib";
import { getParsedPacksEvent } from "@/Helpers/Encryptions";

const ClientComponent = dynamic(
  () => import("@/(PagesComponents)/Packs/MediaPack"),
  {
    ssr: false,
  },
);

export default function index({ dTag, event }) {
  let data = {
    path: `pack/m${dTag ? `?r=${dTag}` : ""}`,
    title: event?.title || "Notes from a starter pack",
    description:
      event?.description ||
      "Access content from people found in this starter pack",
    image:
      event?.image ||
      "https://yakihonne.s3.ap-east-1.amazonaws.com/media/images/thumbnail.png",
  };

  return (
    <div>
      <HeadMetadata data={data} />
      <ClientComponent event={event} />
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { d } = query;
  let pack = undefined;
  const data = await getDataForSSG([{ kinds: [39092], "#d": [d] }]);
  if (data.data.length > 0) {
    pack = getParsedPacksEvent(data.data[0]);
  }
  return {
    props: {
      dTag: d || null,
      event: pack,
    },
  };
}
