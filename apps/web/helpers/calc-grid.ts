import {
  computeDestinationPoint,
  getRhumbLineBearing,
  getDistance,
} from "geolib";

type Grid = Array<Array<Coordinate>>;

type GeoJson = {
  type: string;
  data: {
    type: string;
    features: Array<{
      type: string;
      geometry: { type: string; coordinates: Array<Array<[number, number]>> };
    }>;
  };
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

// const coordinates: Array<Coordinate> = [
//   // Top left
//   {
//     latitude: 4.91455,
//     longitude: 52.42753,
//   },
//   // Top right
//   {
//     latitude: 4.91836,
//     longitude: 52.42685,
//   },
//   // Bottom left
//   {
//     latitude: 4.91364,
//     longitude: 52.42636,
//   },
//   // Bottom right
//   {
//     latitude: 4.9174,
//     longitude: 52.42555,
//   },
// ];

const coordinates: Array<Coordinate> = [
  // Top left
  {
    latitude: 24.049985023339868,
    longitude: 37.74100146276254,
  },
  // Top right
  {
    latitude: 24.06134725897303,
    longitude: 37.74061987222393,
  },
  // Bottom left
  {
    latitude: 24.049853721229447,
    longitude: 37.738066888652696,
  },
  // Bottom right
  {
    latitude: 24.060932203545054,
    longitude: 37.737708882231665,
  },
];

const numberOfColumns: number = 40;
const numberOfRows: number = 14;

export function calcGridPoints() {
  const verticalDistance: { left: number; right: number } = {
    left: getDistance(coordinates[0], coordinates[2]) / numberOfRows,
    right: getDistance(coordinates[1], coordinates[3]) / numberOfRows,
  };
  const verticalBearings: { left: number; right: number } = {
    left: calcBearing(coordinates[0], coordinates[2]),
    right: calcBearing(coordinates[1], coordinates[3]),
  };
  const verticalCoordinates: {
    left: Array<Coordinate>;
    right: Array<Coordinate>;
  } = {
    left: calcCoords(
      coordinates[0],
      verticalDistance.left,
      verticalBearings.left,
      numberOfRows
    ),
    right: calcCoords(
      coordinates[1],
      verticalDistance.right,
      verticalBearings.right,
      numberOfRows
    ),
  };

  const horizontalRowCoordinates =
    getHorizontalRowCoordinates(verticalCoordinates);

  return horizontalRowCoordinates;
}

export function formatGeoJson(grid: Grid) {
  const output = calculateSquares(grid);
  return output;
}

export function getCenterOfGrid(grid: Grid) {
  const roundedMiddleRowIndex: number = Math.round(grid.length / 2);
  const roundedMiddleSquareIndex: number = Math.round(
    grid[roundedMiddleRowIndex].length / 2
  );

  return grid[roundedMiddleRowIndex][roundedMiddleSquareIndex];
}

function getHorizontalRowCoordinates(verticalCoordinates: {
  left: Array<Coordinate>;
  right: Array<Coordinate>;
}) {
  return verticalCoordinates.left.map(
    (coordinate: Coordinate, index: number) => {
      const corespondingRightCoordinate = verticalCoordinates.right[index];
      const bearing = calcBearing(coordinate, corespondingRightCoordinate);
      const distance =
        getDistance(coordinate, corespondingRightCoordinate) / numberOfColumns;

      return calcCoords(coordinate, distance, bearing, numberOfColumns);
    }
  );
}

function calculateSquares(horizontalRowCoordinates: Array<Array<Coordinate>>) {
  const geoJsonOutput = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  };

  horizontalRowCoordinates.forEach(
    (rowCoordinates: Array<Coordinate>, rowIndex) => {
      if (rowIndex + 1 === horizontalRowCoordinates.length) {
        return;
      }

      rowCoordinates.forEach(
        (coordinate: Coordinate, coordinateIndex: number) => {
          if (coordinateIndex + 1 === rowCoordinates.length) {
            return;
          }

          // Get right neighbor coordinates
          const neighboringRightCoordinate =
            rowCoordinates[coordinateIndex + 1];
          // Get bottom neighbor coordinate
          const neighboringBottomLeftCoordinate =
            horizontalRowCoordinates[rowIndex + 1][coordinateIndex];
          // Get borrom right neighbor coordinate
          const neighboringBottomRightCoordinate =
            horizontalRowCoordinates[rowIndex + 1][coordinateIndex + 1];

          const geometry = convertToGeoJsonGeomatry(
            coordinate,
            neighboringRightCoordinate,
            neighboringBottomLeftCoordinate,
            neighboringBottomRightCoordinate
          );

          geoJsonOutput.data.features.push(geometry);

          return;
        },
        []
      );
      return;
    }
  );

  return geoJsonOutput;
}

function calcCoords(
  startingCoordinate: Coordinate,
  distance: number,
  bearing: number,
  iterations: number
) {
  // Distance is total distance between 2 points
  const coordinates = [];
  for (let index = 1; index <= iterations; index++) {
    coordinates.push(
      computeDestinationPoint(startingCoordinate, distance * index, bearing)
    );
  }

  coordinates.unshift(startingCoordinate);

  return coordinates;
}

function calcBearing(leftCoordinate: Coordinate, rightCoordinate: Coordinate) {
  return getRhumbLineBearing(leftCoordinate, rightCoordinate);
}

function convertToGeoJsonGeomatry(
  coordinate: Coordinate,
  neighboringRightCoordinate: Coordinate,
  neighboringBottomLeftCoordinate: Coordinate,
  neighboringBottomRightCoordinate: Coordinate
) {
  const featureObject = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[]],
    },
  };

  featureObject.geometry.coordinates[0].push([
    coordinate.latitude,
    coordinate.longitude,
  ]);
  featureObject.geometry.coordinates[0].push([
    neighboringRightCoordinate.latitude,
    neighboringRightCoordinate.longitude,
  ]);
  featureObject.geometry.coordinates[0].push([
    neighboringBottomRightCoordinate.latitude,
    neighboringBottomRightCoordinate.longitude,
  ]);
  featureObject.geometry.coordinates[0].push([
    neighboringBottomLeftCoordinate.latitude,
    neighboringBottomLeftCoordinate.longitude,
  ]);
  featureObject.geometry.coordinates[0].push([
    coordinate.latitude,
    coordinate.longitude,
  ]);

  return featureObject;
}
