import { Program, Renderer, State, Buffer, Geometry } from "@pixi/core"

import { DRAW_MODES } from "@pixi/constants"

import { MeshGeometry3D } from "../../mesh/geometry/mesh-geometry"
import { Mesh3D } from "../../mesh/mesh"
import { MeshShader } from "../../mesh/mesh-shader"
import { StandardSurfaceShaderInstancing } from "./standard-surface-shader-instancing"
import { StandardSurfaceShaderSource } from "./standard-surface-shader-source"
import { Shader as MetallicRoughness } from "./shader/metallic-roughness.frag"
import { Shader as Primitive } from "./shader/primitive.vert"
import { StandardSurfaceMaterial } from "./standard-surface-material"

export class StandardSurfaceShader extends MeshShader {
  private _instancing = new StandardSurfaceShaderInstancing()

  static build(renderer: Renderer, vertexFeatures: string[], fragmentFeatures: string[], uvsCount:number, material:StandardSurfaceMaterial) {

    let vert = StandardSurfaceShaderSource.buildVertex(Primitive.source, vertexFeatures, renderer, uvsCount)
    let frag = StandardSurfaceShaderSource.buildFragment(MetallicRoughness.source, fragmentFeatures, renderer, uvsCount, material)

    let program = Program.from(vert, frag)
    return new StandardSurfaceShader(program)
  }

  get name() {
    return "standard-surface-shader"
  }

  createShaderGeometry(geometry: MeshGeometry3D, instanced: boolean) {
    let result = new Geometry()
    if (geometry.indices) {
      if (geometry.indices.buffer.BYTES_PER_ELEMENT === 1) {
        // PixiJS seems to have problems with Uint8Array, let's convert to UNSIGNED_SHORT.
        result.addIndex(new Buffer(new Uint16Array(geometry.indices.buffer)))
      } else {
        result.addIndex(new Buffer(geometry.indices.buffer))
      }
    }
    if (geometry.positions) {
      result.addAttribute("a_Position", new Buffer(geometry.positions.buffer),
        3, geometry.positions.normalized, geometry.positions.componentType, geometry.positions.stride)
    }

    if(geometry.uvs){
      for(let i=0;i<geometry.uvs.length;i++){
        const uv = geometry.uvs[i];
        result.addAttribute(`a_UV${i}`, new Buffer(uv.buffer), 2, uv.normalized, uv.componentType, uv.stride)
      }
    }

    if (geometry.normals) {
      result.addAttribute("a_Normal", new Buffer(geometry.normals.buffer),
        3, geometry.normals.normalized, geometry.normals.componentType, geometry.normals.stride)
    }
    if (geometry.tangents) {
      result.addAttribute("a_Tangent", new Buffer(geometry.tangents.buffer),
        4, geometry.tangents.normalized, geometry.tangents.componentType, geometry.tangents.stride)
    }
    if (geometry.colors) {
      result.addAttribute("a_Color", new Buffer(geometry.colors.buffer),
        geometry.colors.componentCount, geometry.colors.normalized, geometry.colors.componentType, geometry.colors.stride)
    }
    if (instanced) {
      this._instancing.addGeometryAttributes(result)
    }
    if (geometry.targets) {
      for (let i = 0; i < geometry.targets.length; i++) {
        let positions = geometry.targets[i].positions
        if (positions) {
          result.addAttribute(`a_Target_Position${i}`, new Buffer(positions.buffer),
            3, positions.normalized, positions.componentType, positions.stride)
        }
        let normals = geometry.targets[i].normals
        if (normals) {
          result.addAttribute(`a_Target_Normal${i}`, new Buffer(normals.buffer),
            3, normals.normalized, normals.componentType, normals.stride)
        }
        let tangents = geometry.targets[i].tangents
        if (tangents) {
          result.addAttribute(`a_Target_Tangent${i}`, new Buffer(tangents.buffer),
            3, tangents.normalized, tangents.componentType, tangents.stride)
        }
      }
    }
    if (geometry.joints) {
      result.addAttribute("a_Joint1", new Buffer(geometry.joints.buffer),
        4, geometry.joints.normalized, geometry.joints.componentType, geometry.joints.stride)
    }
    if (geometry.weights) {
      result.addAttribute("a_Weight1", new Buffer(geometry.weights.buffer),
        4, geometry.weights.normalized, geometry.weights.componentType, geometry.weights.stride)
    }
    return result
  }

  render(mesh: Mesh3D, renderer: Renderer, state: State, drawMode: DRAW_MODES) {
    if (mesh.instances.length > 0) {
      const filteredInstances = mesh.instances.filter((instance) => instance.worldVisible && instance.renderable);
      if (filteredInstances.length === 0) {
        //early exit - this avoids us drawing the last known instance in the instance buffer
        return;
      }
      this._instancing.updateBuffers(filteredInstances)
    }
    super.render(mesh, renderer, state, drawMode)
  }
}