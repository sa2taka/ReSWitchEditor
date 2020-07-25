export class Audio {
  AudioContext = window.AudioContext;
  context = new AudioContext();
  buffer!: AudioBuffer;
  source!: AudioBufferSourceNode;
  isPlaying = false;
  startedAt = 0;
  pausedAt = 0;

  public onFinished?: () => void;

  public play() {
    const offset = this.pausedAt;
    if (this.isPlaying) {
      this.pause;
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.onended = () => {
      if (this.onFinished) {
        this.onFinished();
      }
    };
    this.source.connect(this.context.destination);
    this.source.start(0, offset);

    this.startedAt = this.context.currentTime - offset;
    this.pausedAt = 0;
    this.isPlaying = true;
  }

  public pause() {
    const elapsed = this.context.currentTime - this.startedAt;
    this.stop();
    this.pausedAt = elapsed;
  }

  public stop() {
    if (this.source) {
      this.source.disconnect();
      this.source.stop(0);
      // @ts-ignore ガーベジコレクションに食わせるため
      this.source = null;
    }
    this.pausedAt = 0;
    this.startedAt = 0;
    this.isPlaying = false;
  }

  public resume() {
    // @ts-ignore
    this.context.resume();
    this.isPlaying = true;
  }

  public get currentTime() {
    if (this.pausedAt) {
      return this.pausedAt;
    }
    if (this.startedAt) {
      return this.context.currentTime - this.startedAt;
    }
    return 0;
  }

  public loadFile(file: string) {
    this.getAudioBuffer(file);
  }

  toArrayBuffer(buf: Buffer) {
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }

  getAudioBuffer(file: string) {
    //@ts-ignore
    window.ipcRenderer
      .invoke('read-file', file)
      .then((data: any) => {
        this.context.decodeAudioData(this.toArrayBuffer(data), buffer => {
          this.buffer = buffer;
        });
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}
