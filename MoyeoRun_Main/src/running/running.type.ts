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
  momentPace: number;
  currentTime: number;
  currentAltitude: number;
};
