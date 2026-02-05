import { Length, IsUUID, IsInt, Min } from 'class-validator';
import { ParamsIntValidator, ParamsStringValidator } from '../decorators/params.decorator';
import { Expose } from 'class-transformer';

export namespace CommonParamsDto {
  /**
   * DTO genérico para ID
   */
  export class Id {
    @ParamsIntValidator({ description: 'ID numérico', example: 1 })
    id: number;
  }

  export class IdString {
    @ParamsStringValidator({ description: 'ID de texto', example: 'abc123' })
    id: string;
  }

  export class IdUuid {
    @IsUUID('4', { message: 'El ID debe ser un UUID válido (versión 4)' })
    @Length(36, 36, { message: 'El ID UUID debe tener exactamente 36 caracteres' })
    @ParamsStringValidator({
      description: 'ID UUID versión 4',
      maxLength: 36,
      example: '0f68b4e2-ae5b-43e4-80ec-53d9e41e4426',
      format: 'uuid',
    })
    id: string;
  }

  /* --------------------------------------- params para documentos y versiones --------------------------------------- */
  export class MsDocumentIdUuid {
    @Expose()
    @IsUUID('4', { message: 'El ID debe ser un UUID válido (versión 4)' })
    @Length(36, 36, { message: 'El ID UUID debe tener exactamente 36 caracteres' })
    @ParamsStringValidator({
      description: 'ID UUID versión 4 del documento',
      maxLength: 36,
      example: '0f68b4e2-ae5b-43e4-80ec-53d9e41e4426',
      format: 'uuid',
    })
    msDocumentId: string;
  }

  export class VersionId {
    @Expose()
    @ParamsIntValidator({ description: 'ID numérico de versión', example: 1 })
    versionId: number;
  }

  export class IdUuidWithVersion extends MsDocumentIdUuid {
    @IsInt({ message: 'el identificador  de versión debe ser un número entero' })
    @Min(1, { message: 'El identificador de versión debe ser mayor o igual a 1' })
    @ParamsIntValidator({
      description: 'identificador numérico de la versión del documento',
      example: 1,
    })
    version: number;
  }
}
