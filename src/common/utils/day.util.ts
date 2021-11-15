import * as dayjs from 'dayjs';
export const addMinutes = (minutes: number) =>
  dayjs().add(minutes, 'minutes').toDate();

export const addDays = (days: number) => dayjs().add(days, 'day').toDate();

export const subTime = (now: Date, past: Date) =>
  dayjs(now).diff(past, 'second');

export const subTimeByMillisecond = (now: Date) =>
  dayjs(now).diff(dayjs(), 'milliseconds');
