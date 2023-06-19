import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { IdParamDto } from 'src/common/dto';
import { OrderStatus } from 'src/constants/enums';
import { CreateOrderDto } from './dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';

const orderStub = (): Order => {
  return {
    amount: 1000,
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

const createOrderDtoStub = (): CreateOrderDto => {
  return {
    ...orderStub(),
    items: [
      {
        product: '642eb1b706276e3cc9219257',
        qty: 3,
      },
    ],
  };
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            create: jest.fn().mockResolvedValue(orderStub()),
            findAll: jest.fn().mockResolvedValue([orderStub()]),
            updateStatus: jest.fn().mockResolvedValue(orderStub()),
            delete: jest.fn().mockResolvedValue(true),
            findById: jest.fn().mockResolvedValue(orderStub()),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When create is called', () => {
    it('should return the created order with success message', async () => {
      const response = await controller.create(createOrderDtoStub());

      expect(service.create).toHaveBeenCalledWith(createOrderDtoStub());
      expect(response).toEqual({
        data: orderStub(),
        message: 'Your order has been placed successfully. Thank you for choosing our service',
      });
    });
  });

  describe('When findAll is called', () => {
    it('should return list of orders', async () => {
      const response = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith();
      expect(response).toEqual({ data: [orderStub()], message: '' });
    });
  });

  describe('when updateStatus is called', () => {
    it('should return the updated order with success message', async () => {
      const params: IdParamDto = { id: '642eb1b706276e3cc9219257' };
      const payload = { status: OrderStatus.PROCESSING };

      const response = await controller.updateStatus(params, payload);

      expect(service.updateStatus).toHaveBeenCalledWith(params.id, payload);
      expect(response).toEqual({ data: orderStub(), message: 'Order status updated successfully' });
    });
  });

  describe('When delete is called', () => {
    it('should delete the order and return with success message', async () => {
      const params: IdParamDto = { id: '642eb1b706276e3cc9219257' };
      const response = await controller.delete(params);

      expect(service.delete).toHaveBeenCalledWith(params.id);
      expect(response).toEqual({ data: null, message: 'Order deleted successfully' });
    });
  });

  describe('When findById is called', () => {
    it('should return an order', async () => {
      const params: IdParamDto = { id: '642eb1b706276e3cc9219257' };
      const response = await controller.findById(params);

      expect(service.findById).toHaveBeenCalledWith(params.id);
      expect(response).toEqual({ data: orderStub(), message: '' });
    });
  });
});
