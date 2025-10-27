import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isGroup?: boolean = false;

  @IsArray()
  @IsNotEmpty()
  memberIds: string[];
}
