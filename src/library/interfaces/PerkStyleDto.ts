import { PerkStyleSelectionDto } from './PerkStyleSelectionDto';

export interface PerkStyleDto {
  description: string;
  selections: PerkStyleSelectionDto[];
  style: number;
}
