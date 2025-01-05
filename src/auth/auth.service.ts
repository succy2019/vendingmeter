import { Injectable } from '@nestjs/common';
import { PaystackService } from '../paystack/paystack.service';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly paystackService: PaystackService,
  ) {}

  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const names = fullName.trim().split(' ');
    return {
      firstName: names[0],
      lastName: names[names.length - 1] || names[0]
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Split fullname for Paystack
    const { firstName, lastName } = this.splitFullName(createUserDto.fullname);

    // Create DVA account
    const dvaResponse = await this.paystackService.createDedicatedVirtualAccount({
      email: createUserDto.email,
      firstName,
      lastName,
      phone: createUserDto.phone,
    });

    // Store original fullname in database
    const user = await this.databaseService.user.create({
      data: {
        ...createUserDto,
        created_at: new Date(),
        updated_at: new Date(),
        accountNumber: dvaResponse.data.account_number,
        accountName: dvaResponse.data.account_name,
        bankName: dvaResponse.data.bank_name || 'Default Bank',
        
        // ...rest of user data
      }
    });

}
}