import * as PIXI from "pixi.js"

import { ObservableQuaternion } from "./quaternion"
import { Transform3D } from "./transform"
import { ObservablePoint3D } from "./point"

/**
 * A container represents a collection of 3D objects.
 */
export class Container3D extends PIXI.Container {
  transform = new Transform3D()

  set position(value: ObservablePoint3D) {
    this.transform.position.copyFrom(value)
  }

  get position(): ObservablePoint3D {
    return this.transform.position
  }

  set scale(value: ObservablePoint3D) {
    this.transform.scale.copyFrom(value)
  }

  get scale(): ObservablePoint3D {
    return this.transform.scale
  }

  set rotationQuaternion(value: ObservableQuaternion) {
    this.transform.rotationQuaternion.copyFrom(value)
  }

  /** The quaternion rotation of the object. */
  get rotationQuaternion(): ObservableQuaternion {
    return this.transform.rotationQuaternion
  }

  /** The position of the object on the z axis relative to the local 
   * coordinates of the parent. */
  get z() {
    return this.transform.position.z
  }

  set z(value: number) {
    this.transform.position.z = value
  }
}