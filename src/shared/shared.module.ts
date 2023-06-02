import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class SharedModule {}
