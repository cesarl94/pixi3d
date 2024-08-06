import { IPointData } from "@pixi/math"
import { Renderer, Shader, BaseTexture} from "@pixi/core"

import { DEG_TO_RAD } from "@pixi/math"
import { LightType } from "../../lighting/light-type"
import { Material } from "../material"
import { Camera } from "../../camera/camera"
import { LightingEnvironment } from "../../lighting/lighting-environment"
import { Mesh3D } from "../../mesh/mesh"
import { ShadowCastingLight } from "../../shadow/shadow-casting-light"
import { Color } from "../../color"
import { ImageBasedLighting } from "../../lighting/image-based-lighting"
import { TextureTransform } from "../../texture/texture-transform"
import { StandardSurfaceShader } from "./standard-surface-shader"
import { StandardMaterialAlphaMode } from "../standard/standard-material-alpha-mode"
import { StandardMaterialDebugMode } from "../standard/standard-material-debug-mode"
import { StandardMaterialTexture } from "../standard/standard-material-texture"
import { StandardMaterialNormalTexture } from "../standard/standard-material-normal-texture"
import { StandardMaterialOcclusionTexture } from "../standard/standard-material-occlusion-texture"
import { StandardMaterialSkinUniforms } from "../standard/standard-material-skin-uniforms"
import { InstancedStandardSurfaceMaterial } from "./instanced-standard-surface-material"
import { StandardSurfaceMaterialFeatureSet } from "./standard-surface-material-feature-set"
import { StandardSurfaceMaterialFactory } from "./standard-surface-material-factory"
import { mat2, mat3, mat4, vec2, vec3, vec4 } from "gl-matrix"
import { IPoint3DData } from "../../transform/point"

const shaders: { [features: string]: StandardSurfaceShader } = {}

const getLightingEnvironmentConfigId = (env?: LightingEnvironment) => {
  return env ? (env.lights.length + (env.imageBasedLighting ? 0.5 : 0)) : 0
}

/**
 * TODO: Generate explanation for this
 */
export class StandardSurfaceMaterial extends Material {
  private _lightingEnvironment?: LightingEnvironment
  private _lightingEnvironmentConfigId = 0
  private _unlit = false
  private _alphaMode = StandardMaterialAlphaMode.blend
  private _debugMode?: StandardMaterialDebugMode
  // private _baseColorTexture?: StandardMaterialTexture
  // private _baseColorFactor = new Float32Array(4)
  // private _normalTexture?: StandardMaterialNormalTexture
  // private _occlusionTexture?: StandardMaterialOcclusionTexture
  // private _emissiveTexture?: StandardMaterialTexture
  // private _metallicRoughnessTexture?: StandardMaterialTexture
  private _shadowCastingLight?: ShadowCastingLight
  private _instancingEnabled = false

  private _skinUniforms = new StandardMaterialSkinUniforms()

  private _textures = new Map<string, BaseTexture>()
  private _scalars = new Map<string, number>()
  private _vectors2 = new Map<string, Float32Array>()
  private _vectors3 = new Map<string, Float32Array>()
  private _vectors4 = new Map<string, Float32Array>()
  private _customFragment = "";

  /** The roughness of the material. */
 // roughness = 1

  /** The metalness of the material. */
 // metallic = 1

  /** The base color of the material. */
  //baseColor = new Color(1, 1, 1, 1)

  /** The cutoff threshold when alpha mode is set to "mask". */
  alphaCutoff = 0.5

  /** The emissive color of the material. */
  //emissive = new Color(0, 0, 0)

  /** The exposure (brightness) of the material. */
  exposure = 1

  /** The base color texture. */
  /*get baseColorTexture() {
    return this._baseColorTexture
  }*/

  /*set baseColorTexture(value: StandardMaterialTexture | undefined) {
    if (value !== this._baseColorTexture) {
      this.invalidateShader()
      if (!value?.transform && value?.frame && !value?.noFrame) {
        value.transform = TextureTransform.fromTexture(value)
      }
      this._baseColorTexture = value
    }
  }*/

