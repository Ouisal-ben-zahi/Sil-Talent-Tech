import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { EntrepriseService } from './entreprise.service'
import { CompanyRequestDto } from './dto/company-request.dto'

@Controller('entreprise')
export class EntrepriseController {
  constructor(private readonly entrepriseService: EntrepriseService) {}

  @Post('demande')
  @HttpCode(HttpStatus.OK)
  async createCompanyRequest(@Body() companyRequestDto: CompanyRequestDto) {
    return await this.entrepriseService.createCompanyRequest(companyRequestDto)
  }
}




