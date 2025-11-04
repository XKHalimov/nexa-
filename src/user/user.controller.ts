import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
