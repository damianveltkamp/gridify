import { BaseLayout } from "ui";
import "../components/mapbox/stylesheet/Mapbox.override.scss";
// import "../sass/index.scss";

export default function App({ Component: Page, pageProps }) {
  return (
    <BaseLayout>
      <Page {...pageProps} />
    </BaseLayout>
  );
}
