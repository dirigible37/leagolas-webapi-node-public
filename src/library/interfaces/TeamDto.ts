import { BanDto } from './BanDto';
import { ObjectivesDto } from './ObjectivesDto';

export interface TeamDto {
  bans: BanDto[];
  objectives: ObjectivesDto;
  teamId: number;
  win: boolean;
}
