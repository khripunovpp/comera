import {Component, ElementRef, signal, viewChild, ViewEncapsulation} from '@angular/core';

declare var cocoSsd: any;
declare var tf: any;

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [],
  templateUrl: './broadcast.component.html',
  styleUrl: './broadcast.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BroadcastComponent {
  status = signal('status');
  video = viewChild<ElementRef<HTMLVideoElement>>('webcam');
  liveView = viewChild<ElementRef<HTMLElement>>('liveView');

  model: any = null;
  children: any[] = [];

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
      cocoSsd.load().then((loadedModel: any) => {
        console.log('Model loaded.')
        this.model = loadedModel;
      });
    }
  }

  getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  enableCam(event: any) {
    // Only continue if the COCO-SSD has finished loading.
    if (!this.model) {
      return;
    }

    // Hide the button once clicked.
    event.target.classList.add('removed');

    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        if (!this.video()) return
        this.video()!.nativeElement.srcObject = stream;
        this.video()!.nativeElement.addEventListener('loadeddata', () => {
          this.predictWebcam();
        });
      });
  }

  windows: any[] = [];

  predictWebcam() {
    if (!this.model) {
      return;
    }

    // Now let's start classifying a frame in the stream.
    this.model.detect(this.video()?.nativeElement).then((predictions: any) => {
      // Remove any highlighting we did previous frame.
      for (let i = 0; i < this.children.length; i++) {
        this.liveView()?.nativeElement.removeChild(this.children[i]);
      }
      this.children.splice(0);

      // Now lets loop through predictions and draw them to the live view if
      // they have a high confidence score.
      for (let n = 0; n < predictions.length; n++) {
        // If we are over 66% sure we are sure we classified it right, draw it!
        if (predictions[n].score > 0.66) {
          const p = document.createElement('p');
          p.innerText = predictions[n].class + ' - with '
            + Math.round(parseFloat(predictions[n].score) * 100)
            + '% confidence.';
          // @ts-ignore
          p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: '
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          // @ts-ignore
          highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: '
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

          this.liveView()?.nativeElement.appendChild(highlighter);
          this.liveView()?.nativeElement.appendChild(p);
          this.children.push(highlighter);
          this.children.push(p);
        }
      }

      // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(this.predictWebcam.bind(this));
    }).catch((error: any) => {
      console.log(error);
    });
  }

}
