import { PerkStatsDto } from './PerkStatsDto';
import { PerkStyleDto } from './PerkStyleDto';

export interface PerksDto {
  statPerks: PerkStatsDto;
  styles: PerkStyleDto[];
}
