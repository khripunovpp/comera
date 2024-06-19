import {computed, inject, Injectable, signal} from "@angular/core";
import {CameraService} from "../camera.service";
import {ModelService} from "../model.service";
import {MovenetModelService} from "../movenet-model.service";
import {Helpers} from "../helpers";

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  constructor() {
  }

  cameraService = inject(CameraService);
  modelService = inject(ModelService);
  movenetModelService = inject(MovenetModelService);
  dotsCords: Record<string, {
    x: number,
    y: number,
    color: string
  }> = {
    nose: {x: 0, y: 0, color: 'blue'},
    leftEye: {x: 0, y: 0, color: 'red'},
    rightEye: {x: 0, y: 0, color: 'red'},
    leftEar: {x: 0, y: 0, color: 'red'},
    rightEar: {x: 0, y: 0, color: 'red'},
    leftShoulder: {x: 0, y: 0, color: 'red'},
    rightShoulder: {x: 0, y: 0, color: 'red'},
    leftElbow: {x: 0, y: 0, color: 'red'},
    rightElbow: {x: 0, y: 0, color: 'red'},
    leftWrist: {x: 0, y: 0, color: 'red'},
    rightWrist: {x: 0, y: 0, color: 'red'},
    leftHip: {x: 0, y: 0, color: 'red'},
    rightHip: {x: 0, y: 0, color: 'red'},
    leftKnee: {x: 0, y: 0, color: 'red'},
    rightKnee: {x: 0, y: 0, color: 'red'},
    leftAnkle: {x: 0, y: 0, color: 'red'},
    rightAnkle: {x: 0, y: 0, color: 'red'},
  }
  dotsRefs: Record<string, any> = {}
  pointWidth = 4;
  picksDimensions: Record<string, {
    width: number;
    height: number
  }> = {
    'dickpick': {
      width: 80,
      height: 103
    },
    'dickMask': {
      width: 100,
      height: 191
    },
  }
  activePic = signal('dickMask');
  dickPickCords = signal({
    x: 0,
    y: 0
  });
  shouldShowDick = computed(() => {
    return this.dickPickCords().x > 0
      && this.dickPickCords().y > 0
  });
  canEnableCam = computed(() => {
    return this.cameraService.supports() && this.modelService.model();
  });
  streamStarted = this.cameraService.streamStarted
  supports = this.cameraService.supports
  modelReady = this.modelService.model
  private readonly previousCoords: Record<string, { x: number[], y: number[] }> = {};
  private readonly confidenceThreshold = 0.4;
  private readonly bufferLength = 10;
  private readonly threshold = 0.5;

  get imgWidth() {
    return this.picksDimensions[this.activePic()].width;
  }

  get imgHeight() {
    return this.picksDimensions[this.activePic()].height;
  }

  get windowCords() {
    return {
      x: this.movenetModelService.cropPoint[0],
      y: this.movenetModelService.cropPoint[1],
    }
  }

  get windowWidth() {
    return this.movenetModelService.cropWidth;
  }

  load(
    video: HTMLVideoElement
  ) {
    this.modelService.load().then(() => {
      this.cameraService.bind(video);
    });
  }

  enable() {
    if (!this.modelService.model()) return;
    if (this.cameraService.supports()) {
      this._enableCam();
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }
  }

  putDot(
    cords: Record<string, { x: number; y: number; confidence: number }>,
    key: string
  ) {
    if (!this.getCords(key)) return;
    const enoughConfidence = cords[key].confidence >= this.confidenceThreshold;

    if (enoughConfidence) {
      this.putIfOk(key, this.calcAbsoluteCords(cords[key]));

      if (key !== 'nose') return;
      const {x, y} = this.getCords(key);
      const {width, height} = this.picksDimensions[this.activePic()];
      this.dickPickCords.set({
        x: x - width / 2,
        y: y - height / 2
      });

    }

    this.updateDot(key);
  }

  putIfOk(
    key: string,
    value: [number, number],
  ) {
    if (!this.previousCoords[key]) {
      this.previousCoords[key] = {x: [], y: []};
    }
    const shouldUpdateDotsCordsX = this.calculateStdDeviation(this.previousCoords[key].x, value[0]);
    const shouldUpdateDotsCordsY = this.calculateStdDeviation(this.previousCoords[key].y, value[1]);

    if (this.isOk(shouldUpdateDotsCordsX)) {
      this.dotsCords[key].x = value[0];
    }
    if (this.isOk(shouldUpdateDotsCordsY)) {
      this.dotsCords[key].y = value[1];
    }
  }

  getCords(
    key: string
  ) {
    return this.dotsCords[key];
  }

  calcAbsoluteCords(
    value: {
      x: number
      y: number
    },
  ): [number, number] {
    return [
      Math.ceil((value.x * this.movenetModelService.cropWidth) + this.movenetModelService.cropPoint[0] - (this.pointWidth / 2)),
      Math.ceil((value.y * this.movenetModelService.cropWidth) + this.movenetModelService.cropPoint[1] - (this.pointWidth / 2))
    ]
  }

  updateDot(
    key: string
  ) {
    if (!this.dotsRefs[key]) return;
    this.dotsRefs[key].style.top = `${this.dotsCords[key].y}px`;
    this.dotsRefs[key].style.left = `${this.dotsCords[key].x}px`;
  }

  async drawPoints(cords: any) {
    Object.keys(this.dotsCords).forEach((key) => {
      this.putDot(cords, key);
    });
  }

  predictWebcam(currentTime: number) {
    this.movenetModelService.calculate()
      .then(cords => this.drawPoints(cords))
      .then(() => {
        window.requestAnimationFrame(() => {
          this.predictWebcam(currentTime);
        });
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  makePhotoByTimeout(
    timeout: number
  ) {
    setTimeout(() => {
      this.makePhoto();
    }, timeout)
  }

  makePhoto() {
    this.openPhotoInNewTab(this.cameraService.makePhoto() ?? '');
  }

  openPhotoInNewTab(
    dataUrl: string
  ) {
    const win = window.open();
    if (!win) return;
    win.document.write(`<img src="${dataUrl}"/>`);
  }

  private _enableCam() {
    this.cameraService.enableCam().then(() => {
      const startTime = performance.now();
      this.predictWebcam(startTime);
    })
  }

  private isOk(
    stdDeviation: number
  ) {
    return stdDeviation > this.threshold;
  }

  private calculateStdDeviation(coords: number[], newValue: number): number {
    if (newValue) coords.push(newValue);

    // Ограничиваем размер массива до последних 10 элементов
    if (coords.length > this.bufferLength) coords.shift();

    // Вычисляем среднее значение
    const mean = Helpers.calculateMean(coords);

    // Вычисляем среднее отклонение
    const stdDeviation = Helpers.calculateStdDeviation(coords, mean);

    // Возвращаем true, если стандартное отклонение превышает пороговое значение
    return stdDeviation;
  }
}
