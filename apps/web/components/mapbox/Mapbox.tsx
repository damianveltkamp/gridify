import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  calcGridPoints,
  formatGeoJson,
  getCenterOfGrid,
} from "../../helpers/calc-grid";
import styles from "./stylesheet/Mapbox.module.scss";
import { initD3 } from "../../helpers/d3";

interface Props {
  mapboxAccessToken: string;
}

export const Mapbox = ({ mapboxAccessToken }: Props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    const grid = calcGridPoints();
    const geoJson = formatGeoJson(grid);
    const centerOfGrid = getCenterOfGrid(grid);

    mapboxgl.accessToken = mapboxAccessToken;
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [centerOfGrid.latitude, centerOfGrid.longitude],
      zoom: 16,
    });

    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();
    map.current.on("load", () => {
      map.current.addSource("maine", geoJson);

      map.current.addLayer({
        id: "maine",
        type: "fill",
        source: "maine",
        layout: {},
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.5,
        },
      });

      map.current.addLayer({
        id: "outline",
        type: "line",
        source: "maine",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 2,
        },
      });
    });
  }, []);

  return <div className={styles["mapbox"]} ref={mapContainer}></div>;
};
