import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('search')
  async searchUsers(@Query('term') searchTerm: string) {
    return this.userService.searchUsersRpc(searchTerm);
  }

  @Patch('soft-delete')
  async softDeleteUser(@Body('userId') userId: string) {
    return this.userService.softDeleteUser(userId);
  }

  @Patch('update-role')
  async updateRole(
    @Body('userId') userId: string,
    @Body('role') role: 'admin' | 'user',
  ) {
    return this.userService.updateRole(userId, role);
  }
}
