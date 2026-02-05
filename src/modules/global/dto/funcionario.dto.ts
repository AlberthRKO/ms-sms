import { IsNumber, IsString } from 'class-validator';

export class Funcionario {
  @IsNumber()
  id: number;

  @IsString()
  nombre: string;
}
