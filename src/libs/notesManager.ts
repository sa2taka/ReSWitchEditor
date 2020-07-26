import { Note, Quantize } from '../types';
export class NotesManager {
  notes: (Note | 'none')[] = [];

  public setNote(measure: number, line: number, quantize: Quantize) {
    if (measure < 0) {
      return;
    }

    if (line < 0 || 15 < line) {
      return;
    }

    const normalizationValue = 24; // 96 / 4
    const normalizationMeasure = (measure * normalizationValue) / quantize;

    const length = this.notes.length;

    if (normalizationMeasure >= length) {
      const noneLength = normalizationMeasure - length;
      const noneArray = new Array(noneLength).fill('none');
      this.notes = this.notes.concat(noneArray);
      this.notes.push({
        color: 'red',
        type: 'single',
        line,
      });
    } else {
      this.setExistantNote(normalizationMeasure, line);
    }
  }

  public setExistantNote(normalizationMeasure: number, line: number) {
    const existantNote = this.notes[normalizationMeasure];

    if (existantNote === 'none') {
      this.notes[normalizationMeasure] = {
        color: 'red',
        type: 'single',
        line,
      };
    } else if (existantNote.line !== line) {
      this.notes[normalizationMeasure] = {
        color: 'red',
        type: 'single',
        line,
      };
    } else if (existantNote.color === 'red' && existantNote.type === 'single') {
      this.notes[normalizationMeasure] = {
        color: 'blue',
        type: 'single',
        line,
      };
    } else if (
      existantNote.color === 'blue' &&
      existantNote.type === 'single'
    ) {
      this.notes[normalizationMeasure] = {
        color: 'purple',
        type: 'single',
        line,
      };
    } else if (
      existantNote.color === 'purple' &&
      existantNote.type === 'single'
    ) {
      this.notes[normalizationMeasure] = {
        color: 'red',
        type: 'sequence',
        line,
      };
    } else if (
      existantNote.color === 'red' &&
      existantNote.type === 'sequence'
    ) {
      this.notes[normalizationMeasure] = {
        color: 'blue',
        type: 'sequence',
        line,
      };
    } else if (
      existantNote.color === 'blue' &&
      existantNote.type === 'sequence'
    ) {
      this.notes[normalizationMeasure] = {
        color: 'purple',
        type: 'sequence',
        line,
      };
    } else if (
      existantNote.color === 'purple' &&
      existantNote.type === 'sequence'
    ) {
      this.notes[normalizationMeasure] = 'none';
    }
  }
}
