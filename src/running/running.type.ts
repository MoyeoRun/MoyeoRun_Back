export enum RunningType {
  multi = 'multi',
  free = 'free',
  distance = 'distance',
  time = 'time',
}

export type RunDataType = {
  latitude: number;
  longitude: number;
  currentDistance: number;
  currentPace: number;
  currentTime: number;
  currentAltitude: number;
};
