import { Test, TestingModule } from '@nestjs/testing';
import { Analytics } from './interfaces';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

const analyticsStub = (): Analytics => {
  return {
    totalOrders: 10,
    pendingOrders: 2,
    totalProducts: 15,
    totalRevenue: 13400,
    orderCountPerDay: [],
    topSellingProducts: [],
  };
};

describe('StatsController', () => {
  let controller: StatsController;
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: {
            getAnalytics: jest.fn().mockResolvedValue(analyticsStub()),
          },
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When getAnalytics is called', () => {
    it('should return the system analytics', async () => {
      const response = await controller.getAnalytics();

      expect(service.getAnalytics).toHaveBeenCalledWith();
      expect(response).toEqual({ data: analyticsStub(), message: '' });
    });
  });
});
