import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsString, IsOptional, IsBoolean, IsEmail, IsEnum } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators/public.decorator';

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}
class AddressDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsString() line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() pincode: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}


class CreateStaffDto {
  @IsEmail() email: string;
  @IsString() name: string;
  @IsString() password: string;
  @IsEnum(Role) role: Role;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() roleId?: string;
}

class AdminUpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsString() roleId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser() u: any) {
    return this.users.findById(u.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() u: any, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(u.id, dto);
  }

  @Get('me/addresses')
  addresses(@CurrentUser() u: any) {
    return this.users.listAddresses(u.id);
  }

  @Post('me/addresses')
  addAddress(@CurrentUser() u: any, @Body() dto: AddressDto) {
    return this.users.addAddress(u.id, dto);
  }

  @Patch('me/addresses/:id')
  updateAddress(@CurrentUser() u: any, @Param('id') id: string, @Body() dto: Partial<AddressDto>) {
    return this.users.updateAddress(u.id, id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddress(@CurrentUser() u: any, @Param('id') id: string) {
    return this.users.deleteAddress(u.id, id);
  }

  // Admin
  @Roles(Role.ADMIN)
  @Get()
  list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.users.list(Number(page), Number(limit));
  }

  // Admin user management
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listAll(@Query('search') search?: string) {
    return this.users.listAll(search);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createStaff(@Body() dto: CreateStaffDto) {
    return this.users.createStaff(dto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateById(@Param('id') id: string, @Body() dto: AdminUpdateUserDto, @CurrentUser() me: any) {
    return this.users.adminUpdate(id, dto, me.id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deactivate(@Param('id') id: string, @CurrentUser() me: any) {
    return this.users.deactivate(id, me.id);
  }

}
