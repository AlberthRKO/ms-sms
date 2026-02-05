// skip-response-format.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_FORMAT = 'skipResponseFormat';
const SkipResponseFormat = () => SetMetadata(SKIP_RESPONSE_FORMAT, true);
