export const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const shaderPrelude = `
precision highp float;

#define MAX_STEPS 1400

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
uniform float u_progress;

vec2 rotatePoint(vec2 point, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c) * point;
}

vec2 pixelToPlane(vec2 offset) {
  vec2 uv = (gl_FragCoord.xy + offset) / u_resolution.xy;
  vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
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
  if (smoothIteration < 0.0) {
    float core = 0.035 + 0.08 * exp(-3.4 * length(point - u_center));
    return vec4(vec3(core * u_brightness), 1.0);
  }

  float normalized = smoothIteration / float(max(u_maxIterations, 1));
  float depth = pow(clamp(normalized, 0.0, 1.0), 0.52);
  float filament = exp(-9.0 * clamp(trap, 0.0, 1.0));
  float rings = 0.5 + 0.5 * sin(24.0 * depth + filament * 3.5);
  vec3 color = samplePalette(depth + rings * 0.028 + filament * 0.08);
  color *= 0.72 + 0.65 * filament;
  color = (color - 0.5) * u_contrast + 0.5;
  color *= u_brightness;
  color = pow(max(color, vec3(0.0)), vec3(max(u_gamma, 0.01)));
  color += filament * vec3(0.18, 0.2, 0.24);
  return vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

export const compileShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('No fue posible crear shader WebGL.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'Error desconocido compilando shader.';
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
};

export const createProgram = (gl: WebGLRenderingContext, fragmentSource: string): WebGLProgram => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error('No fue posible crear programa WebGL.');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? 'Error desconocido enlazando programa WebGL.';
    gl.deleteProgram(program);
    throw new Error(info);
  }

  return program;
};
