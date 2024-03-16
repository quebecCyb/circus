import { Controller } from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';

@Controller()
export class UsersController {

    constructor(
        private readonly userService: UsersService,
    ){}

}
