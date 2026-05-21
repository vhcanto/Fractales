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

const buildShaderPrelude = (derivativesEnabled: boolean) => `
${derivativesEnabled ? '#extension GL_OES_standard_derivatives : enable\n' : ''}
precision highp float;
precision highp int;

const int MAX_ITERATIONS = 5000;
const int MAX_SAMPLES = 9;

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
uniform float u_saturation;
uniform float u_gamma;
uniform float u_rotation;
uniform vec2 u_juliaC;
uniform int u_samples;
uniform float u_deStrength;
uniform float u_lightingStrength;
uniform float u_orbitTrapMode;
uniform float u_orbitTrapEnabled;

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

float sampleEscapeFieldAt(vec2 point) {
  return length(point - u_center);
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

float selectOrbitTrap(float mode, vec2 z, float de, float trap) {
  float lineTrap = abs(z.x - z.y);
  float circleTrap = abs(length(z) - 0.55);
  float glowTrap = 1.0 / (1.0 + 18.0 * length(z));
  float fieldTrap = min(trap, abs(sin(z.x * 2.7) * cos(z.y * 2.7)));
  if (mode < 0.5) return lineTrap;
  if (mode < 1.5) return circleTrap;
  if (mode < 2.5) return glowTrap;
  return mix(fieldTrap, de, 0.35);
}

float safeLightingWithoutDerivatives(float depth, vec2 point, float filament) {
  float eps = 1.0 / max(min(u_resolution.x, u_resolution.y), 1.0);
  float dx = sampleEscapeFieldAt(point + vec2(eps, 0.0)) - sampleEscapeFieldAt(point - vec2(eps, 0.0));
  float dy = sampleEscapeFieldAt(point + vec2(0.0, eps)) - sampleEscapeFieldAt(point - vec2(0.0, eps));
  vec3 normal = normalize(vec3(dx, dy, 0.75 + filament * 0.15) + vec3(1.0e-6));
  vec3 lightDir = normalize(vec3(-0.55, 0.4, 0.8 + depth * 0.22));
  return 0.5 + 0.5 * dot(normal, lightDir);
}

float advancedLightingWithDerivatives(float depth) {
  #if defined(GL_OES_standard_derivatives)
    return 0.5 + 0.5 * dot(normalize(vec3(dFdx(depth), dFdy(depth), 0.65)), normalize(vec3(-0.55, 0.4, 0.8)));
  #else
    return 1.0;
  #endif
}

vec4 shade(float smoothIteration, float trap, vec2 point, float distanceEstimate, vec2 orbitPoint) {
  float zoomDepth = clamp(log(max(u_zoom, 1.0)) / log(10.0), 0.0, 10.0);
  float adaptiveContrast = u_contrast + zoomDepth * 0.022;
  float adaptiveGamma = max(u_gamma - zoomDepth * 0.012, 0.64);
  float dynamicBrightness = u_brightness + zoomDepth * 0.008;

  if (smoothIteration < 0.0) {
    float innerGrain = 0.5 + 0.5 * sin((point.x + point.y) * (18.0 + zoomDepth * 7.0));
    float core = 0.025 + 0.055 * exp(-2.4 * length(point - u_center));
    return vec4(vec3((core + innerGrain * 0.012) * u_brightness), 1.0);
  }

  float iterationLimit = max(float(u_maxIterations), 1.0);
  float normalized = smoothIteration / iterationLimit;
  float logDepth = log(1.0 + smoothIteration) / log(1.0 + iterationLimit);
  float depth = pow(clamp(mix(normalized, logDepth, 0.8), 0.0, 1.0), 0.52);
  float orbitTrap = selectOrbitTrap(u_orbitTrapMode, orbitPoint, distanceEstimate, trap);
  orbitTrap = mix(trap, orbitTrap, step(0.5, u_orbitTrapEnabled));
  float filament = exp(-(8.2 - min(zoomDepth, 5.0) * 0.35) * clamp(orbitTrap, 0.0, 1.0));
  float distanceGlow = 1.0 / (1.0 + 24.0 * clamp(trap, 0.0, 2.0));
  float deGlow = exp(-6.0 * clamp(distanceEstimate, 0.0, 1.0));
  float fakeNormal = safeLightingWithoutDerivatives(depth, point, filament);
  float lighting = mix(1.0, fakeNormal, clamp(u_lightingStrength, 0.0, 1.2));
  float fog = 1.0 - exp(-3.4 * depth);
  float microRings = 0.5 + 0.5 * sin((18.0 + zoomDepth * 2.2) * depth + filament * 3.4 + zoomDepth * 0.13);
  float tonalFlow = smoothstep(0.0, 1.0, 0.5 + 0.5 * sin(depth * 9.0 + filament * 1.6));
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  vec3 color = samplePalette(depth + microRings * 0.022 + filament * 0.075 + tonalFlow * 0.014 + deGlow * 0.05 + (dither - 0.5) * 0.006);
  color *= (0.72 + 0.62 * filament + 0.16 * distanceGlow + deGlow * u_deStrength * 0.35) * lighting;
  color = (color - 0.5) * adaptiveContrast + 0.5;
  color *= dynamicBrightness;
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, u_saturation);
  color = pow(max(color, vec3(0.0)), vec3(max(adaptiveGamma, 0.0001)));
  color += filament * vec3(0.16, 0.18, 0.22) + distanceGlow * vec3(0.08, 0.075, 0.06) + microRings * 0.012;
  color = mix(color, color * vec3(0.88, 0.92, 1.02), fog * 0.18);
  return vec4(clamp(color, vec3(0.0), vec3(1.0)), 1.0);
}
`;

export const shaderPreludeSafe = buildShaderPrelude(false);
export const shaderPreludeWithDerivatives = buildShaderPrelude(true);

const shaderKindName = (gl: WebGLRenderingContext, type: number) => (type === gl.VERTEX_SHADER ? 'vertex shader' : 'fragment shader');

export const formatShaderSourceWithLineNumbers = (source: string) => source
  .split('\n')
  .map((line, index) => `${String(index + 1).padStart(4, ' ')} | ${line}`)
  .join('\n');

export const compileShader = (gl: WebGLRenderingContext, type: number, source: string, label: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  const kind = shaderKindName(gl, type);
  if (!shader) {
    console.error(`No fue posible crear ${kind} WebGL: ${label}.`);
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? 'Error desconocido compilando shader.';
    console.error(
      `Error compilando ${kind} WebGL (${label}).\n` +
      `Log GLSL completo:\n${info}\n` +
      `Fuente ${kind} con números de línea:\n${formatShaderSourceWithLineNumbers(source)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

export const createProgram = (gl: WebGLRenderingContext, fragmentSource: string, label = 'escape-time'): WebGLProgram | null => {
  const vertexLabel = `${label}:vertex`;
  const fragmentLabel = `${label}:fragment`;
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource, vertexLabel);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, fragmentLabel);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    console.error(`No se pudo crear programa WebGL (${label}) porque falló la compilación de ${!vertexShader ? 'vertex shader' : 'fragment shader'}.`);
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
    console.error(
      `Error enlazando programa WebGL (${label}).\n` +
      `Log completo de link:\n${info}\n` +
      `Vertex shader con números de línea:\n${formatShaderSourceWithLineNumbers(vertexShaderSource)}\n` +
      `Fragment shader con números de línea:\n${formatShaderSourceWithLineNumbers(fragmentSource)}`,
    );
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
