import { Test, TestingModule } from '@nestjs/testing';
import { IdParamDto } from 'src/common/dto';
import { ProductCategory } from 'src/constants/enums';
import { ProductQuery } from './dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

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

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn().mockResolvedValue(productStub()),
            findAll: jest.fn().mockResolvedValue([productStub()]),
            update: jest.fn().mockResolvedValue(productStub()),
            delete: jest.fn().mockResolvedValue(true),
            findById: jest.fn().mockResolvedValue(productStub()),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When create is called', () => {
    it('should return the created product with success message', async () => {
      const file: Express.Multer.File = null;
      const response = await controller.create(file, productStub());

      expect(service.create).toHaveBeenCalledWith(productStub(), file);
      expect(response).toEqual({ data: productStub(), message: 'Product created successfully' });
    });
  });

  describe('When findAll is called', () => {
    it('should return list of products', async () => {
      const query = {} as ProductQuery;
      const response = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(response).toEqual({ data: [productStub()], message: '' });
    });
  });

  describe('when update is called', () => {
    it('should return the updated product with success message', async () => {
      const params: IdParamDto = { id: '642eb1b706276e3cc9219257' };
      const file: Express.Multer.File = null;
      const response = await controller.update(params, file, productStub());

      expect(service.update).toHaveBeenCalledWith(params.id, productStub(), file);
      expect(response).toEqual({ data: productStub(), message: 'Product updated successfully' });
    });
  });

  describe('When delete is called', () => {
    it('should delete the product and return with success message', async () => {
      const params: IdParamDto = { id: '642eb1b706276e3cc9219257' };
      const response = await controller.delete(params);

      expect(service.delete).toHaveBeenCalledWith(params.id);
      expect(response).toEqual({ data: null, message: 'Product deleted successfully' });
    });
  });

  describe('When findById is called', () => {
    it('should return a product', async () => {
      const params: IdParamDto = { id: '642eb1b706276e3cc9219257' };
      const response = await controller.findById(params);

      expect(service.findById).toHaveBeenCalledWith(params.id);
      expect(response).toEqual({ data: productStub(), message: '' });
    });
  });
});
