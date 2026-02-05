import { QueryBooleanValidator } from '../decorators/query.decorator';

export namespace CommonQueryDto {
  /**
   * DTO genérico para query parameter 'includeContent'
   * Usado para determinar si se debe incluir contenido en la respuesta
   */
  export class IncludeContent {
    @QueryBooleanValidator({
      description: 'Incluir contenido en la respuesta',
      default: false,
      required: false,
    })
    includeContent?: boolean;
  }

  /**
   * DTO genérico para query parameter 'IncludeDocsInactive'
   * Usado para determinar si se deben incluir registros inactivos
   */
  export class IncludeDocsInactive {
    @QueryBooleanValidator({
      description: 'Incluir registros inactivos',
      example: false,
      default: false,
      required: false,
    })
    includeDocsInactive?: boolean = false;
  }
}
