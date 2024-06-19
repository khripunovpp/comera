import {InjectionToken} from "@angular/core";

declare const tf: any;

export const tfProv = new InjectionToken('TensorFlow Provider', {
  factory: () => {
    return tf;
  }
});
