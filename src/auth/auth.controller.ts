import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SigninInput } from "./dto/inputs";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signin')
    async create(@Body() signinInput:SigninInput){
        return this.authService.signin(signinInput)
    }
}