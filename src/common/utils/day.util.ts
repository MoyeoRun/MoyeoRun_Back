import * as dayjs from 'dayjs';
export const getKstTime = () => dayjs().add(9, 'hour').toDate();
