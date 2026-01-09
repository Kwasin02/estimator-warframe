import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ItemsSearchResponseDto } from './dto/items-search.response.dto';

@Controller('items')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  // GET /items/search?q=mesa&limit=20
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ): Promise<ItemsSearchResponseDto> {
    const parsedLimit = limit ? Number(limit) : 20;
    return this.catalog.search(
      q,
      Number.isFinite(parsedLimit) ? parsedLimit : 20,
    );
  }
}
