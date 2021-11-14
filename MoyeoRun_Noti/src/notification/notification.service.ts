import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { firebaseConfig } from 'src/config/firebase.config';

@Injectable()
export class NotificationService {
  private adminConfig: ServiceAccount = {
    projectId: firebaseConfig.projectId,
    privateKey: firebaseConfig.privateKey,
    clientEmail: firebaseConfig.clientEmail,
  };
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(this.adminConfig),
      databaseURL: firebaseConfig.clientEmail,
    });
  }

  async sendMessage(notification, data, token) {
    await admin.messaging().send({
      notification,
      data,
      token,
    });
  }
}
