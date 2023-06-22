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
import { ApiBearerAuth, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IdParamDto } from 'src/common/dto';
import { ApiResponse } from 'src/common/responses';
import { AccessTokenGuard } from '../auth/guards';
import { CreateProductDto, ProductQuery, UpdateProductDto } from './dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product created successfully.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiResponse> {
    const data = await this.productsService.create(createProductDto, file);
    return new ApiResponse(data, 'Product created successfully');
  }

  @Get()
  @ApiOkResponse({ description: 'Orders fetched successfully.' })
  async findAll(@Query() query: ProductQuery): Promise<ApiResponse> {
    const data = await this.productsService.findAll(query);
    return new ApiResponse(data);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product updated successfully.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @ApiConsumes('multipart/form-data')
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
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async delete(@Param() params: IdParamDto): Promise<ApiResponse> {
    await this.productsService.delete(params.id);
    return new ApiResponse(null, 'Product deleted successfully');
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Product fetched successfully.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  async findById(@Param() params: IdParamDto): Promise<ApiResponse> {
    const data = await this.productsService.findById(params.id);
    return new ApiResponse(data);
  }
}
