import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, ConfigService],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* upload function tests */
  describe('When upload is called', () => {
    it('should create the product and return it', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        data: {},
      });
      jest.spyOn(S3Client.prototype, 'send').mockImplementation(mockSend);

      const file = {} as Express.Multer.File;
      const filename = 'mocked filename';

      const result = await service.upload(file, filename);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.any(String));
    });
  });
});
