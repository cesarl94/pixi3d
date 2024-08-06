import { Color } from "../../color"
import { StandardSurfaceMaterial } from "./standard-surface-material"

/** Material for instanced meshes which uses the standard material. */
export class InstancedStandardSurfaceMaterial {
  /** The base color of the material. */
 // baseColor: Color

  /** Creates a new instanced standard material from the specified material. */
  constructor(material: StandardSurfaceMaterial) {
    //this.baseColor = new Color(...material.baseColor.rgba)
  }
}