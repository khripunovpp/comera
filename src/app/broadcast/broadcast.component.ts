import {Component, ElementRef, signal, viewChild, ViewEncapsulation} from '@angular/core';
import {JsonPipe, NgIf} from "@angular/common";

declare var cocoSsd: any;
declare var tf: any;
declare var navigator: any;

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [
    JsonPipe,
    NgIf
  ],
  templateUrl: './broadcast.component.html',
  styleUrl: './broadcast.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BroadcastComponent {
  status = signal('status');
  video = viewChild<ElementRef<HTMLVideoElement>>('webcam');
  dots = viewChild<ElementRef<HTMLElement>>('dots');
  model: any = null;
  cropPoint = [170, 15];
  cropWidth = 345;
  MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';
  pointWidth = 4;
  dickPickCords = {
    x: 0,
    y: 0,
  }
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
  streamStarted = false;
  constraints = {
    video: true
  };

  onButtonClick(e: Event) {
    if (this.getUserMediaSupported()) {
      this.enableCam(e);
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }
  }

  ngOnInit() {
    if (tf.version.tfjs) {
      if (this.status()) {
        this.status.set('Loaded TensorFlow.js - version: ' + tf.version.tfjs);
      }
      this.loadModel();

    }
  }

  async loadModel() {
    this.model = await tf.loadGraphModel(this.MODEL_PATH, {fromTFHub: true});
    if (this.status()) {
      this.status.set('Model loaded');
    }
  }

  renderDots() {
    this.dotsRefs = Object.keys(this.dotsCords)
      .reduce((acc, key) => {
        const dot = document.createElement('div');
        dot.id = key;
        dot.style.position = 'absolute';
        dot.style.width = `${this.pointWidth}px`;
        dot.style.height = `${this.pointWidth}px`;
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = this.dotsCords[key].color;
        this.dots()!.nativeElement.appendChild(dot);
        acc[key] = dot;
        return acc;
      }, {} as any);
  }

  putDot(
    cords: Record<string, {
      x: number
      y: number
      confidence: number
    }>,
    key: string,
  ) {
    if (!this.dotsCords[key]) return
    let x = 0
    let y = 0
    if (cords[key].confidence >= 0.4) {
      x = (cords[key].x * 345) + this.cropPoint[0] - (this.pointWidth / 2)
      y = (cords[key].y * 345) + this.cropPoint[1] - (this.pointWidth / 2)

      if (key === 'nose') {
        this.dickPickCords.x = x
        this.dickPickCords.y = y
      }
    } else {
      x = 0
      y = 0
    }
    this.dotsCords[key].x = x
    this.dotsCords[key].y = y
    this.updateDot(key)
  }

  updateDot(
    key: string
  ) {
    this.dotsRefs[key].style.top = `${this.dotsCords[key].y}px`;
    this.dotsRefs[key].style.left = `${this.dotsCords[key].x}px`;
  }

  async drawPoints(cords: any) {
    this.putDot(cords, 'nose');
    this.putDot(cords, 'leftEye');
    this.putDot(cords, 'rightEye');
    this.putDot(cords, 'leftEar');
    this.putDot(cords, 'rightEar');
    this.putDot(cords, 'leftShoulder');
    this.putDot(cords, 'rightShoulder');
    this.putDot(cords, 'leftElbow');
    this.putDot(cords, 'rightElbow');
    this.putDot(cords, 'leftWrist');
    this.putDot(cords, 'rightWrist');
    this.putDot(cords, 'leftHip');
    this.putDot(cords, 'rightHip');
    this.putDot(cords, 'leftKnee');
    this.putDot(cords, 'rightKnee');
    this.putDot(cords, 'leftAnkle');
    this.putDot(cords, 'rightAnkle');
  }

  parseCords(arrayOutput: any) {
    const points = arrayOutput[0][0];
    return {
      nose: {
        x: points[0][1],
        y: points[0][0],
        confidence: points[0][2]
      },
      leftEye: {
        x: points[1][1],
        y: points[1][0],
        confidence: points[1][2]
      },
      rightEye: {
        x: points[2][1],
        y: points[2][0],
        confidence: points[2][2]
      },
      leftEar: {
        x: points[3][1],
        y: points[3][0],
        confidence: points[3][2]
      },
      rightEar: {
        x: points[4][1],
        y: points[4][0],
        confidence: points[4][2]
      },
      leftShoulder: {
        x: points[5][1],
        y: points[5][0],
        confidence: points[5][2]
      },

      rightShoulder: {
        x: points[6][1],
        y: points[6][0],
        confidence: points[6][2]
      },
      leftElbow: {
        x: points[7][1],
        y: points[7][0],
        confidence: points[7][2]
      },
      rightElbow: {
        x: points[8][1],
        y: points[8][0],
        confidence: points[8][2]
      },
      leftWrist: {
        x: points[9][1],
        y: points[9][0],
        confidence: points[9][2]
      },
      rightWrist: {
        x: points[10][1],
        y: points[10][0],
        confidence: points[10][2]
      },
      leftHip: {
        x: points[11][1],
        y: points[11][0],
        confidence: points[11][2]
      },
      rightHip: {
        x: points[12][1],
        y: points[12][0],
        confidence: points[12][2]
      },
      leftKnee: {
        x: points[13][1],
        y: points[13][0],
        confidence: points[13][2]
      },
      rightKnee: {
        x: points[14][1],
        y: points[14][0],
        confidence: points[14][2]
      },
      leftAnkle: {
        x: points[15][1],
        y: points[15][0],
        confidence: points[15][2]
      },
      rightAnkle: {
        x: points[16][1],
        y: points[16][0],
        confidence: points[16][2]
      }
    }
  }

  cropImage(image: any, x: any, y: any, width: any) {
    const cropStartPoint = [y, x];
    const cropSize = [width, width];
    return tf.slice(image, cropStartPoint, cropSize);
  }

  async calculate(
    img: any,
  ) {
    let imageTensor = tf.browser.fromPixels(img);
    let croppedImage = this.cropImage(imageTensor, this.cropPoint[0], this.cropPoint[1], this.cropWidth);
    let resizedImage = tf.image.resizeBilinear(croppedImage, [192, 192], true).toInt();
    let rtt = tf.expandDims(resizedImage);
    let tensorOutput = this.model.predict(rtt);
    let arrayOutput = await tensorOutput.array();
    let cords = this.parseCords(arrayOutput)
    await this.drawPoints(cords);
    imageTensor.dispose();
    croppedImage.dispose();
    resizedImage.dispose();
    tensorOutput.dispose();
    rtt.dispose();
  }

  getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  enableCam(
    event: any,
  ) {
    if (!this.model) return;

    navigator.mediaDevices.getUserMedia(this.constraints)
      .then((stream: any) => {
        if (!this.video()) return
        this.renderDots();
        this.video()!.nativeElement.srcObject = stream;
        this.video()!.nativeElement.addEventListener('loadeddata', () => {
          this.streamStarted = true;
          this.predictWebcam();
        });
      });
  }

  predictWebcam() {
    if (!this.model) return;

    this.calculate(this.video()?.nativeElement)
      .then(() => {
        window.requestAnimationFrame(this.predictWebcam.bind(this));
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
}
