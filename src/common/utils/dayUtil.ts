import * as dayjs from 'dayjs';
export const getKstTime = () => dayjs().add(9, 'hour').toDate();

export const getBetweenTime = (Time: Date) => {
  //   const currentTime = getKstTime();
  console.log('디비시간', Time);
  console.log('현재시간', getKstTime());
  return dayjs(getKstTime()).diff(Time, 'second') / 60;
};
