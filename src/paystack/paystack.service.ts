import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  async createDedicatedVirtualAccount(userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/dedicated_account`,
        {
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          preferred_bank: 'wema-bank',
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create DVA: ${error.message}`);
    }
  }
}
