import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Sil Talents Tech API - Version 1.0.0';
  }
}



