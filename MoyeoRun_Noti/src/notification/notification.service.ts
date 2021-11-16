import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushErrorReceipt } from 'expo-server-sdk';
import { expoConfig } from 'src/config/expo.config';

@Injectable()
export class NotificationService {
  private expo: Expo;
  constructor() {
    this.expo = new Expo({ accessToken: expoConfig.accessToken });
  }

  async sendMessage(notification, data, token) {
    try {
      if (!Expo.isExpoPushToken(token))
        console.error(`Push token ${token} is not a valid Expo push token`);

      const chunks = this.expo.chunkPushNotifications([
        {
          to: token,
          sound: 'default',
          title: notification.title,
          body: notification.body,
          data,
        },
      ]);

      const tickets = [];
      (async () => {
        for (const chunk of chunks) {
          try {
            const ticketChunk = await this.expo.sendPushNotificationsAsync(
              chunk,
            );
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error(error);
          }
        }
      })();

      const receiptIds = [];
      for (const ticket of tickets) {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }

      const receiptIdChunks =
        this.expo.chunkPushNotificationReceiptIds(receiptIds);
      (async () => {
        for (const chunk of receiptIdChunks) {
          try {
            const receipts = await this.expo.getPushNotificationReceiptsAsync(
              chunk,
            );
            console.log(receipts);

            for (const receiptId in receipts) {
              const { status } = receipts[receiptId];
              let message, details;
              if ((receipts[receiptId] as ExpoPushErrorReceipt).message) {
                message = (receipts[receiptId] as ExpoPushErrorReceipt).message;
                details = (receipts[receiptId] as ExpoPushErrorReceipt).details;
              }
              if (status === 'ok') {
                continue;
              } else if (status === 'error') {
                console.error(
                  `There was an error sending a notification: ${message}`,
                );
                if (details && details.error) {
                  console.error(`The error code is ${details.error}`);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
      })();
    } catch (err) {
      console.error('@@Server Issue@@');
      console.error(err);
    }
  }
}
