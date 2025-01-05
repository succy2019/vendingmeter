import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Check if meter number already exists
      const existingUser = await this.databaseService.user.findFirst({
        where: { meter: createUserDto.meter }
      });

      if (existingUser) {
        throw new HttpException('User  already exist', HttpStatus.BAD_REQUEST);
      }

      // Create new user
      const newUser = await this.databaseService.user.create({
        data: {
          ...createUserDto,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return newUser;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async login(meter: string) {
    const user = await this.databaseService.user.findFirst({ where: { meter } });
    if (user) {
      return user; // Return user data or a token
    }
    throw new Error('Invalid credentials');
  }

  async findOne(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    return user;
  }
}

