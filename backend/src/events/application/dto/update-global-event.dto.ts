import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalEventDto } from './create-global-event.dto';

export class UpdateGlobalEventDto extends PartialType(CreateGlobalEventDto) {}