  /** The metallic-roughness texture. */
 /* get metallicRoughnessTexture() {
    return this._metallicRoughnessTexture
  }*/

  /*set metallicRoughnessTexture(value: StandardMaterialTexture | undefined) {
    if (value !== this._metallicRoughnessTexture) {
      this.invalidateShader()
      if (!value?.transform && value?.frame && !value?.noFrame) {
        value.transform = TextureTransform.fromTexture(value)
      }
      this._metallicRoughnessTexture = value
    }
  }*/

  /** The normal map texture. */
  /*get normalTexture() {
    return this._normalTexture
  }*/

  /*set normalTexture(value: StandardMaterialNormalTexture | undefined) {
    if (value !== this._normalTexture) {
      this.invalidateShader()
      if (!value?.transform && value?.frame && !value?.noFrame) {
        value.transform = TextureTransform.fromTexture(value)
      }
      this._normalTexture = value
    }
  }*/

  /** The occlusion map texture. */
  /*get occlusionTexture() {
    return this._occlusionTexture
  }*/

  /*set occlusionTexture(value: StandardMaterialOcclusionTexture | undefined) {
    if (value !== this._occlusionTexture) {
      this.invalidateShader()
      if (!value?.transform && value?.frame && !value?.noFrame) {
        value.transform = TextureTransform.fromTexture(value)
      }
      this._occlusionTexture = value
    }
  }*/

  /** The emissive map texture. */
  /*get emissiveTexture() {
    return this._emissiveTexture
  }*/

  /*set emissiveTexture(value: StandardMaterialTexture | undefined) {
    if (value !== this._emissiveTexture) {
      this.invalidateShader()
      if (!value?.transform && value?.frame && !value?.noFrame) {
        value.transform = TextureTransform.fromTexture(value)
      }
      this._emissiveTexture = value
    }
  }*/

  /** The alpha rendering mode of the material. */
  get alphaMode() {
    return this._alphaMode
  }

  set alphaMode(value: StandardMaterialAlphaMode) {
    if (this._alphaMode !== value) {
      this._alphaMode = value
      this.invalidateShader()
    }
  }

  /** The shadow casting light of the material. */
  get shadowCastingLight() {
    return this._shadowCastingLight
  }

  set shadowCastingLight(value: ShadowCastingLight | undefined) {
    if (value !== this._shadowCastingLight) {
      this.invalidateShader()
      this._shadowCastingLight = value
    }
  }

  /** The debug rendering mode of the material. */
  get debugMode() {
    return this._debugMode
  }

  set debugMode(value: StandardMaterialDebugMode | undefined) {
    if (this._debugMode !== value) {
      this.invalidateShader()
      this._debugMode = value
    }
  }

  /**
   * The camera used when rendering a mesh. If this value is not set, the main 
   * camera will be used by default.
   */
  camera?: Camera

  /**
   * Lighting environment used when rendering a mesh. If this value is not set, 
   * the main lighting environment will be used by default.
   */
  get lightingEnvironment() {
    return this._lightingEnvironment
  }

  set lightingEnvironment(value: LightingEnvironment | undefined) {
    if (value !== this._lightingEnvironment) {
      this.invalidateShader()
      this._lightingEnvironmentConfigId = getLightingEnvironmentConfigId(value)
      this._lightingEnvironment = value
    }
  }

  /**
   * Value indicating if the material is unlit. If this value if set to true, 
   * all lighting is disabled and only the base color will be used.
   */
  get unlit() {
    return this._unlit
  }

  set unlit(value: boolean) {
    if (this._unlit !== value) {
      this._unlit = value
      this.invalidateShader()
    }
  }

  destroy() {
    //this._baseColorTexture?.destroy()
    //this._normalTexture?.destroy()
    //this._emissiveTexture?.destroy()
    //this._occlusionTexture?.destroy()
    //this._metallicRoughnessTexture?.destroy()
    this._skinUniforms.destroy()
  }

  /**
   * Invalidates the shader so it can be rebuilt with the current features.
   */
  invalidateShader() {
    this._shader = undefined
  }

