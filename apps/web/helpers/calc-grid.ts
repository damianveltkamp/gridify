import {
  computeDestinationPoint,
  getRhumbLineBearing,
  getDistance,
} from "geolib";

interface Coordinate {
  latitude: number;
  longitude: number;
}

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

export function calcGrid() {
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

  const squaresPerRow = calculateSquares(horizontalRowCoordinates);

  console.log(horizontalRowCoordinates);
  console.log(squaresPerRow);
  return squaresPerRow;
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
  return horizontalRowCoordinates.reduce(
    (accumulator: any, rowCoordinates: Array<Coordinate>, rowIndex) => {
      if (rowIndex + 1 === horizontalRowCoordinates.length) {
        return accumulator;
      }

      const squares = rowCoordinates.reduce(
        (
          accumulator: Array<{
            left: Coordinate;
            right: Coordinate;
            bottomLeft: Coordinate;
            bottomRight: Coordinate;
          }>,
          coordinate: Coordinate,
          coordinateIndex: number
        ) => {
          if (coordinateIndex + 1 === rowCoordinates.length) {
            return accumulator;
          }

          // Get right neighbor coordinates
          const neighboringRightCoordinate =
            rowCoordinates[coordinateIndex + 1];
          // Get bottom neighbor coordinate
          const neighboringBottomCoordinate =
            horizontalRowCoordinates[rowIndex + 1][coordinateIndex];
          // Get borrom right neighbor coordinate
          const neighboringBottomRightCoordinate =
            horizontalRowCoordinates[rowIndex + 1][coordinateIndex + 1];

          accumulator.push({
            left: coordinate,
            right: neighboringRightCoordinate,
            bottomLeft: neighboringBottomCoordinate,
            bottomRight: neighboringBottomRightCoordinate,
          });
          return accumulator;
        },
        []
      );
      accumulator.push(squares);
      return accumulator;
    },
    []
  );
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
