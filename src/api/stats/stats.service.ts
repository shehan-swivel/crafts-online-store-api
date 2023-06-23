import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatus } from 'src/constants/enums';
import { formatDate, subtractDays } from 'src/utils/date-time-utils';
import { Order } from '../orders/schemas/order.schema';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/schemas/product.schema';
import { Analytics } from './interfaces';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private productService: ProductsService,
  ) {}

  /**
   * Calculate analytics data
   * @returns {Promise<Analytics>}
   */
  async getAnalytics(): Promise<Analytics> {
    const currentDate = new Date();
    const sevenDaysAgo = subtractDays(currentDate, 7); // Calculate the date 7 days ago

    const [totalProducts, totalOrders, pendingOrders, totalRevenue, orderCounts, salesPerProduct] = await Promise.all([
      // Get total products count
      this.productModel.count(),

      // Get total orders count
      this.orderModel.count(),

      // Get pending orders count
      this.orderModel.count({ status: OrderStatus.PENDING }),

      // Get total price of completed orders
      this.orderModel.aggregate([
        { $match: { status: OrderStatus.COMPLETED } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]),

      // Get last 7 days orders count
      this.orderModel.aggregate([
        { $match: { createdAt: { $gt: sevenDaysAgo, $lt: currentDate } } }, // Filter orders within the last 7 days
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Group by the day
            count: { $sum: 1 }, // Count the number of orders in each group
          },
        },
        // { $sort: { createdAt: 1 } }, // Sort the results by date in ascending order
        { $project: { count: 1, date: '$_id', _id: 0 } },
      ]),

      // Get top 5 selling products
      this.orderModel.aggregate([
        { $unwind: '$items' }, // Unwind the items array to create a separate document for each item
        {
          $group: {
            _id: '$items.product', // Group by product
            totalQuantitySold: { $sum: '$items.qty' }, // Calculate the total quantity sold for each product
          },
        },
        { $sort: { totalQuantitySold: -1 } }, // Sort the products by quantity sold in descending order
        { $limit: 5 }, // Limit the result to the desired number of top-selling products
      ]),
    ]);

    // Last 7 days orders calculations
    const orderCountsMap = orderCounts.reduce((prevValue, currentValue) => {
      return { ...prevValue, [currentValue.date]: currentValue.count };
    }, {});

    const orderCountPerDay = [];

    // Fill no orders dates with count 0
    for (let index = 6; index >= 0; index--) {
      const date = formatDate(subtractDays(currentDate, index));

      if (!orderCountsMap[date]) {
        orderCountPerDay.push({ date: formatDate(subtractDays(currentDate, index)), count: 0 });
      } else {
        orderCountPerDay.push({ date: formatDate(subtractDays(currentDate, index)), count: orderCountsMap[date] });
      }
    }

    // Top selling products calculations
    const salesPerProductMap = salesPerProduct.reduce((prevValue, currentValue) => {
      return { ...prevValue, [currentValue._id]: currentValue.totalQuantitySold };
    }, {});

    const productIds = Object.keys(salesPerProductMap);
    const products = await this.productService.findByIds(productIds);

    const topSellingProducts = products
      .map((product) => {
        return {
          name: product.name,
          qty: salesPerProductMap[product.id],
          image: product.image,
        };
      })
      .sort((a, b) => (a.qty < b.qty ? 1 : -1));

    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.amount ?? 0,
      orderCountPerDay,
      topSellingProducts,
    };
  }
}
