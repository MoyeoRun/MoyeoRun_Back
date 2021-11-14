import { HttpException, Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as AWS from 'aws-sdk';
import * as MulterS3 from 'multer-s3';
import { AUTO_CONTENT_TYPE } from 'multer-s3';
import { awsConstants } from 'src/config/aws.config';

@Injectable()
export class S3Service implements MulterOptionsFactory {
  private s3: any;
  private readonly FILE_LIMIT_SIZE = 3145728;

  constructor() {
    this.s3 = new AWS.S3();

    AWS.config.update({
      accessKeyId: awsConstants.accessKeyId,
      secretAccessKey: awsConstants.secretAccessKey,
    });
  }

  public fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) {
    if (file.mimetype.match(/\/(gif|jpe?g|bmp|png|heic)$/)) {
      cb(null, true);
    } else {
      console.error(`No! ${JSON.stringify(file)}`);
      cb(new HttpException('잘못된 파일 형식입니다.', 400), false);
    }
  }

  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    const bucket: string = awsConstants.s3BucketName;
    const acl = 'public-read';

    const multerS3Storage = MulterS3({
      s3: this.s3,
      bucket,
      acl,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
      },
      contentType: AUTO_CONTENT_TYPE,
    });

    return {
      storage: multerS3Storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.FILE_LIMIT_SIZE,
      },
    };
  }
}
