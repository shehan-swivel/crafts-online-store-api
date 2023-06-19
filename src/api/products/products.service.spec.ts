import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { ProductCategory } from 'src/constants/enums';
import { Model } from 'mongoose';
import { S3Service } from 'src/shared/s3.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { ProductQuery } from './dto';
import { NotFoundException } from '@nestjs/common';

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

const mockedProductId = '642eb1b706276e3cc9219250';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let s3Service: S3Service;
  let model: Model<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        S3Service,
        ConfigService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            new: jest.fn().mockResolvedValue(productStub()),
            constructor: jest.fn().mockResolvedValue(productStub()),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn().mockResolvedValue(productStub()),
            exec: jest.fn(),
            deleteOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
    s3Service = module.get<S3Service>(S3Service);
    model = module.get<Model<Product>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* create function tests */
  describe('When create is called', () => {
    it('should create the product and return it', async () => {
      jest.spyOn(s3Service, 'upload').mockResolvedValue('mockedUrl');
      jest.spyOn(model, 'create').mockResolvedValue(productStub() as any);

      const file = {} as Express.Multer.File;

      const result = await productsService.create(productStub(), file);
      expect(result).toEqual(productStub());
    });
  });

  /* findAll function tests */
  describe('When findAll is called', () => {
    it('should return list of products', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        collation: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([productStub()]),
            }),
          }),
        }),
      } as any);

      const query = {} as ProductQuery;

      const employees = await productsService.findAll(query);
      expect(employees).toEqual([productStub()]);
    });
  });

  /* update function tests */
  describe('When update is called', () => {
    describe('with an incorrect product id', () => {
      it('should return not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await productsService.update(mockedProductId, productStub(), null);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'Product not found');
        }
      });
    });

    describe('with a correct product id', () => {
      it('should update the product', async () => {
        const productSaveStub = { ...productStub(), save: jest.fn() };

        jest.spyOn(s3Service, 'upload').mockResolvedValue('mockedUrl');
        jest.spyOn(model, 'findById').mockResolvedValue(productSaveStub);
        jest.spyOn(productSaveStub, 'save').mockResolvedValue(productStub());

        const file = {} as Express.Multer.File;

        const updatedEmployee = await productsService.update(mockedProductId, productStub(), file);
        expect(updatedEmployee).toEqual(productStub());
      });
    });
  });

  /* delete function tests */
  describe('When delete is called', () => {
    describe('with an incorrect product id', () => {
      it('throw not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await productsService.delete(mockedProductId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'Product not found');
        }
      });
    });

    describe('with a correct product id', () => {
      it('should return true', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(productStub());
        jest.spyOn(model, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);

        const result = await productsService.delete(mockedProductId);
        expect(result).toEqual(true);
      });
    });
  });

  /* findById function tests */
  describe('When findById is called', () => {
    describe('with an incorrect product id', () => {
      it('should return not found error', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(null);

        try {
          await productsService.findById(mockedProductId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error).toHaveProperty('message', 'Product not found');
        }
      });
    });

    describe('with a correct product id', () => {
      it('should return a product', async () => {
        jest.spyOn(model, 'findById').mockResolvedValue(productStub());

        const employee = await productsService.findById(mockedProductId);
        expect(employee).toEqual(productStub());
      });
    });
  });

  /* findByIds function tests */
  describe('When findByIds is called', () => {
    it('should return products that match with given product ids', async () => {
      jest.spyOn(model, 'find').mockResolvedValue([productStub()] as any);

      const result = await productsService.findByIds([mockedProductId]);
      expect(result).toEqual([productStub()]);
    });
  });

  /* findByIdAndUpdate function tests */
  describe('When findByIdAndUpdate is called', () => {
    it('should update the given product and return it', async () => {
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(productStub() as any);

      const updateObject = { qty: 1 };
      const result = await productsService.findByIdAndUpdate(mockedProductId, updateObject);
      expect(result).toEqual(productStub());
    });
  });
});
