import {Injectable, signal} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  streamStarted = signal(false)
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
          this.video()!.srcObject = stream;
          this.video()!.addEventListener('loadeddata', () => {
            this.streamStarted.set(true);
            resolve();
          });
        });
    });
  }

  makePhoto() {
    if (!this.video()?.videoWidth || !this.video()?.videoHeight) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.width = this.video()!.videoWidth;
    canvas.height = this.video()!.videoHeight;
    context.drawImage(this.video()!, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }
}
