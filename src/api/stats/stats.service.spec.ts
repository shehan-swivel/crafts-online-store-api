import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { Analytics } from './interfaces';
import { S3Service } from 'src/shared/s3.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, ProductCategory } from 'src/constants/enums';

const analyticsStub: Analytics = {
  totalOrders: 10,
  pendingOrders: 2,
  totalProducts: 15,
  totalRevenue: 13400,
  orderCountPerDay: [],
  topSellingProducts: [],
};

const orderStub = (): Order => {
  return {
    amount: 13400,
    status: OrderStatus.PENDING,
    items: [
      {
        product: new Types.ObjectId('642eb1b706276e3cc9219257'),
        qty: 3,
      },
    ],
    note: '',
    customerName: 'Random user',
    phoneNumber: '+94701234567',
    email: 'randomuser@example.com',
    billingAddress: {
      street: 'Random street',
      city: 'Random city',
      state: 'Random state',
      postalCode: '12345',
    },
  };
};

const productStub = (): Product => {
  return {
    name: 'Test product',
    description: '',
    qty: 10,
    price: 1000.0,
    category: ProductCategory.CLAY,
    image: '',
  };
};

describe('StatsService', () => {
  let statsService: StatsService;
  let productsService: ProductsService;
  let productModel: Model<Product>;
  let orderModel: Model<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        ProductsService,
        OrdersService,
        S3Service,
        ConfigService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getModelToken(Order.name),
          useValue: {
            count: jest.fn(),
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    statsService = module.get<StatsService>(StatsService);
    productsService = module.get<ProductsService>(ProductsService);
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* getAnalytics function tests */
  describe('When create is called', () => {
    it('should create the product and return it', async () => {
      const product1 = { ...productStub(), qty: 12, id: '642eb1b706276e3cc9219257' };

      jest.spyOn(productModel, 'count').mockResolvedValueOnce(15);
      jest.spyOn(orderModel, 'count').mockResolvedValueOnce(10);
      jest.spyOn(orderModel, 'count').mockResolvedValueOnce(2);
      jest.spyOn(orderModel, 'aggregate').mockResolvedValueOnce([orderStub()]);
      jest.spyOn(orderModel, 'aggregate').mockResolvedValueOnce([orderStub()]);
      jest.spyOn(orderModel, 'aggregate').mockResolvedValueOnce([{ _id: product1.id, totalQuantitySold: 1 }]);
      jest.spyOn(productsService, 'findByIds').mockResolvedValue([product1] as any);

      const result = await statsService.getAnalytics();

      expect(result.totalOrders).toEqual(analyticsStub.totalOrders);
      expect(result.pendingOrders).toEqual(analyticsStub.pendingOrders);
      expect(result.totalProducts).toEqual(analyticsStub.totalProducts);
      expect(result.totalRevenue).toEqual(analyticsStub.totalRevenue);

      result.orderCountPerDay.forEach((item: { date: string; count: number }) => {
        expect(item).toEqual(expect.objectContaining({ date: expect.any(String), count: expect.any(Number) }));
      });

      result.topSellingProducts.forEach((item: { name: string; qty: number; image: string }) => {
        expect(item).toEqual(
          expect.objectContaining({ name: expect.any(String), qty: expect.any(Number), image: expect.any(String) }),
        );
      });
    });
  });
});
