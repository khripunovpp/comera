import {ChangeDetectionStrategy, Component, ElementRef, inject, viewChild, ViewEncapsulation} from '@angular/core';
import {JsonPipe, NgIf} from "@angular/common";
import {tfProv} from "../tf.provider";
import {BroadcastService} from "./broadcast.service";

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [
    JsonPipe,
    NgIf
  ],
  templateUrl: './broadcast.component.html',
  styleUrl: './broadcast.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BroadcastComponent {
  video = viewChild<ElementRef<HTMLVideoElement>>('webcam');
  dots = viewChild<ElementRef<HTMLElement>>('dots');
  readonly broadcastService = inject(BroadcastService);
  readonly transitionDuration = 0.07;
  readonly tf = inject(tfProv)

  get transform() {
    return `translate3d(${this.broadcastService.dickPickCords().x}px, ${this.broadcastService.dickPickCords().y}px, 0)`;
  }

  get dickSrc() {
    return `./${this.broadcastService.activePic()}.png`;
  }

  ngOnInit() {
    if (!this.video()?.nativeElement) return
    this.broadcastService.load(this.video()!.nativeElement);
  }

  onButtonClick() {
    this.broadcastService.enable();
  }

  changePic() {
    this.broadcastService.dickPickCords.set({
      x: 0,
      y: 0
    });

    this.broadcastService.activePic.set(this.broadcastService.activePic() === 'dickMask' ? 'dickpick' : 'dickMask');
  }

  makePhoto() {
    return this.broadcastService.makePhotoByTimeout(2000);
  }
}
