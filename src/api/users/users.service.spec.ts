import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Role } from 'src/constants/enums';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

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
const mockedUserId = '642eb1b706276e3cc9219250';
const mockedUsername = 'mocked_user';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        ConfigService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* checkIfAdminExists function tests */
  describe('When checkIfAdminExists is called', () => {
    describe('when admin user not exists', () => {
      it('should return null', async () => {
        jest.spyOn(model, 'findOne').mockResolvedValue(null);

        const result = await service.checkIfAdminExists();
        expect(result).toEqual(null);
      });
    });

    describe('when admin user exists', () => {
      it('should return the user', async () => {
        jest.spyOn(model, 'findOne').mockResolvedValue(userStub());

        const result = await service.checkIfAdminExists();
        expect(result).toEqual(userStub());
      });
    });
  });

  /* create function tests */
  describe('When create is called', () => {
    it('should create the product and return it', async () => {
      jest.spyOn(model, 'create').mockResolvedValue(userStub() as any);

      const result = await service.create(userStub());
      expect(result).toEqual(userStub());
    });
  });

  /* findAll function tests */
  describe('When findAll is called', () => {
    it('should return list of users', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([userStub()]),
      } as any);

      const employees = await service.findAll();
      expect(employees).toEqual([userStub()]);
    });
  });

  /* findByUsername function tests */
  describe('When findByUsername is called', () => {
    it('should return the user matched with the given username', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValue(userStub());

      const result = await service.findByUsername(mockedUsername);
      expect(result).toEqual(userStub());
    });
  });

  /* findById function tests */
  describe('When findById is called', () => {
    it('should return the user matched with the given id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(userStub());

      const result = await service.findById(mockedUserId);
      expect(result).toEqual(userStub());
    });
  });

  /* update function tests */
  describe('When update is called', () => {
    describe('with an incorrect user id', () => {
      it('should return not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await service.update(mockedUserId, userStub());
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'User not found');
        }
      });
    });

    describe('with a correct user id', () => {
      it('should update the user', async () => {
        const userSaveStub = { ...userStub(), save: jest.fn() };

        jest.spyOn(model, 'findById').mockResolvedValue(userSaveStub);
        jest.spyOn(userSaveStub, 'save').mockResolvedValue(userStub());

        const updatedEmployee = await service.update(mockedUserId, userStub());
        expect(updatedEmployee).toEqual(userStub());
      });
    });
  });
});
