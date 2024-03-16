import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse } from 'src/schemas/api/ApiResponse';
import { ApiUser } from 'src/schemas/api/ApiUser';
import axios from 'axios';
import { ApiMethods, ApiUrl } from 'src/schemas/api/ApiUrls';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiService {
    constructor(private readonly configService: ConfigService){
    }
}
