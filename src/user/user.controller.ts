import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { SearchUserDto } from './dto/search-user.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { GetUser } from 'src/auth/strategy/get-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(@Query() query: any) {
    const dto = plainToInstance(SearchUserDto, query);
    try {
      await validateOrReject(dto);
    } catch (errors) {
      const messages = errors
        .map((err) => Object.values(err.constraints))
        .flat();
      throw new BadRequestException(messages);
    }

    const users = await this.userService.searchUsersRpc(dto.q);
    return {
      message: 'Search successful',
      count: users.length,
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  async deleteMe(@GetUser('userId') userId: string) {
    const user = await this.userService.softDeleteUser(userId);
    return {
      message: 'User soft deleted successfully',
      userId: user.id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  async updateRole(
    @Param('id') userId: string,
    @Body('role') role: 'admin' | 'user',
    @GetUser() currentUser: any,
  ) {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Faqat admin rolni o‘zgartira oladi');
    }

    const updated = await this.userService.updateRole(userId, role);
    return {
      message: `Foydalanuvchi roli "${role}" ga o‘zgartirildi`,
      user: updated,
    };
  }
}
