import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { OrderStatus, ProductCategory } from 'src/constants/enums';
import { S3Service } from 'src/shared/s3.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/schemas/product.schema';
import { CreateOrderDto, OrderQuery } from './dto';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { LastOrderNumber } from './schemas/last-order-number.schema';

const orderStub = (): Order => {
  return {
    orderNumber: '0001',
    amount: 1000,
    status: OrderStatus.PENDING,
    items: [
      {
        product: new Types.ObjectId('642eb1b706276e3cc9219257'),
        qty: 3,
      },
      {
        product: new Types.ObjectId('642eb1b706276e3cc9219258'),
        qty: 4,
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

const createOrderDtoStub = (): CreateOrderDto => {
  return {
    ...orderStub(),
    items: [
      {
        product: '642eb1b706276e3cc9219257',
        qty: 3,
      },
      {
        product: '642eb1b706276e3cc9219258',
        qty: 4,
      },
    ],
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

const lastOrderNumberStub = (): LastOrderNumber => {
  return {
    number: 1,
  };
};

const mockedOrderId = '642eb1b706276e3cc9219250';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let productsService: ProductsService;
  let model: Model<Order>;
  let lastOrderNumberModel: Model<LastOrderNumber>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        ProductsService,
        S3Service,
        ConfigService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            new: jest.fn().mockResolvedValue(orderStub()),
            constructor: jest.fn().mockResolvedValue(orderStub()),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn().mockResolvedValue(orderStub()),
            exec: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {},
        },
        {
          provide: getModelToken(LastOrderNumber.name),
          useValue: {
            create: jest.fn().mockResolvedValue(lastOrderNumberStub()),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    productsService = module.get<ProductsService>(ProductsService);
    model = module.get<Model<Order>>(getModelToken(Order.name));
    lastOrderNumberModel = module.get<Model<LastOrderNumber>>(getModelToken(LastOrderNumber.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* create function tests */
  describe('When create is called', () => {
    describe('when one or more products are not available', () => {
      it('should return unprocessable entity exception', async () => {
        jest.spyOn(productsService, 'findByIds').mockResolvedValue([productStub()] as any);

        try {
          await ordersService.create(createOrderDtoStub());
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
          expect(error).toHaveProperty('message', 'One or more items in your order are invalid or unavailable.');
        }
      });
    });

    describe('when one or more product items are not available', () => {
      it('should return unprocessable entity exception', async () => {
        const product1 = { ...productStub(), qty: 2, id: '642eb1b706276e3cc9219257' };
        const product2 = { ...productStub(), qty: 2, id: '642eb1b706276e3cc9219258' };
        jest.spyOn(productsService, 'findByIds').mockResolvedValue([product1, product2] as any);

        try {
          await ordersService.create(createOrderDtoStub());
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
          expect(error).toHaveProperty('message', 'One or more items in your order are invalid or unavailable.');
        }
      });
    });

    describe('when all the items are available', () => {
      it('should create the order and return it', async () => {
        const product1 = { ...productStub(), qty: 12, id: '642eb1b706276e3cc9219257' };
        const product2 = { ...productStub(), qty: 20, id: '642eb1b706276e3cc9219258' };

        jest.spyOn(productsService, 'findByIds').mockResolvedValue([product1, product2] as any);

        const lastOrderNUmberSaveStub = { ...lastOrderNumberStub(), save: jest.fn() };
        jest.spyOn(lastOrderNumberModel, 'findOne').mockResolvedValue(lastOrderNUmberSaveStub);
        jest.spyOn(lastOrderNUmberSaveStub, 'save').mockResolvedValue({ ...lastOrderNumberStub(), number: 2 });

        jest.spyOn(productsService, 'findByIdAndUpdate').mockResolvedValue(productStub() as any);

        const result = await ordersService.create(createOrderDtoStub());
        expect(result).toEqual(orderStub());
      });
    });
  });

  /* findAll function tests */
  describe('When findAll is called', () => {
    it('should return list of orders', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        collation: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([orderStub()]),
            }),
          }),
        }),
      } as any);

      const query = {} as OrderQuery;

      const employees = await ordersService.findAll(query);
      expect(employees).toEqual([orderStub()]);
    });
  });

  /* updateStatus function tests */
  describe('When updateStatus is called', () => {
    const updateOrderStatusDto = { status: OrderStatus.PROCESSING };

    describe('with an incorrect order id', () => {
      it('should return not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await ordersService.updateStatus(mockedOrderId, updateOrderStatusDto);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'Order not found');
        }
      });
    });

    describe('with a correct order id', () => {
      it('should update the order status', async () => {
        const orderSaveStub = { ...orderStub(), save: jest.fn() };

        jest.spyOn(model, 'findById').mockResolvedValue(orderSaveStub);
        jest.spyOn(orderSaveStub, 'save').mockResolvedValue(orderStub());

        const updatedOrder = await ordersService.updateStatus(mockedOrderId, updateOrderStatusDto);
        expect(updatedOrder).toEqual(orderStub());
      });
    });
  });

  /* delete function tests */
  describe('When delete is called', () => {
    describe('with an incorrect order id', () => {
      it('throw not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await ordersService.delete(mockedOrderId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'Order not found');
        }
      });
    });

    describe('with a correct order id', () => {
      it('should return true', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(orderStub());
        jest.spyOn(model, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);

        const result = await ordersService.delete(mockedOrderId);
        expect(result).toEqual(true);
      });
    });
  });

  /* findById function tests */
  describe('When findById is called', () => {
    describe('with an incorrect order id', () => {
      it('should return not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await ordersService.findById(mockedOrderId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'Order not found');
        }
      });
    });

    describe('with a correct order id', () => {
      it('should return an order', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(orderStub());

        const employee = await ordersService.findById(mockedOrderId);
        expect(employee).toEqual(orderStub());
      });
    });
  });
});
