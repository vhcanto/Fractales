import { shaderPreludeSafe } from '../utils/shaderUtils';

export const burningShipFragmentShader = `${shaderPreludeSafe}

vec2 burningShipStep(vec2 z, vec2 c) {
  z = abs(z);
  return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
}

vec2 aaOffsets(int sampleIndex) {
  if (sampleIndex == 0) return vec2(-0.3, -0.3);
  if (sampleIndex == 1) return vec2(0.0, -0.33);
  if (sampleIndex == 2) return vec2(0.3, -0.3);
  if (sampleIndex == 3) return vec2(-0.33, 0.0);
  if (sampleIndex == 4) return vec2(0.0, 0.0);
  if (sampleIndex == 5) return vec2(0.33, 0.0);
  if (sampleIndex == 6) return vec2(-0.3, 0.3);
  if (sampleIndex == 7) return vec2(0.0, 0.33);
  return vec2(0.3, 0.3);
}

vec4 renderSample(vec2 offset) {
  vec2 c = pixelToPlane(offset);
  vec2 z = vec2(0.0);
  float escapeRadiusSquared = u_escapeRadius * u_escapeRadius;
  float escapedAt = -1.0;
  float trap = 10.0;
  float distanceEstimate = 1.0;
  vec2 dz = vec2(0.0);

  for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (i >= u_maxIterations) break;
    dz = 2.0 * vec2(z.x * dz.x - z.y * dz.y, z.x * dz.y + z.y * dz.x) + vec2(1.0, 0.0);
    z = burningShipStep(z, c);
    float radiusSquared = dot(z, z);
    trap = min(trap, abs(z.y) + 0.012 * abs(z.x) + 0.006 * length(z));

    if (radiusSquared > escapeRadiusSquared) {
      float logZn = log(max(radiusSquared, 1.000001)) * 0.5;
      float nu = log(max(logZn / log(2.0), 0.000001)) / log(2.0);
      escapedAt = float(i) + 1.0 - nu;
      float magZ = max(length(z), 1.000001);
      float magDz = max(length(dz), 1.0e-6);
      distanceEstimate = 0.5 * log(magZ) * magZ / magDz;
      break;
    }
  }

  return shade(escapedAt, trap, c, clamp(distanceEstimate * 0.12, 0.0, 1.0), z);
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
