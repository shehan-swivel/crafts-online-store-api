import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private region = 'ap-southeast-1';

  constructor(private configService: ConfigService) {}

  s3 = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async upload(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get('AWS_S3_BUCKET');
    const key = uuid() + extname(file.originalname);

    const putParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(putParams);
    await this.s3.send(command);

    const url = `https://${bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    return url;
  }
}
