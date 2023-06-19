import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdParamDto } from 'src/common/dto';
import { ApiResponse } from 'src/common/responses';
import { AccessTokenGuard } from '../auth/guards';
import { CreateProductDto, ProductQuery, UpdateProductDto } from './dto';
import { ProductsService } from './products.service';

@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiResponse> {
    const data = await this.productsService.create(createProductDto, file);
    return new ApiResponse(data, 'Product created successfully');
  }

  @Get()
  async findAll(@Query() query: ProductQuery): Promise<ApiResponse> {
    const data = await this.productsService.findAll(query);
    return new ApiResponse(data);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param() params: IdParamDto,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse> {
    const data = await this.productsService.update(params.id, updateProductDto, file);
    return new ApiResponse(data, 'Product updated successfully');
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async delete(@Param() params: IdParamDto): Promise<ApiResponse> {
    await this.productsService.delete(params.id);
    return new ApiResponse(null, 'Product deleted successfully');
  }

  @Get(':id')
  async findById(@Param() params: IdParamDto): Promise<ApiResponse> {
    const data = await this.productsService.findById(params.id);
    return new ApiResponse(data);
  }
}
