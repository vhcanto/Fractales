import { getFractalPalette } from './palettes/fractalPalettes';
import type { EscapeTimeFractalType, EscapeTimePreset } from './presets/escapeTimePresets';
import { burningShipFragmentShader } from './shaders/burningShip.frag';
import { juliaFragmentShader } from './shaders/julia.frag';
import { mandelbrotFragmentShader } from './shaders/mandelbrot.frag';
import { createProgram, gradientFragmentShaderSource } from './utils/shaderUtils';

interface ProgramBundle {
  program: WebGLProgram;
  uniforms: {
    resolution: WebGLUniformLocation | null;
    center: WebGLUniformLocation | null;
    zoom: WebGLUniformLocation | null;
    maxIterations: WebGLUniformLocation | null;
    escapeRadius: WebGLUniformLocation | null;
    palette: WebGLUniformLocation | null;
    colorShift: WebGLUniformLocation | null;
    contrast: WebGLUniformLocation | null;
    brightness: WebGLUniformLocation | null;
    gamma: WebGLUniformLocation | null;
    rotation: WebGLUniformLocation | null;
    juliaC: WebGLUniformLocation | null;
  };
}

const shaderByType: Record<EscapeTimeFractalType, string> = {
  mandelbrot: mandelbrotFragmentShader,
  julia: juliaFragmentShader,
  burningShip: burningShipFragmentShader,
};

const coreUniformNames: Array<keyof ProgramBundle['uniforms']> = ['resolution', 'center', 'zoom', 'maxIterations', 'palette'];

