import { Audio } from './libs/audio';

export class CanvasApp {
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;

  leftMargin = 64;
  lineDistance = 12;
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

  isAnimationStarted = false;
  audio: Audio;

  constructor(canvas: HTMLCanvasElement, audio: Audio) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.audio = audio;
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleDrag.bind(this));
  }

  public draw() {
    this.clearCanvas();
    this.drawScores();
    this.drawNowLine();
  }

  public setExpandedLine(isExpandedLine: boolean) {
    this.isExpandedLine = isExpandedLine;
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

    const distance =
      (height - 2 * this.yMargin) / (this.isExpandedLine ? 2 : 4);
    const startX = originX;
    const endX = originX + 15 * this.lineDistance;

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
          numberOfMeasure.toString(),
          startX - numberOfMeasure.toString().length * 8 - 4,
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
    const width = this.context.canvas.clientWidth;
    const startX =
      (this.gapX % (this.lineDistance * 16)) -
      this.lineDistance * 16 +
      this.leftMargin;
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

  drawNowLine() {
    // n
  }

  handleDrag(event: MouseEvent) {
    if (!this.isDragging) {
      return;
    }
    this.isDragged = true;
    const diffX = event.offsetX - this.draggingStartX;
    const diffY = event.offsetY - this.draggingStartY;
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
    const onMeasureHeight = yDistance / dividedBy;
    const yLocation = dividedBy - Math.round(absoluteY / onMeasureHeight);

    return numberOfLine * dividedBy + yLocation;
  }
}
