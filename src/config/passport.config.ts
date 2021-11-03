export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiredIn: process.env.EXPIREDIN || '30m',
};
