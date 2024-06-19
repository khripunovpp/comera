import {inject, Injectable, signal} from "@angular/core";
import {tfProv} from "../tf.provider";


@Injectable({
  providedIn: 'root'
})
export class ModelService {
  model = signal<any | null>(null)
  status = signal<string | null>(null)
  tf = inject(tfProv)
  MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4';

  async load() {
    if (this.tf.version.tfjs) {
      this.status.set('Loaded TensorFlow.js - version: ' + this.tf.version.tfjs);

      this.model.set(await this.tf.loadGraphModel(this.MODEL_PATH, {fromTFHub: true}));
      this.status.set('Model loaded');
    }
  }
}
