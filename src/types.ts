export interface Topic {
  id: string;
  title: string;
  sideA: string;
  sideB: string;
  isUsed: boolean;
}

export interface Slot {
  id: number;
  name: string;
  topics: Topic[];
  lastDrawnId?: string | null;
}

export interface DayData {
  id: number;
  activeSlotId: number;
  slots: Slot[];
}

export type AppData = Record<number, DayData>;

export enum ViewMode {
  MANAGE = 'MANAGE',
  DRAW = 'DRAW'
}
