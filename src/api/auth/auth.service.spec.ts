import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Role } from 'src/constants/enums';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    signAsync: jest.fn().mockResolvedValue('mockedToken'),
  })),
}));

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

const mockedUserId = '642eb1b706276e3cc9219257';
const accessToken = 'access-token';
const refreshToken = 'refresh-token';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        JwtService,
        ConfigService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(userStub()),
            constructor: jest.fn().mockResolvedValue(userStub()),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* createDefaultAdmin function tests */
  describe('When createDefaultAdmin is called', () => {
    describe('when default admin is already created', () => {
      it('should return from the function without creating the user', async () => {
        jest.spyOn(userService, 'checkIfAdminExists').mockResolvedValue(userStub() as any);

        const createdUser = await service.createDefaultAdmin();
        expect(createdUser).toEqual(undefined);
      });
    });

    describe('when default admin is not created before', () => {
      it('should create the default admin', async () => {
        jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => Promise.resolve('mockedSalt'));
        jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('mockedHash'));
        jest.spyOn(model, 'create').mockResolvedValue(userStub() as any);
        jest.spyOn(userService, 'checkIfAdminExists').mockResolvedValue(null);

        const createdUser = await service.createDefaultAdmin();
        expect(createdUser).toEqual(userStub());
      });
    });
  });

  /* login function tests */
  describe('When login is called', () => {
    const credentials = { username: 'test', password: '123' };

    describe('with invalid username', () => {
      it('should return unauthorized exception', async () => {
        jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

        try {
          await service.login(credentials);
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error).toHaveProperty('message', 'Invalid credentials');
        }
      });
    });

    describe('with invalid password', () => {
      it('should return unauthorized exception', async () => {
        jest.spyOn(userService, 'findByUsername').mockResolvedValue(userStub() as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

        try {
          await service.login(credentials);
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error).toHaveProperty('message', 'Invalid credentials');
        }
      });
    });

    describe('with valid credentials', () => {
      it('should return accessToken, refreshToken and user object.', async () => {
        jest.spyOn(userService, 'findByUsername').mockResolvedValue(userStub() as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
        jest.spyOn(service as any, 'getTokens').mockResolvedValue({ accessToken, refreshToken });
        jest.spyOn(service as any, 'updateRefreshToken').mockImplementationOnce(() => Promise.resolve());

        const response = await service.login(credentials);
        expect(response).toEqual({ accessToken, refreshToken, user: userStub() });
      });
    });
  });

  /* getCurrentUser function tests */
  describe('When getCurrentUser is called', () => {
    describe('with an incorrect user id', () => {
      it('should return not found exception', async () => {
        jest.spyOn(userService, 'findById').mockResolvedValue(null);

        try {
          await service.getCurrentUser(mockedUserId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'User not found');
        }
      });
    });

    describe('with the correct user id', () => {
      it('should return logged in user data', async () => {
        jest.spyOn(userService, 'findById').mockResolvedValue(userStub() as any);

        const response = await service.getCurrentUser(mockedUserId);
        expect(response).toEqual(userStub());
      });
    });
  });

  /* changePassword function tests */
  describe('When changePassword is called', () => {
    const changePasswordDto = { currentPassword: '123', newPassword: '12345', confirmPassword: '12345' };

    describe('with not matched new password and confirm passwords', () => {
      it('should return bad request exception', async () => {
        try {
          await service.changePassword(mockedUserId, { ...changePasswordDto, confirmPassword: '1234' });
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error).toHaveProperty('message', 'New password and Confirm password do not match');
        }
      });
    });

    describe('with invalid current password', () => {
      it('should return unauthorized exception', async () => {
        jest.spyOn(service, 'getCurrentUser').mockResolvedValue(userStub() as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

        try {
          await service.changePassword(mockedUserId, changePasswordDto);
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error).toHaveProperty('message', 'Invalid credentials');
        }
      });
    });

    describe('with correct data', () => {
      it('should change password and return the user', async () => {
        const userSaveStub = { ...userStub(), save: jest.fn() };

        jest.spyOn(service, 'getCurrentUser').mockResolvedValue(userSaveStub as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
        jest.spyOn(service as any, 'hashData').mockResolvedValue('mockedHash');
        jest.spyOn(userSaveStub, 'save').mockResolvedValue(userStub());

        const result = await service.changePassword(mockedUserId, changePasswordDto);
        expect(result).toEqual(userStub());
      });
    });
  });

  /* refreshTokens function tests */
  describe('When refreshTokens is called', () => {
    describe('with invalid user id', () => {
      it('should return forbidden exception', async () => {
        jest.spyOn(userService, 'findById').mockResolvedValue(null);

        try {
          await service.refreshTokens(mockedUserId, refreshToken);
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect(error).toHaveProperty('message', 'Access Denied');
        }
      });
    });

    describe('with invalid refresh token', () => {
      it('should return forbidden exception', async () => {
        jest.spyOn(userService, 'findById').mockResolvedValue(userStub() as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

        try {
          await service.refreshTokens(mockedUserId, refreshToken);
        } catch (error) {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect(error).toHaveProperty('message', 'Access Denied');
        }
      });
    });

    describe('with correct data', () => {
      it('should refresh tokens and return new access token and refresh token', async () => {
        jest.spyOn(userService, 'findById').mockResolvedValue(userStub() as any);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
        jest.spyOn(service as any, 'getTokens').mockResolvedValue({ accessToken, refreshToken });
        jest.spyOn(service as any, 'updateRefreshToken').mockImplementationOnce(() => Promise.resolve());

        const result = await service.refreshTokens(mockedUserId, refreshToken);
        expect(result).toEqual({ accessToken, refreshToken });
      });
    });
  });
});
