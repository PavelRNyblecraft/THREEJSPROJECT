import { CameraPosition } from "./camera-position";

export interface SceneState {
  cameraPosition: CameraPosition,
  instanceColorArray: Array<number>
}