  /**
   * Creates a new standard material from the specified source.
   * @param source Source from which the material is created.
   */
  static create(source: unknown) {
    return new StandardSurfaceMaterialFactory().create(source)
  }

  render(mesh: Mesh3D, renderer: Renderer) {
    if (!this._instancingEnabled && mesh.instances.length > 0) {
      // Invalidate shader when instancing was enabled.
      this.invalidateShader()
      this._instancingEnabled = true
    }
    if (this._instancingEnabled && mesh.instances.length === 0) {
      // Invalidate shader when instancing was disabled.
      this.invalidateShader()
      this._instancingEnabled = false
    }
    let lighting = this.lightingEnvironment || LightingEnvironment.main
    let configId = getLightingEnvironmentConfigId(lighting)
    if (configId !== this._lightingEnvironmentConfigId) {
      // Invalidate shader when the lighting config has changed.
      this.invalidateShader()
      this._lightingEnvironmentConfigId = configId
    }
    super.render(mesh, renderer)
  }

  get isInstancingSupported() {
    return true
  }

  createInstance() {
    return new InstancedStandardSurfaceMaterial(this)
  }

  createShader(mesh: Mesh3D, renderer: Renderer) {
    if (renderer.context.webGLVersion === 1) {
      let extensions = ["EXT_shader_texture_lod", "OES_standard_derivatives"]
      for (let ext of extensions) {
        if (!renderer.gl.getExtension(ext)) {
          // Log warning?
        }
      }
    }
    let lightingEnvironment = this.lightingEnvironment || LightingEnvironment.main
    let vertexFeatures = StandardSurfaceMaterialFeatureSet.getVertexFeatures(renderer, mesh, this)
    if (!vertexFeatures) {
      return undefined
    }
    let fragmentFeatures = StandardSurfaceMaterialFeatureSet.getFragmentFeatures(renderer, mesh, this, lightingEnvironment)
    if (!fragmentFeatures) {
      return undefined
    }
    if (mesh.skin && StandardSurfaceMaterialFeatureSet.hasSkinningTextureFeature(vertexFeatures)) {
      this._skinUniforms.enableJointMatrixTextures(mesh.skin.joints.length)
    }
    let checksum = vertexFeatures.concat(fragmentFeatures).join(",")
    if (!shaders[checksum]) {
      shaders[checksum] = StandardSurfaceShader.build(renderer, vertexFeatures, fragmentFeatures, mesh.geometry.uvs?.length ?? 0, this)
    }
    return shaders[checksum]
  }

