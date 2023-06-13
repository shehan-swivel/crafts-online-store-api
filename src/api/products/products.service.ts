import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3Service } from 'src/shared/s3.service';
import { CreateProductDto, ProductQuery, UpdateProductDto } from './dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>, private s3Service: S3Service) {}

  /**
   * Create a new product
   * @param {CreateProductDto} createProductDto
   * @param {Express.Multer.File} file
   * @returns {Promise<Product>}
   */
  async create(createProductDto: CreateProductDto, file: Express.Multer.File): Promise<Product> {
    if (file) {
      createProductDto.image = await this.s3Service.upload(file); // Assign uploaded image url
    }
    return this.productModel.create(createProductDto);
  }

  /**
   * Retrieves all products from the database.
   * @param {ProductQuery} query
   * @returns {Promise<Product[]>}
   */
  async findAll(query: ProductQuery): Promise<Product[]> {
    const { name, category, limit } = query;

    const filter: any = {};

    // Set filter values
    if (name) filter.name = new RegExp(name, 'i');
    if (category) filter.category = category;

    return await this.productModel
      .find(filter)
      .collation({ locale: 'en' })
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .exec();
  }

  /**
   * Updates an existing product.
   * @param {string} id
   * @param {UpdateProductDto} updateProductDto
   * @param {Express.Multer.File} file
   * @returns {Promise<Product>}
   */
  async update(id: string, updateProductDto: UpdateProductDto, file: Express.Multer.File): Promise<Product> {
    const product = await this.productModel.findById(id);

    // Throw not found error when product is not found
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Update product image if new image has been provided
    if (file) {
      updateProductDto.image = await this.s3Service.upload(file, product.image); // Assign uploaded image url
    }

    const { name, description, qty, price, category, image } = updateProductDto;

    product.name = name;
    product.description = description;
    product.qty = qty;
    product.price = price;
    product.category = category;
    product.image = image;

    return product.save();
  }

  /**
   * Delete an product by id
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id: string): Promise<boolean> {
    const product = await this.productModel.findById(id);

    // Throw not found error when product is not found
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const result = await this.productModel.deleteOne({ _id: id });
    return !!result.deletedCount;
  }

  /**
   * Retrieves an product by id.
   * @param {string} id
   * @returns {Promise<Product>}
   */
  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    // Throw not found error when product is not found
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Retrieves list of products by ids
   * @param {string[]} ids
   * @returns {Promise<ProductDocument[]>}
   */
  async findByIds(ids: string[]): Promise<ProductDocument[]> {
    return this.productModel.find({
      _id: {
        $in: ids,
      },
    });
  }

  /**
   * Find by id and update
   * @param {string} id
   * @param {object} updateObject
   * @returns {Promise<ProductDocument>}
   */
  async findByIdAndUpdate(id: string, updateObject: object): Promise<ProductDocument> {
    return this.productModel.findByIdAndUpdate(id, updateObject);
  }
}
