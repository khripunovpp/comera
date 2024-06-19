import {Injectable, signal} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  streamStarted = false;
  constraints = {
    video: true
  };
  supports = signal(!!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia))
  video = signal<HTMLVideoElement | null>(null)

  bind(
    videoElement: HTMLVideoElement,
  ) {
    this.video.set(videoElement);
  }

  enableCam() {
    return new Promise<void>((resolve, reject) => {
      return navigator.mediaDevices.getUserMedia(this.constraints)
        .then((stream: any) => {
          if (!this.video()) return
          // this.renderDots();
          this.video()!.srcObject = stream;
          this.video()!.addEventListener('loadeddata', () => {
            this.streamStarted = true;
            resolve();
          });
        });
    });
  }
}