  updateUniforms(mesh: Mesh3D, shader: Shader) {
    /*for (let i = 0; i < 3; i++) {
      this._baseColorFactor[i] = this.baseColor.rgba[i]
    }*/
    //this._baseColorFactor[3] = this.baseColor.a * mesh.worldAlpha
    let camera = this.camera || Camera.main
    if (mesh.skin) {
      this._skinUniforms.update(mesh, shader)
    }
    shader.uniforms.u_Camera = camera.worldTransform.position.array
    shader.uniforms.u_ViewProjectionMatrix = camera.viewProjection.array
    shader.uniforms.u_ViewMatrix = camera.view.array
    shader.uniforms.u_Exposure = this.exposure
    //shader.uniforms.u_MetallicFactor = this.metallic
    //shader.uniforms.u_RoughnessFactor = this.roughness
    //shader.uniforms.u_BaseColorFactor = this._baseColorFactor
    shader.uniforms.u_ModelMatrix = mesh.worldTransform.array
    shader.uniforms.u_NormalMatrix = mesh.transform.normalTransform.array
    if (this._alphaMode === StandardMaterialAlphaMode.mask) {
      shader.uniforms.u_AlphaCutoff = this.alphaCutoff
    }
    if (mesh.targetWeights && mesh.targetWeights.length > 0) {
      shader.uniforms.u_morphWeights = mesh.targetWeights
    }
    /*if (this.baseColorTexture?.valid) {
      shader.uniforms.u_BaseColorSampler = this.baseColorTexture
      shader.uniforms.u_BaseColorUVSet = this.baseColorTexture.uvSet || 0
      if (this.baseColorTexture.transform) {
        shader.uniforms.u_BaseColorUVTransform = this.baseColorTexture.transform.array
      }
    }*/
    let lightingEnvironment = this.lightingEnvironment || LightingEnvironment.main
    for (let i = 0; i < lightingEnvironment.lights.length; i++) {
      let light = lightingEnvironment.lights[i]
      let type = 0
      switch (light.type) {
        case LightType.point: type = 1; break
        case LightType.directional: type = 0; break
        case LightType.spot: type = 2; break
      }
      shader.uniforms[`u_Lights[${i}].type`] = type
      shader.uniforms[`u_Lights[${i}].position`] = light.worldTransform.position.array
      shader.uniforms[`u_Lights[${i}].direction`] = light.worldTransform.forward.array
      shader.uniforms[`u_Lights[${i}].range`] = light.range
      shader.uniforms[`u_Lights[${i}].color`] = light.color.rgb
      shader.uniforms[`u_Lights[${i}].intensity`] = light.intensity
      shader.uniforms[`u_Lights[${i}].innerConeCos`] = Math.cos(light.innerConeAngle * DEG_TO_RAD)
      shader.uniforms[`u_Lights[${i}].outerConeCos`] = Math.cos(light.outerConeAngle * DEG_TO_RAD)
    }

    if (lightingEnvironment.fog) {
      shader.uniforms.u_FogNear = lightingEnvironment.fog.near
      shader.uniforms.u_FogFar = lightingEnvironment.fog.far
      shader.uniforms.u_FogColor = lightingEnvironment.fog.color.rgb
    }
    if (this._shadowCastingLight) {
      shader.uniforms.u_ShadowSampler = this._shadowCastingLight.shadowTexture
      shader.uniforms.u_LightViewProjectionMatrix = this._shadowCastingLight.lightViewProjection
      shader.uniforms.u_ShadowLightIndex = lightingEnvironment.lights.indexOf(this._shadowCastingLight.light)
    }
    let imageBasedLighting = lightingEnvironment.imageBasedLighting
    if (imageBasedLighting?.valid) {
      shader.uniforms.u_DiffuseEnvSampler = imageBasedLighting.diffuse
      shader.uniforms.u_SpecularEnvSampler = imageBasedLighting.specular
      shader.uniforms.u_brdfLUT = imageBasedLighting.lookupBrdf || ImageBasedLighting.defaultLookupBrdf
      shader.uniforms.u_MipCount = imageBasedLighting.specular.levels - 1
    }
    
    for (const [key, value] of this._textures) { shader.uniforms[key] = value }
    for (const [key, value] of this._scalars) { shader.uniforms[key] = value }
    for (const [key, value] of this._vectors2) { shader.uniforms[key] = value }
    for (const [key, value] of this._vectors3) { shader.uniforms[key] = value }
    for (const [key, value] of this._vectors4) { shader.uniforms[key] = value }

    /*if (this.emissiveTexture?.valid) {
      shader.uniforms.u_EmissiveSampler = this.emissiveTexture
      shader.uniforms.u_EmissiveUVSet = this.emissiveTexture.uvSet || 0
      shader.uniforms.u_EmissiveFactor = this.emissive.rgb
      if (this.emissiveTexture.transform) {
        shader.uniforms.u_EmissiveUVTransform = this.emissiveTexture.transform.array
      }
    }*/
    /*if (this.normalTexture?.valid) {
      shader.uniforms.u_NormalSampler = this.normalTexture
      shader.uniforms.u_NormalScale = this.normalTexture.scale || 1
      shader.uniforms.u_NormalUVSet = this.normalTexture.uvSet || 0
      if (this.normalTexture.transform) {
        shader.uniforms.u_NormalUVTransform = this.normalTexture.transform.array
      }
    }*/
    /*if (this.metallicRoughnessTexture?.valid) {
      shader.uniforms.u_MetallicRoughnessSampler = this.metallicRoughnessTexture
      shader.uniforms.u_MetallicRoughnessUVSet = this.metallicRoughnessTexture.uvSet || 0
      if (this.metallicRoughnessTexture.transform) {
        shader.uniforms.u_MetallicRoughnessUVTransform = this.metallicRoughnessTexture.transform.array
      }
    }*/
    /*if (this.occlusionTexture?.valid) {
      shader.uniforms.u_OcclusionSampler = this.occlusionTexture
      shader.uniforms.u_OcclusionStrength = this.occlusionTexture.strength || 1
      shader.uniforms.u_OcclusionUVSet = this.occlusionTexture.uvSet || 0
      if (this.occlusionTexture.transform) {
        shader.uniforms.u_OcclusionUVTransform = this.occlusionTexture.transform.array
      }
    }*/
   
   
  }
  /**
   * Set the code of your Surface Shader as valid GLSL code. You should enter code like you're inside the fragment shader
   * visit https://www.placeholder.com to more details
   */
  setSurfaceShader(fragment:string){
    this._customFragment = fragment;
    this.invalidateShader();
  }
  getSurfaceShader():string{
    return this._customFragment;
  }
  setTextureParameterValue(name:string, texture:BaseTexture){
    if(!this._textures.has(name)){
      this.invalidateShader()
    }
    this._textures.set(name, texture)
  }
  getTextureParameterValue(name:string):BaseTexture|undefined{
    return this._textures.get(name)
  }
  getTextureUniformNames():string[]{
    return Array.from(this._textures.keys())
  }
  getTextureNamesThatHaveUVTransforms():string[]{
    return Array.from(this._textures.keys())
  }
  setScalarParameterValue(name:string, value:number){
    if(!this._scalars.has(name)){
      this.invalidateShader()
    }
    this._scalars.set(name, value)
  }
  getScalarParameterValue(name:string):number|undefined{
    return this._scalars.get(name)
  }
  getScalarUniformNames():string[]{
    return Array.from(this._scalars.keys())
  }
  setVector2ParameterValue(name: string, vector: vec2 | IPointData) {
    if(!this._vectors2.has(name)){
      this.invalidateShader()
    }
    if (vector instanceof Float32Array) {
      this._vectors2.set(name, vector);
    } else if ("x" in vector && "y" in vector) {
      this._vectors2.set(name, new Float32Array([vector.x, vector.y]));
    } else {
      this._vectors2.set(name, new Float32Array(vector));
    }
  }
  getVector2ParameterValue(name: string): Float32Array | undefined {
    return this._vectors2.get(name);
  }
  getVectors2UniformNames():string[]{
    return Array.from(this._vectors2.keys())
  }
  setVector3ParameterValue(name: string, vector: vec3 | IPoint3DData) {
    if(!this._vectors3.has(name)){
      this.invalidateShader()
    }
    if (vector instanceof Float32Array) {
      this._vectors3.set(name, vector);
    } else if ("x" in vector && "y" in vector && "z" in vector) {
      this._vectors3.set(name, new Float32Array([vector.x, vector.y, vector.z]));
    } else {
      this._vectors3.set(name, new Float32Array(vector));
    }
  }
  getVector3ParameterValue(name: string): Float32Array | undefined {
    return this._vectors3.get(name);
  }
  getVectors3UniformNames():string[]{
    return Array.from(this._vectors3.keys())
  }
  setVector4ParameterValue(name: string, vector: vec4 | Color) {
    if(!this._vectors4.has(name)){
      this.invalidateShader()
    }
    if (vector instanceof Float32Array) {
      this._vectors4.set(name, vector);
    } else if ("r" in vector && "g" in vector && "b" in vector && "a" in vector) {
      this._vectors4.set(name, new Float32Array([vector.r, vector.g, vector.b, vector.a]));
    } else {
      this._vectors4.set(name, new Float32Array(vector));
    }
  }
  getVector4ParameterValue(name: string): Float32Array | undefined {
    return this._vectors4.get(name);
  }
  getVectors4UniformNames():string[]{
    return Array.from(this._vectors4.keys())
  }
}