import { Audio } from './libs/audio';
import { Quantize, Note } from './types';
import { NotesManager } from './libs/notesManager';

export class CanvasApp {
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;

  leftMargin = 64;
  lineDistance = 16;
  scoreDistance = 32;
  yMargin = 32;

  isExpandedLine = false;

  isDragging = false;
  isDragged = false;
  draggingStartX = 0;
  draggingStartY = 0;
  draggingDistance = 0;
  deemStoppingThreshold = 10;
  columnSide = 48;
  padding = 64;
  gapX = 0;
  gapY = 0;

  bpm = 120;
  quantize: Quantize = 2;

  isStarted = false;

  isAnimationStarted = false;
  audio: Audio;

  beforeAnimationAt = 0;

  notesManager: NotesManager;

  blueSingleNote!: HTMLImageElement;
  redSingleNote!: HTMLImageElement;
  purpleSingleNote!: HTMLImageElement;
  blueSlideNote!: HTMLImageElement;
  redSlideNote!: HTMLImageElement;
  purpleSlideNote!: HTMLImageElement;

  public onLeftClick?: (measure: number, line: number) => void;
  public onRightClick?: (time: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    audio: Audio,
    notesManager: NotesManager
  ) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.audio = audio;
    this.notesManager = notesManager;
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleDrag.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.initImage();
  }

  initImage() {
    this.blueSingleNote = new Image();
    this.blueSingleNote.src = '/blue_note.png';
    this.redSingleNote = new Image();
    this.redSingleNote.src = '/red_note.png';
    this.purpleSingleNote = new Image();
    this.purpleSingleNote.src = '/purple_note.png';
    this.blueSlideNote = new Image();
    this.blueSlideNote.src = '/blue_slide.png';
    this.redSlideNote = new Image();
    this.redSlideNote.src = '/red_slide.png';
    this.purpleSlideNote = new Image();
    this.purpleSlideNote.src = '/purple_slide.png';
  }

  public draw() {
    this.clearCanvas();
    this.drawScores();
    this.drawNowLine();
    this.drawNotes();
  }

  public start() {
    this.isStarted = true;
    this.animate();
  }

  public stop() {
    this.isStarted = false;
  }

  animate(ts?: number) {
    if (this.isStarted) {
      this.moveWindow(ts, this.beforeAnimationAt);
      this.draw();
      if (ts) {
        this.beforeAnimationAt = ts;
      }
      window.requestAnimationFrame(ts => this.animate(ts));
    }
  }

  public setExpandedLine(isExpandedLine: boolean) {
    this.isExpandedLine = isExpandedLine;
    this.draw();
  }

  public setBpm(bpm: number) {
    this.bpm = bpm;
  }

  public setQuantize(quantize: Quantize) {
    this.quantize = quantize;
    this.draw();
  }

  drawScore(originX: number) {
    const height = this.context.canvas.clientHeight;
    for (let i = 0; i < 16; i++) {
      this.context.beginPath();
      this.context.moveTo(originX + i * this.lineDistance, this.yMargin);
      this.context.lineTo(
        originX + i * this.lineDistance,
        height - this.yMargin
      );
      this.context.lineWidth = 2;
      this.context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.context.stroke();
    }

    const quantizeDistance =
      (height - 2 * this.yMargin) /
      ((this.isExpandedLine ? 2 : 4) * this.quantize * 4);
    const startX = originX;
    const endX = originX + 15 * this.lineDistance;

    // quantize line

    const quantizeLineCount = (this.isExpandedLine ? 2 : 4) * this.quantize * 4;
    for (let i = 0; i < quantizeLineCount; i++) {
      this.context.beginPath();
      this.context.moveTo(startX, i * quantizeDistance + this.yMargin);
      this.context.lineTo(endX, i * quantizeDistance + this.yMargin);
      this.context.lineWidth = 2;
      this.context.strokeStyle = 'rgb(255, 255, 255, 0.5)';
      this.context.stroke();
    }

    const distance =
      (height - 2 * this.yMargin) / (this.isExpandedLine ? 2 : 4);

    const lineCount = this.isExpandedLine ? 3 : 5;
    for (let i = 0; i < lineCount; i++) {
      if (i !== 0) {
        const numberOfMeasure = this.getNumberOfMeasure(
          startX,
          i * distance + this.yMargin
        );
        this.context.font =
          '12px Helvetica Neue,Arial,Hiragino Kaku Gothic ProN,Hiragino Sans,BIZ UDPGothic,Meiryo,sans-serif';
        this.context.fillStyle = 'rgb(255, 255, 255)';
        this.context.fillText(
          (numberOfMeasure + 1).toString(),
          startX - (numberOfMeasure + 1).toString().length * 6 - 4,
          i * distance + this.yMargin + 4
        );
      }

      this.context.beginPath();
      this.context.moveTo(startX, i * distance + this.yMargin);
      this.context.lineTo(endX, i * distance + this.yMargin);
      this.context.lineWidth = i === 0 || i === lineCount - 1 ? 4 : 2;
      this.context.strokeStyle = 'rgb(255, 255, 255)';
      this.context.stroke();
    }
  }

  drawScores() {
    const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
    const width = this.context.canvas.clientWidth;
    const startX =
      (this.gapX % oneScoreWidth) - oneScoreWidth + this.leftMargin;
    const lastX = width + this.lineDistance * 16;
    let x = startX;
    while (x < lastX) {
      if (-this.gapX + x < 0) {
        x += this.lineDistance * 16 + this.scoreDistance;
        continue;
      }
      this.drawScore(x);
      x += this.lineDistance * 16 + this.scoreDistance;
    }
  }

  drawNotes() {
    this.notesManager.notes.forEach((value, index) => {
      if (value === 'none') {
        return;
      }
      const { x, y } = this.getPointFromNoteLocation(index, value.line);

      let noteImage!: HTMLImageElement;
      if (value.color === 'red' && value.type === 'single') {
        noteImage = this.redSingleNote;
      } else if (value.color === 'blue' && value.type === 'single') {
        noteImage = this.blueSingleNote;
      } else if (value.color === 'purple' && value.type === 'single') {
        noteImage = this.purpleSingleNote;
      } else if (value.color === 'red' && value.type === 'sequence') {
        noteImage = this.redSlideNote;
      } else if (value.color === 'blue' && value.type === 'sequence') {
        noteImage = this.blueSlideNote;
      } else if (value.color === 'purple' && value.type === 'sequence') {
        noteImage = this.purpleSlideNote;
      }
      const width = 16;
      const height = 8;
      this.context.drawImage(
        noteImage,
        x - width / 2,
        y - height / 2,
        width,
        height
      );
    });
  }

  drawNowLine() {
    const { x, y } = this.convetTimeToPoint(this.audio.currentTime);

    this.context.beginPath();
    this.context.moveTo(x - 8, y);
    this.context.lineTo(x + this.lineDistance * 15 + 8, y);
    this.context.lineWidth = 2;
    this.context.strokeStyle = '#FF9800';
    this.context.stroke();
  }

  moveWindow(now?: number, beforeAt?: number) {
    const { x } = this.convetTimeToPoint(this.audio.currentTime);
    const width = this.context.canvas.clientWidth;

    if (width / 3 < x && now && beforeAt) {
      const dividedBy = this.isExpandedLine ? 2 : 4;
      const oneLinePassTime = (dividedBy * 60) / this.bpm;
      const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
      const movePerSecond = oneScoreWidth / oneLinePassTime;
      const diff = (now - beforeAt) / 1000;
      this.gapX -= movePerSecond * diff;
    }
  }

  handleDrag(event: MouseEvent) {
    if (!this.isDragging) {
      return;
    }

    const diffX = event.offsetX - this.draggingStartX;
    const diffY = event.offsetY - this.draggingStartY;
    if (Math.abs(diffX) > 1) {
      this.isDragged = true;
    }
    this.draggingStartX = event.offsetX;
    this.draggingStartY = event.offsetY;
    this.gapX += diffX;
    this.gapY += diffY;
    this.draggingDistance += Math.sqrt(diffX ** 2 + diffY ** 2);
    if (this.gapX > 0) {
      this.gapX = 0;
    }

    this.draw();
  }

  handleClick(event: MouseEvent) {
    if (this.isDragged) {
      this.isDragged = false;
      return;
    }
    switch (event.which) {
      case 1: {
        this.handleLeftClick(event);
      }
    }
    this.draw();
  }

  handleLeftClick(event: MouseEvent) {
    // 8 is margin
    const x = event.clientX;
    const y = event.clientY - 8;

    const measure = this.getNumberOfQuontize(x, y);
    const line = this.getNumberOfLine(x);

    if (line < 0 || 15 < line) {
      return;
    }

    this.notesManager.setNote(measure, line, this.quantize);

    return {
      measure,
      line,
    };
  }

  handleMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.draggingStartX = event.offsetX;
    this.draggingStartY = event.offsetY;
    this.draggingDistance = 0;
  }

  handleMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  clearCanvas() {
    this.context!.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getNumberOfMeasure(x: number, y: number) {
    const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
    const absoluteX = x - this.gapX - this.leftMargin;
    const numberOfLine = Math.floor(absoluteX / oneScoreWidth);
    const dividedBy = this.isExpandedLine ? 2 : 4;
    const height = this.context.canvas.clientHeight;
    const yDistance = height - this.yMargin * 2;
    const absoluteY = y - this.yMargin;
    const oneMeasureHeight = yDistance / dividedBy;
    const oneQuaitizeHeight = oneMeasureHeight / (this.quantize * 4);
    const yLocation =
      dividedBy -
      Math.ceil((absoluteY - oneQuaitizeHeight / 2) / oneMeasureHeight);

    return numberOfLine * dividedBy + yLocation;
  }

  convetTimeToPoint(time: number) {
    const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
    const nowCountOfBeat = time * (this.bpm / 60);
    const dividedBy = this.isExpandedLine ? 2 : 4;
    const height = this.context.canvas.clientHeight;
    const yDistance = height - this.yMargin * 2;
    const oneMeasureHeight = yDistance / dividedBy;

    const intCountOfBeat = Math.trunc(nowCountOfBeat);
    const floorOfBeat = this.getAfterPoint(nowCountOfBeat);

    const detailYLocation = oneMeasureHeight * floorOfBeat;
    const beatYLocation = (yDistance / dividedBy) * intCountOfBeat;
    const xLocation =
      this.gapX + oneScoreWidth * Math.floor(intCountOfBeat / dividedBy);

    return {
      x: xLocation + this.leftMargin,
      y:
        height - ((detailYLocation + beatYLocation) % yDistance) - this.yMargin,
    };
  }

  getAfterPoint(num: number) {
    const arr = String(num).split('.');

    if (arr[1]) {
      return Number('0.' + arr[1]);
    } else {
      return 0;
    }
  }

  getNumberOfQuontize(x: number, y: number) {
    const margin = 16;
    const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
    const absoluteX = x - this.gapX - this.leftMargin + margin;
    const numberOfLine = Math.floor(absoluteX / oneScoreWidth);

    const dividedBy = (this.isExpandedLine ? 2 : 4) * this.quantize * 4;
    const height = this.context.canvas.clientHeight;
    const yDistance = height - this.yMargin * 2;
    const absoluteY = y - this.yMargin;
    const oneMeasureHeight = yDistance / (this.isExpandedLine ? 2 : 4);
    const oneQuaitizeHeight = oneMeasureHeight / (this.quantize * 4);
    const yLocation = dividedBy - Math.round(absoluteY / oneQuaitizeHeight);

    if (
      absoluteY + oneQuaitizeHeight / 2 < 0 ||
      yDistance < absoluteY - oneQuaitizeHeight / 2
    ) {
      return -1;
    }
    return numberOfLine * dividedBy + yLocation;
  }

  getNumberOfLine(x: number) {
    const margin = 8;
    const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
    const absoluteX = x - this.gapX - this.leftMargin + margin;
    const numberOfScoreLine = Math.floor(absoluteX / oneScoreWidth);
    const scoreLineStartX = numberOfScoreLine * oneScoreWidth;
    const xInScoreLine = absoluteX - scoreLineStartX;

    return Math.floor(xInScoreLine / this.lineDistance);
  }

  getPointFromNoteLocation(index: number, line: number) {
    const dividedBy = 96;
    const lineCount = this.isExpandedLine ? 2 : 4;
    const scoreLine = Math.floor(index / (dividedBy * lineCount));
    const yLocation =
      dividedBy * lineCount - (index - scoreLine * dividedBy * lineCount);

    const height = this.context.canvas.clientHeight;
    const yDistance = height - this.yMargin * 2;

    const unitHeight = yDistance / (dividedBy * lineCount);
    const y = yLocation * unitHeight + this.yMargin;

    const oneScoreWidth = this.lineDistance * 16 + this.scoreDistance;
    const lineStartX = oneScoreWidth * scoreLine;
    const x =
      line * this.lineDistance + lineStartX + this.leftMargin + this.gapX;

    return { x, y };
  }
}
