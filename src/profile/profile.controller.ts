import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/strategy/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@GetUser('userId') userId: string) {
    console.log('User ID:', userId);
    return this.profileService.getProfile(userId);
  }
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @Get()
  async getAll() {
    return this.profileService.getAllProfiles();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@GetUser('userId') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@GetUser('userId') userId: string) {
   return this.profileService.softDeleteProfile(userId);
  }
}
