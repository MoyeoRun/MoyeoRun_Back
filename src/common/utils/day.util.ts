import * as dayjs from 'dayjs';
export const addMinutes = (minutes: number) =>
  dayjs().add(minutes, 'minutes').toDate();

export const addDays = (days: number) => dayjs().add(days, 'day').toDate();
