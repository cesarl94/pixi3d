import { Renderer } from "@pixi/core"
import { StandardSurfaceMaterial } from "./standard-surface-material"

export namespace StandardSurfaceShaderSource {
  export function buildVertex(source: string, vertexFeatures: string[], renderer: Renderer, uvsCount: number) {
    source = source.replace(/#define VERTEX_UV_IN/, Array.from({ length: uvsCount }, (_, i) => `VERT_IN vec2 a_UV${i};`).join('\n'));
    source = source.replace(/#define VERTEX_UV_OUT/, Array.from({ length: uvsCount }, (_, i) => `VERT_OUT vec2 v_UV${i};`).join('\n'));
    source = source.replace(/#define VERTEX_UV_PASS/, Array.from({ length: uvsCount }, (_, i) => `v_UV${i} = a_UV${i};`).join('\n'));

    if (renderer.context.webGLVersion === 1) {
      source = source.replace(/VERSION/, "100")
        .replace(/VERT_IN/g, "attribute")
        .replace(/VERT_OUT/g, "varying")
    }
    if (renderer.context.webGLVersion === 2) {
      source = source.replace(/VERSION/, "300 es")
        .replace(/VERT_IN/g, "in")
        .replace(/VERT_OUT/g, "out")
    }
    return source.replace(/#define FEATURES/,
      vertexFeatures.map(value => `#define ${value}`).join("\n"))
  }

  export function buildFragment(source: string, fragmentFeatures: string[], renderer: Renderer, uvsCount: number, material:StandardSurfaceMaterial) {
    let surfaceUniforms:string[] = material.getTextureUniformNames().map((str)=>{return `uniform sampler2D ${str};`})
    surfaceUniforms.concat(material.getScalarUniformNames().map((str)=>{return `uniform float ${str};`}))
    surfaceUniforms.concat(material.getVectors2UniformNames().map((str)=>{return `uniform vec2 ${str};`}))
    surfaceUniforms.concat(material.getVectors3UniformNames().map((str)=>{return `uniform vec3 ${str};`}))
    surfaceUniforms.concat(material.getVectors4UniformNames().map((str)=>{return `uniform vec4 ${str};`}))
    source = source.replace(/#define SURFACE_UNIFORMS/, surfaceUniforms.join("\n"))
    
    source = source.replace(/#define FRAG_UV_IN/, Array.from({ length: uvsCount }, (_, i) => `FRAG_IN vec2 v_UV${i};`).join('\n'));
    
    source = source.replace(/#define SURFACE_FRAG_SHADER/, material.getSurfaceShader());
    
    if (renderer.context.webGLVersion === 1) {
      source = source.replace(/VERSION/, "100")
        .replace(/FRAG_COLOR/g, "gl_FragColor")
        .replace(/FRAG_IN/g, "varying")
    }
    if (renderer.context.webGLVersion === 2) {
      source = source.replace(/VERSION/, "300 es")
        .replace(/FRAG_COLOR/g, "g_finalColor")
        .replace(/FRAG_IN/g, "in")
    }

    return source.replace(/#define FEATURES/,
      fragmentFeatures.map(value => `#define ${value}`).join("\n"))
  }
}