export class EscapeTimeFractalRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly programs = new Map<EscapeTimeFractalType, ProgramBundle>();
  private gradientProgram: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Canvas WebGL inválido o no disponible.');
    }

    const contextOptions: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    };
    const gl = canvas.getContext('webgl2', contextOptions) ?? canvas.getContext('webgl', contextOptions);

    if (!gl) {
      throw new Error('WebGL no está disponible en este navegador.');
    }

    this.gl = gl as WebGLRenderingContext;
    this.initGeometry();
    this.gradientProgram = this.createRequiredProgram(gradientFragmentShaderSource, 'gradient-validation');
  }

  resize(width: number, height: number, dpr = 1) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
      throw new Error(`Tamaño inválido para canvas WebGL: ${width}x${height}.`);
    }

    const pixelRatio = Math.min(Math.max(dpr, 1), 2.5);
    const drawingWidth = Math.max(1, Math.floor(width * pixelRatio));
    const drawingHeight = Math.max(1, Math.floor(height * pixelRatio));

    if (this.canvas.width !== drawingWidth || this.canvas.height !== drawingHeight) {
      this.canvas.width = drawingWidth;
      this.canvas.height = drawingHeight;
    }

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.gl.viewport(0, 0, drawingWidth, drawingHeight);
  }

  renderGradientTest() {
    if (!this.gradientProgram) throw new Error('Programa WebGL de gradiente no inicializado.');
    this.drawProgram(this.gradientProgram);
    const resolution = this.gl.getUniformLocation(this.gradientProgram, 'u_resolution');
    if (!resolution) throw new Error('Uniform u_resolution no disponible en prueba de gradiente WebGL.');
    this.gl.uniform2f(resolution, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.assertNoGlError('prueba de gradiente WebGL');
  }

  render(preset: EscapeTimePreset) {
    const gl = this.gl;
    const bundle = this.getProgram(preset.fractalType);
    const palette = getFractalPalette(preset.colorPalette);
    const flatPalette = new Float32Array(palette.colors.flat());

    this.drawProgram(bundle.program);
    this.requireCoreUniforms(bundle, preset.fractalType);

    this.setUniform2f(bundle.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.setUniform2f(bundle.uniforms.center, preset.centerX, preset.centerY);
    this.setUniform1f(bundle.uniforms.zoom, preset.zoom);
    this.setUniform1i(bundle.uniforms.maxIterations, Math.min(Math.max(Math.round(preset.maxIterations), 24), 1400));
    this.setUniform1f(bundle.uniforms.escapeRadius, preset.escapeRadius);
    if (bundle.uniforms.palette) gl.uniform3fv(bundle.uniforms.palette, flatPalette);
    this.setUniform1f(bundle.uniforms.colorShift, preset.colorShift);
    this.setUniform1f(bundle.uniforms.contrast, preset.contrast);
    this.setUniform1f(bundle.uniforms.brightness, preset.brightness);
    this.setUniform1f(bundle.uniforms.gamma, preset.gamma);
    this.setUniform1f(bundle.uniforms.rotation, preset.rotation ?? 0);
    this.setUniform2f(bundle.uniforms.juliaC, preset.juliaC?.x ?? -0.7269, preset.juliaC?.y ?? 0.1889);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.assertNoGlError(`render ${preset.fractalType}`);
  }

  destroy() {
    const gl = this.gl;
    this.programs.forEach(({ program }) => gl.deleteProgram(program));
    this.programs.clear();

    if (this.gradientProgram) {
      gl.deleteProgram(this.gradientProgram);
      this.gradientProgram = null;
    }

    if (this.vertexBuffer) {
      gl.deleteBuffer(this.vertexBuffer);
      this.vertexBuffer = null;
    }
  }

  private initGeometry() {
    const gl = this.gl;
    this.vertexBuffer = gl.createBuffer();
    if (!this.vertexBuffer) throw new Error('No fue posible crear buffer WebGL.');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.clearColor(0.005, 0.008, 0.02, 1);
  }

  private drawProgram(program: WebGLProgram) {
    const gl = this.gl;
    if (!this.vertexBuffer) throw new Error('Buffer WebGL no inicializado.');

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    if (positionLocation < 0) throw new Error('Atributo WebGL a_position no encontrado.');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  private getProgram(fractalType: EscapeTimeFractalType): ProgramBundle {
    const cached = this.programs.get(fractalType);
    if (cached) return cached;

    const program = this.createRequiredProgram(shaderByType[fractalType], fractalType);
    const uniforms: ProgramBundle['uniforms'] = {
      resolution: this.gl.getUniformLocation(program, 'u_resolution'),
      center: this.gl.getUniformLocation(program, 'u_center'),
      zoom: this.gl.getUniformLocation(program, 'u_zoom'),
      maxIterations: this.gl.getUniformLocation(program, 'u_maxIterations'),
      escapeRadius: this.gl.getUniformLocation(program, 'u_escapeRadius'),
      palette: this.gl.getUniformLocation(program, 'u_palette[0]'),
      colorShift: this.gl.getUniformLocation(program, 'u_colorShift'),
      contrast: this.gl.getUniformLocation(program, 'u_contrast'),
      brightness: this.gl.getUniformLocation(program, 'u_brightness'),
      gamma: this.gl.getUniformLocation(program, 'u_gamma'),
      rotation: this.gl.getUniformLocation(program, 'u_rotation'),
      juliaC: this.gl.getUniformLocation(program, 'u_juliaC'),
    };

    const bundle = { program, uniforms };
    this.requireCoreUniforms(bundle, fractalType);
    this.warnOptionalUniforms(bundle, fractalType);
    this.programs.set(fractalType, bundle);
    return bundle;
  }

  private createRequiredProgram(fragmentSource: string, label: string): WebGLProgram {
    const program = createProgram(this.gl, fragmentSource, label);
    if (!program) throw new Error(`No se pudo crear programa WebGL para ${label}. Ver consola para errores GLSL completos.`);
    return program;
  }

  private requireCoreUniforms(bundle: ProgramBundle, label: string) {
    const missing = coreUniformNames.filter((name) => bundle.uniforms[name] === null);
    if (missing.length > 0) {
      throw new Error(`Uniforms WebGL esenciales no encontrados en ${label}: ${missing.join(', ')}.`);
    }
  }

  private warnOptionalUniforms(bundle: ProgramBundle, label: string) {
    Object.entries(bundle.uniforms)
      .filter(([name, location]) => location === null && !coreUniformNames.includes(name as keyof ProgramBundle['uniforms']))
      .forEach(([name]) => console.warn(`Uniform WebGL opcional optimizado o ausente en ${label}: ${name}.`));
  }

  private setUniform1f(location: WebGLUniformLocation | null, value: number) {
    if (location) this.gl.uniform1f(location, value);
  }

  private setUniform1i(location: WebGLUniformLocation | null, value: number) {
    if (location) this.gl.uniform1i(location, value);
  }

  private setUniform2f(location: WebGLUniformLocation | null, x: number, y: number) {
    if (location) this.gl.uniform2f(location, x, y);
  }

  private assertNoGlError(label: string) {
    const error = this.gl.getError();
    if (error !== this.gl.NO_ERROR) {
      throw new Error(`Error WebGL durante ${label}: código ${error}.`);
    }
  }
}
