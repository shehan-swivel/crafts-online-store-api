import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  client = new S3Client({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async uploadFile(file: Express.Multer.File) {
    const { originalname, mimetype } = file;

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: String(originalname),
      Body: file.buffer,
      ContentType: mimetype,
    });

    const response = await this.client.send(command);
    console.log(response);
  }
}
