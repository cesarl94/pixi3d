import * as PIXI from "pixi.js"

import { glTFResource } from "./gltf-resource"

const EXTENSION = "gltf"

const resources: { [source: string]: glTFResource } = {}

export const glTFLoader = {
  resources: resources,
  use: function (resource: any, next: () => void) {
    if (resource.extension !== EXTENSION) {
      return next()
    }
    glTFLoader.resources[resource.name] = resource.gltf =
      glTFResource.fromExternalResources(resource.data, this as any, resource)

    next()
  },
  add: function () {
    PIXI.LoaderResource.setExtensionXhrType(
      EXTENSION, PIXI.LoaderResource.XHR_RESPONSE_TYPE.JSON)
  }
}

PIXI.Loader.registerPlugin(glTFLoader)