import { Note, Quantize } from '../types';
export class NotesManager {
  notes: (Note | 'none')[] = [];
  _defaultNote:
    | 'red-single'
    | 'blue-single'
    | 'purple-single'
    | 'red-slide'
    | 'blue-slide'
    | 'purple-slide' = 'red-single';

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
      const note = this.generateDefaultNote(line);
      this.notes.push(note);
    } else {
      this.setExistantNote(normalizationMeasure, line);
    }
  }

  public setDefaultNote(
    defaultNote:
      | 'red-single'
      | 'blue-single'
      | 'purple-single'
      | 'red-slide'
      | 'blue-slide'
      | 'purple-slide'
  ) {
    this._defaultNote = defaultNote;
  }

  generateDefaultNote(line: number): Note {
    switch (this._defaultNote) {
      case 'red-single':
        return {
          color: 'red',
          type: 'single',
          line,
        };
      case 'blue-single':
        return {
          color: 'blue',
          type: 'single',
          line,
        };
      case 'purple-single':
        return {
          color: 'purple',
          type: 'single',
          line,
        };
      case 'red-slide':
        return {
          color: 'red',
          type: 'sequence',
          line,
        };
      case 'blue-slide':
        return {
          color: 'blue',
          type: 'sequence',
          line,
        };
      case 'purple-slide':
        return {
          color: 'purple',
          type: 'sequence',
          line,
        };
    }
  }

  setExistantNote(normalizationMeasure: number, line: number) {
    const existantNote = this.notes[normalizationMeasure];
    const defaultNote = this.generateDefaultNote(line);

    if (existantNote === 'none') {
      this.notes[normalizationMeasure] = defaultNote;
    } else if (existantNote.line !== line) {
      this.notes[normalizationMeasure] = defaultNote;
    } else if (existantNote.color === 'red' && existantNote.type === 'single') {
      let note: Note | 'none';
      if (this._defaultNote === 'blue-single') {
        note = 'none';
      } else {
        note = {
          color: 'blue',
          type: 'single',
          line,
        };
      }
      this.notes[normalizationMeasure] = note;
    } else if (
      existantNote.color === 'blue' &&
      existantNote.type === 'single'
    ) {
      let note: Note | 'none';
      if (this._defaultNote === 'purple-single') {
        note = 'none';
      } else {
        note = {
          color: 'purple',
          type: 'single',
          line,
        };
      }
      this.notes[normalizationMeasure] = note;
    } else if (
      existantNote.color === 'purple' &&
      existantNote.type === 'single'
    ) {
      let note: Note | 'none';
      if (this._defaultNote === 'red-slide') {
        note = 'none';
      } else {
        note = {
          color: 'red',
          type: 'sequence',
          line,
        };
      }
      this.notes[normalizationMeasure] = note;
    } else if (
      existantNote.color === 'red' &&
      existantNote.type === 'sequence'
    ) {
      let note: Note | 'none';
      if (this._defaultNote === 'blue-slide') {
        note = 'none';
      } else {
        note = {
          color: 'blue',
          type: 'sequence',
          line,
        };
      }
      this.notes[normalizationMeasure] = note;
    } else if (
      existantNote.color === 'blue' &&
      existantNote.type === 'sequence'
    ) {
      let note: Note | 'none';
      if (this._defaultNote === 'purple-slide') {
        note = 'none';
      } else {
        note = {
          color: 'purple',
          type: 'sequence',
          line,
        };
      }
      this.notes[normalizationMeasure] = note;
    } else if (
      existantNote.color === 'purple' &&
      existantNote.type === 'sequence'
    ) {
      let note: Note | 'none';
      if (this._defaultNote === 'red-single') {
        note = 'none';
      } else {
        note = {
          color: 'red',
          type: 'single',
          line,
        };
      }
      this.notes[normalizationMeasure] = note;
    }
  }
}
