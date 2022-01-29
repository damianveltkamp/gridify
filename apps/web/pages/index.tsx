import { Mapbox } from "../components/mapbox/Mapbox";

interface Props {
  mapboxAccessToken: string;
}

export default function Web({ mapboxAccessToken }: Props) {
  return (
    <div>
      <Mapbox mapboxAccessToken={mapboxAccessToken} />
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
    },
  };
}
