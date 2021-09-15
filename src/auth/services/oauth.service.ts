import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { UserRepository } from 'src/user/user.repository';
import { OauthResponse, OauthUserRequest } from '../dto/oauth.dto';
import { AuthService } from './auth.service';

@Injectable()
export class OauthService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
  ) {}

  async kakaoGetUser(accessToken: any) {
    try {
      const user = await axios({
        method: 'GET',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return user.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(error.response.data.msg, error.response.status);
      } else {
        throw new HttpException('Wrong Type', 500);
      }
    }
  }

  async naverGetUser(accessToken: any) {
    try {
      const user = await axios({
        url: 'https://openapi.naver.com/v1/nid/me',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/xml',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return user.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new HttpException('Wrong Type', 500);
      }
    }
  }

  async googleGetUser(accessToken: any) {
    try {
      const user = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return user.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new HttpException('Wrong Type', 500);
      }
    }
  }

  async authentication(
    oauthUserRequest: OauthUserRequest,
  ): Promise<OauthResponse> {
    try {
      let isNewUser = false;
      let user = await this.userRepository.findByEmail({
        email: oauthUserRequest.email,
      });

      if (user == undefined) {
        isNewUser = true;
        user = await this.userRepository.create(oauthUserRequest);
      }

      const oauthResponse: OauthResponse = {
        accessToken: this.authService.login(user).accessToken,
        isNewUser,
      };

      return oauthResponse;
    } catch (error: any) {
      console.error(error);
      throw new HttpException('<Oauth> Server Error', 500);
    }
  }
}
