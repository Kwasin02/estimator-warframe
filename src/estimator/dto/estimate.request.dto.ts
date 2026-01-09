import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EstimateItemInputDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}

export class EstimateRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20) // MVP protection
  @ValidateNested({ each: true })
  @Type(() => EstimateItemInputDto)
  items!: EstimateItemInputDto[];

  @IsOptional()
  @IsBoolean()
  crossplay?: boolean; // default true en el servicio
}
