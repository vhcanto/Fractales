import { shaderPrelude } from '../utils/shaderUtils';

export const juliaFragmentShader = `${shaderPrelude}

vec2 squareComplex(vec2 z) {
  return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

vec2 aaOffsets(int sampleIndex) {
  if (sampleIndex == 0) return vec2(-0.35, -0.1);
  if (sampleIndex == 1) return vec2(0.12, -0.36);
  if (sampleIndex == 2) return vec2(-0.12, 0.36);
  if (sampleIndex == 3) return vec2(0.35, 0.1);
  if (sampleIndex == 4) return vec2(-0.24, -0.3);
  if (sampleIndex == 5) return vec2(0.3, -0.24);
  if (sampleIndex == 6) return vec2(-0.3, 0.24);
  if (sampleIndex == 7) return vec2(0.24, 0.3);
  return vec2(0.0, 0.0);
}

vec4 renderSample(vec2 offset) {
  vec2 z = pixelToPlane(offset);
  vec2 c = u_juliaC;
  float escapeRadiusSquared = u_escapeRadius * u_escapeRadius;
  float escapedAt = -1.0;
  float trap = 10.0;

  for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (i >= u_maxIterations) break;
    z = squareComplex(z) + c;
    float radiusSquared = dot(z, z);
    trap = min(trap, abs(length(z - vec2(0.18, -0.08)) - 0.42) + 0.012 * abs(z.x));

    if (radiusSquared > escapeRadiusSquared) {
      float logZn = log(max(radiusSquared, 1.000001)) * 0.5;
      float nu = log(max(logZn / log(2.0), 0.000001)) / log(2.0);
      escapedAt = float(i) + 1.0 - nu;
      break;
    }
  }

  return shade(escapedAt, trap, z);
}

void main() {
  vec4 color = vec4(0.0);
  int sampleCount = u_samples;
  if (sampleCount < 1) sampleCount = 1;
  if (sampleCount > MAX_SAMPLES) sampleCount = MAX_SAMPLES;

  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= sampleCount) break;
    vec2 offset = vec2(0.0);
    if (sampleCount > 1) offset = aaOffsets(i);
    color += renderSample(offset);
  }
  gl_FragColor = color / max(float(sampleCount), 1.0);
}
`;
