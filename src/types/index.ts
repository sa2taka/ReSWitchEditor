export interface Note {
  color: 'blue' | 'red' | 'purple';
  type: 'single' | 'sequence';
  line: number;
}

export interface MusicInfo {
  name?: string;
  bpm?: number;
  musicFile?: string;
}

export interface Score {
  info: MusicInfo;
  notes: (Note | 'none')[];
}

export type Quantize = 1 | 2 | 3 | 4 | 6 | 8;

export type Point = {
  x: number;
  y: number;
};
