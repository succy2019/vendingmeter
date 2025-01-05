import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async create(@Body() body: { CreateUserDto: CreateUserDto }) {
    try {
      console.log('Received registration data:', body); // Debug log

      if (!body.CreateUserDto) {
        throw new HttpException('Invalid request data', HttpStatus.BAD_REQUEST);
      }

      const result = await this.userService.create(body.CreateUserDto);
      
      return {
        success: true,
        message: 'User registered successfully',
        user: result
      };
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      throw new HttpException({
        success: false,
        message: error.message || 'Registration failed'
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { meter: string }, @Session() session: Record<string, any>) {
    try {
      const user = await this.userService.login(body.meter);
      session.user = user;
      session.isAuthenticated = true;
      
      return {
        success: true,
        message: 'Login successful',
        user
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: error.message || 'Login failed'
      }, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('check-session')
  async checkSession(@Session() session: Record<string, any>) {
    if (session.isAuthenticated && session.user) {
      return { 
        isAuthenticated: true, 
        user: session.user 
      };
    }
    throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
  }

  @Get('profile')
  async getProfile(@Session() session: Record<string, any>) {
    if (!session.isAuthenticated || !session.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.userService.findOne(session.user.id);
    return {
      success: true,
      user
    };
  }
}
