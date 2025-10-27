import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Search query (q) is required' })
  @MinLength(2, { message: 'Search term must be at least 2 characters long' })
  q: string;
}