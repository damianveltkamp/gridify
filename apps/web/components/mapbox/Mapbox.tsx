import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { calcGrid } from "../../helpers/calc-grid";
import styles from "./stylesheet/Mapbox.module.scss";

interface Props {
  mapboxAccessToken: string;
}

export const Mapbox = ({ mapboxAccessToken }: Props) => {
  calcGrid();

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    mapboxgl.accessToken = mapboxAccessToken;
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();
    map.current.on("load", () => {
      console.log("loaded");
    });
  }, []);

  return <div className={styles["mapbox"]} ref={mapContainer}></div>;
};
