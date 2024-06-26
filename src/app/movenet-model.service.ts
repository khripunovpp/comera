import {inject, Injectable} from "@angular/core";
import {tfProv} from "./tf.provider";
import {ModelService} from "./model.service";
import {CameraService} from "./camera.service";

@Injectable({
  providedIn: 'root'
})
export class MovenetModelService {

  readonly cropWidth = 480;
  // canvas = signal<HTMLCanvasElement | null>(null)
  private readonly cameraService = inject(CameraService);
  private readonly tf = inject(tfProv)
  private readonly modelService = inject(ModelService);

  bind(
    canvasElement: HTMLCanvasElement,
  ) {
  }

  predict(
    input: any,
  ) {
    return this.modelService.model().predict(input);
  }

  getCropPoint() {
    const video = this.cameraService.video()!;
    if (!video) return [0, 0];
    return [
      (video.videoWidth - this.cropWidth) / 2,
      0,
    ]
  }

  calculateFaceSquare(
    leftEar: { x: number, y: number },
    rightEar: { x: number, y: number }
  ): number {
    // Calculate the distance between ears
    const d = Math.sqrt(Math.pow(rightEar.x - leftEar.x, 2) + Math.pow(rightEar.y - leftEar.y, 2));

    // Calculate the side of the square
    const s = d / Math.sqrt(2);

    // Calculate the square area
    const S = Math.pow(s, 2);

    return S;
  }

  calculateFaceWidth(
    leftEar: { x: number, y: number },
    rightEar: { x: number, y: number }
  ): number {
    return Math.abs(rightEar.x - leftEar.x);
  }

  calculateFaceHeight(
    leftEar: { x: number, y: number },
    rightEar: { x: number, y: number }
  ): number {
    return this.calculateFaceWidth(leftEar, rightEar) * 1.5;
  }

  prepareImgTensor() {
    const points = this.getCropPoint();
    const imageTensor = this.tf.browser.fromPixels(this.cameraService.video());
    const croppedImage = this._cropImage(imageTensor, points[0], points[1], this.cropWidth);
    const resizedImage = this.tf.image.resizeBilinear(croppedImage, [192, 192], true).toInt();
    const tensor = this.tf.expandDims(resizedImage);

    return {
      tensor,
      dispose: () => {
        imageTensor.dispose();
        croppedImage.dispose();
        resizedImage.dispose();
        tensor.dispose();
      }
    }
  }

  async calculate() {
    let img = this.prepareImgTensor();
    let tensorOutput = this.predict(img.tensor);
    let arrayOutput = await tensorOutput.array();
    let cords = this._parseCords(arrayOutput)
    img.dispose();
    tensorOutput.dispose();
    return cords;
  }

  private _cropImage(image: any, x: any, y: any, width: any) {
    const cropStartPoint = [y, x];
    const cropSize = [width, width];
    return this.tf.slice(image, cropStartPoint, cropSize);
  }

  private _parseCords(arrayOutput: any) {
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
}
