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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleDrag.bind(this));
  }

  public draw() {
    this.clearCanvas();
    this.drawScores();
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
}
