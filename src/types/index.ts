export interface Note {
  type: 'blue' | 'red' | 'purple';
  line: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
}

export type None = 'none';

export interface MusicInfo {
  name: string;
  bpm: number;
  musicFile: string;
}

export interface Score {
  info: MusicInfo;
  notes: Note | None;
}

export type Quantize = 1 | 2 | 3 | 4 | 6 | 8;

export type Point = {
  x: number;
  y: number;
};
