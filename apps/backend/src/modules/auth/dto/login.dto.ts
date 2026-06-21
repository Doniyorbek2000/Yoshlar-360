import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@yoshlar360.uz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin12345' })
  @IsString()
  @MinLength(6)
  password: string;
}
