import type { EscapeTimePreset, FractalCameraState } from '../presets/escapeTimePresets';

export interface ComplexPoint {
  x: number;
  y: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export const clonePreset = (preset: EscapeTimePreset): EscapeTimePreset => ({
  ...preset,
  juliaC: preset.juliaC ? { ...preset.juliaC } : undefined,
});

export const resetPresetCamera = (preset: EscapeTimePreset): EscapeTimePreset => ({
  ...clonePreset(preset),
  centerX: preset.initialCenterX,
  centerY: preset.initialCenterY,
  zoom: preset.initialZoom,
});

export const screenToComplex = (
  screenX: number,
  screenY: number,
  viewport: ViewportSize,
  camera: FractalCameraState,
): ComplexPoint => {
  const safeWidth = Math.max(viewport.width, 1);
  const safeHeight = Math.max(viewport.height, 1);
  const aspect = safeWidth / safeHeight;
  const normalizedX = (screenX / safeWidth - 0.5) * aspect;
  const normalizedY = 0.5 - screenY / safeHeight;
  const angle = camera.rotation ?? 0;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rotatedX = normalizedX * cos - normalizedY * sin;
  const rotatedY = normalizedX * sin + normalizedY * cos;
  const scale = 3.2 / Math.max(camera.zoom, 0.0001);

  return {
    x: camera.centerX + rotatedX * scale,
    y: camera.centerY + rotatedY * scale,
  };
};

export const zoomCameraAt = (
  camera: EscapeTimePreset,
  screenX: number,
  screenY: number,
  viewport: ViewportSize,
  zoomFactor: number,
): EscapeTimePreset => {
  const before = screenToComplex(screenX, screenY, viewport, camera);
  const nextZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.35), 25_000_000);
  const zoomed = { ...camera, zoom: nextZoom };
  const after = screenToComplex(screenX, screenY, viewport, zoomed);

  return {
    ...zoomed,
    centerX: camera.centerX + (before.x - after.x),
    centerY: camera.centerY + (before.y - after.y),
  };
};

export const panCamera = (
  camera: EscapeTimePreset,
  startScreen: ComplexPoint,
  endScreen: ComplexPoint,
  viewport: ViewportSize,
): EscapeTimePreset => {
  const start = screenToComplex(startScreen.x, startScreen.y, viewport, camera);
  const end = screenToComplex(endScreen.x, endScreen.y, viewport, camera);

  return {
    ...camera,
    centerX: camera.centerX + (start.x - end.x),
    centerY: camera.centerY + (start.y - end.y),
  };
};
