import { Request } from 'express';

export const cookieExtractor = (request: Request): string | null => {
  let token = null;
  if (request && request.signedCookies) {
    token = request.signedCookies['access_token'];
  }
  return token;
};
