import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatus } from 'src/constants/enums';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto, OrderQuery, UpdateOrderStatusDto } from './dto';
import { LastOrderNumber } from './schemas/last-order-number.schema';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(LastOrderNumber.name) private lastOrderNumberModel: Model<LastOrderNumber>,
    private productService: ProductsService,
  ) {}

  /**
   * Create a new order
   * @param {CreateOrderDto} createOrderDto
   * @returns {Promise<Order>}
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    let total = 0;

    const productIds = createOrderDto.items.map((item) => item.product);
    const products = await this.productService.findByIds(productIds);

    // Check whether all the items are exist
    if (products.length !== productIds.length) {
      throw new UnprocessableEntityException('One or more items in your order are invalid or unavailable.');
    }

    const itemsMap = createOrderDto.items.reduce((accumulator, currentValue) => {
      return { ...accumulator, [currentValue.product]: currentValue.qty };
    }, {});

    // Check whether all the quantities are available
    for (const product of products) {
      if (product.qty < itemsMap[product.id]) {
        throw new UnprocessableEntityException('One or more items in your order are invalid or unavailable.');
      } else {
        // Subtract product quantities when quantities are available
        product.qty = product.qty - itemsMap[product.id];

        // Calculate total price
        total += product.price * itemsMap[product.id];
      }
    }

    // Find last order number
    let lastOrderNumberDoc = await this.lastOrderNumberModel.findOne();

    // Create last order number document if not exist
    if (!lastOrderNumberDoc) {
      lastOrderNumberDoc = await this.lastOrderNumberModel.create({ number: 0 });
    }

    const currentOrderNumber = lastOrderNumberDoc.number + 1;
    const orderNumber = currentOrderNumber.toString().padStart(4, '0');

    createOrderDto.status = OrderStatus.PENDING;
    createOrderDto.orderNumber = orderNumber;
    createOrderDto.amount = total;

    const result = await this.orderModel.create(createOrderDto);

    // Update each product's quantity
    for (const product of products) {
      await this.productService.findByIdAndUpdate(product.id, { qty: product.qty });
    }

    // Update the last used order number in the database
    lastOrderNumberDoc.number = currentOrderNumber;
    await lastOrderNumberDoc.save();

    return result;
  }

  /**
   * Retrieves all orders from the database.
   * @param {OrderQuery} query
   * @returns {Promise<Order[]>}
   */
  async findAll(query: OrderQuery): Promise<Order[]> {
    const { orderNumber, status, orderBy, order } = query;

    // To avoid sort by not defined fields and control which fields can be used to sort
    const orderByValues = { orderNumber: true, amount: true, status: true, customerName: true };
    // To avoid sort by not defined orders and control which order can be used to sort
    const orderValues = { asc: true, desc: true };

    const filter: any = {};
    const sort: any = {};

    // Set filter values
    if (orderNumber) filter.orderNumber = new RegExp(orderNumber, 'i');
    if (status) filter.status = status;

    // Set sorting field and order
    if (orderByValues[orderBy] && orderValues[order]) {
      sort[orderBy] = order;
    } else {
      sort.createdAt = 'desc';
    }

    return this.orderModel.find(filter).collation({ locale: 'en' }).sort(sort).populate('items.product').exec();
  }

  /**
   * Update an order status
   * @returns {Promise<Order>}
   */
  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id);

    // Throw not found error when order is not found
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Return if new order status same as previous
    if (updateOrderStatusDto.status === order.status) {
      return order;
    }

    order.status = updateOrderStatusDto.status;
    const result = order.save();

    // Add cancelled order items back to the product list when order is cancelled
    if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
      const productIds = order.items.map((item) => item.product.toString());
      const products = await this.productService.findByIds(productIds);

      const itemsMap = order.items.reduce((accumulator, currentValue) => {
        return { ...accumulator, [currentValue.product.toString()]: currentValue.qty };
      }, {});

      // Update each product's quantity after order status updated successfully
      for (const product of products) {
        product.qty = product.qty + itemsMap[product.id];
        await this.productService.findByIdAndUpdate(product.id, { qty: product.qty });
      }
    }

    return result;
  }

  /**
   * Delete an order by id
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id: string): Promise<boolean> {
    const order = await this.orderModel.findById(id);

    // Throw not found error when order is not found
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const result = await this.orderModel.deleteOne({ _id: id });
    return !!result.deletedCount;
  }

  /**
   * Retrieves an order by id.
   * @param {string} id
   * @returns {Promise<Order>}
   */
  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id);

    // Throw not found error when product is not found
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
