import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from 'src/common/interfaces';
import { Role } from 'src/constants/enums';
import { User } from '../users/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const userStub = (): User => {
  return {
    username: 'testuser',
    password: 'randompassword',
    role: Role.ADMIN,
    email: 'user@test.com',
    requirePasswordChange: true,
    refreshToken: 'fake_refresh_token',
  };
};

const refreshTokenResponseStub = () => {
  return {
    accessToken: 'fake_access_token',
    refreshToken: 'fake_refresh_token',
  };
};

const loginResponseStub = () => {
  return {
    ...refreshTokenResponseStub(),
    user: userStub(),
  };
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(loginResponseStub()),
            getCurrentUser: jest.fn().mockResolvedValue(userStub()),
            changePassword: jest.fn().mockResolvedValue(userStub()),
            refreshTokens: jest.fn().mockResolvedValue(refreshTokenResponseStub()),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When login is called', () => {
    it('should authenticate user successfully', async () => {
      const payload = { username: 'fake_username', password: 'randompassword' };
      const response = await controller.login(payload);

      expect(service.login).toHaveBeenCalledWith(payload);
      expect(response).toEqual({ data: loginResponseStub(), message: 'Login successful.' });
    });
  });

  describe('When getCurrentUser is called', () => {
    it('should return logged in user successfully', async () => {
      const params = { user: { sub: '642eb1b706276e3cc9219257' } } as RequestWithUser;
      const response = await controller.getCurrentUser(params);

      expect(service.getCurrentUser).toHaveBeenCalledWith(params.user.sub);
      expect(response).toEqual({ data: userStub(), message: '' });
    });
  });

  describe('When changePassword is called', () => {
    it("should change user's password successfully", async () => {
      const payload = { currentPassword: '1234', newPassword: 'abcd', confirmPassword: 'abcd' };
      const params = { user: { sub: '642eb1b706276e3cc9219257' } } as RequestWithUser;
      const response = await controller.changePassword(params, payload);

      expect(service.changePassword).toHaveBeenCalledWith(params.user.sub, payload);
      expect(response).toEqual({ data: null, message: 'Password changed successfully.' });
    });
  });

  describe('When refreshTokens is called', () => {
    it('should refresh tokens successfully', async () => {
      const params = {
        user: { sub: '642eb1b706276e3cc9219257', refreshToken: 'fake_refresh_token' },
      } as RequestWithUser;
      const response = await controller.refreshTokens(params);

      expect(service.refreshTokens).toHaveBeenCalledWith(params.user.sub, params.user.refreshToken);
      expect(response).toEqual({ data: refreshTokenResponseStub(), message: '' });
    });
  });
});
