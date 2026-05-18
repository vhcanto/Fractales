export const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const gradientFragmentShaderSource = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_resolution;

void main() {
  vec2 safeResolution = max(u_resolution, vec2(1.0));
  vec2 uv = gl_FragCoord.xy / safeResolution;
  vec3 color = mix(vec3(0.0, 0.12, 0.22), vec3(0.95, 0.25, 1.0), uv.x);
  color = mix(color, vec3(0.18, 0.95, 1.0), uv.y * 0.55);
  gl_FragColor = vec4(color, 1.0);
}
`;

export const shaderPrelude = `
precision highp float;

#define MAX_STEPS 5000

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_maxIterations;
uniform float u_escapeRadius;
uniform vec3 u_palette[8];
uniform float u_colorShift;
uniform float u_contrast;
uniform float u_brightness;
uniform float u_gamma;
uniform float u_rotation;
uniform vec2 u_juliaC;

vec2 rotatePoint(vec2 point, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * point;
}

vec2 pixelToPlane(vec2 offset) {
  vec2 safeResolution = max(u_resolution.xy, vec2(1.0));
  vec2 uv = (gl_FragCoord.xy + offset) / safeResolution;
  vec2 p = (uv - 0.5) * vec2(safeResolution.x / safeResolution.y, 1.0);
  p = rotatePoint(p, u_rotation);
  return u_center + p * (3.2 / max(u_zoom, 0.0001));
}

vec3 samplePalette(float t) {
  float x = fract(t + u_colorShift) * 7.0;
  int index = int(floor(x));
  float f = smoothstep(0.0, 1.0, fract(x));

  vec3 a = u_palette[0];
  vec3 b = u_palette[1];
  if (index == 0) { a = u_palette[0]; b = u_palette[1]; }
  else if (index == 1) { a = u_palette[1]; b = u_palette[2]; }
  else if (index == 2) { a = u_palette[2]; b = u_palette[3]; }
  else if (index == 3) { a = u_palette[3]; b = u_palette[4]; }
  else if (index == 4) { a = u_palette[4]; b = u_palette[5]; }
  else if (index == 5) { a = u_palette[5]; b = u_palette[6]; }
  else { a = u_palette[6]; b = u_palette[7]; }

  return mix(a, b, f);
}

vec4 shade(float smoothIteration, float trap, vec2 point) {
  float zoomDepth = clamp(log(max(u_zoom, 1.0)) / log(10.0), 0.0, 10.0);
  float adaptiveContrast = u_contrast + zoomDepth * 0.018;
  float adaptiveGamma = max(u_gamma - zoomDepth * 0.01, 0.68);

  if (smoothIteration < 0.0) {
    float innerGrain = 0.5 + 0.5 * sin((point.x + point.y) * (18.0 + zoomDepth * 7.0));
    float core = 0.025 + 0.055 * exp(-2.4 * length(point - u_center));
    return vec4(vec3((core + innerGrain * 0.012) * u_brightness), 1.0);
  }

  float normalized = smoothIteration / max(float(u_maxIterations), 1.0);
  float depth = pow(clamp(normalized, 0.0, 1.0), 0.48);
  float filament = exp(-(8.2 - min(zoomDepth, 5.0) * 0.35) * clamp(trap, 0.0, 1.0));
  float microRings = 0.5 + 0.5 * sin((26.0 + zoomDepth * 2.8) * depth + filament * 4.5 + zoomDepth * 0.17);
  float bands = smoothstep(0.06, 0.95, fract(depth * (7.0 + zoomDepth * 0.55) + filament * 0.2));
  vec3 color = samplePalette(depth + microRings * 0.032 + filament * 0.09 + bands * 0.018);
  color *= 0.68 + 0.72 * filament + 0.08 * bands;
  color = (color - 0.5) * adaptiveContrast + 0.5;
  color *= u_brightness;
  color = pow(max(color, vec3(0.0)), vec3(adaptiveGamma));
  color += filament * vec3(0.2, 0.22, 0.26) + microRings * 0.018;
  return vec4(clamp(color, vec3(0.0), vec3(1.0)), 1.0);
}
`;

export const compileShader = (gl: WebGLRenderingContext, type: number, source: string, label: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error(`No fue posible crear shader WebGL: ${label}.`);
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'Error desconocido compilando shader.';
    console.error(`Error compilando shader WebGL (${label}):\n${info}\nFuente:\n${source}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

export const createProgram = (gl: WebGLRenderingContext, fragmentSource: string, label = 'escape-time'): WebGLProgram | null => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource, `${label}:vertex`);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, `${label}:fragment`);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    console.error(`No fue posible crear programa WebGL (${label}).`);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'Error desconocido enlazando programa WebGL.';
    console.error(`Error enlazando programa WebGL (${label}):\n${info}`);
    gl.deleteProgram(program);
    return null;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'Error desconocido validando programa WebGL.';
    console.warn(`Advertencia validando programa WebGL (${label}):\n${info}`);
  }

  return program;
};
