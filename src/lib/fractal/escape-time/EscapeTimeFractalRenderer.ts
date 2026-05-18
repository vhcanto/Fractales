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
    progress: WebGLUniformLocation | null;
  };
}

const shaderByType: Record<EscapeTimeFractalType, string> = {
  mandelbrot: mandelbrotFragmentShader,
  julia: juliaFragmentShader,
  burningShip: burningShipFragmentShader,
};

export class EscapeTimeFractalRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly programs = new Map<EscapeTimeFractalType, ProgramBundle>();
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
    this.validateGradientProgram();
  }

  resize(width: number, height: number, dpr = 1) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
      throw new Error(`Tamaño inválido para canvas WebGL: ${width}x${height}.`);
    }

    const pixelRatio = Math.min(Math.max(dpr, 1), 2);
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

  render(preset: EscapeTimePreset, progress = 1) {
    const gl = this.gl;
    const bundle = this.getProgram(preset.fractalType);
    const palette = getFractalPalette(preset.colorPalette);
    const flatPalette = new Float32Array(palette.colors.flat());

    if (!this.vertexBuffer) throw new Error('Buffer WebGL no inicializado.');

    gl.useProgram(bundle.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const positionLocation = gl.getAttribLocation(bundle.program, 'a_position');
    if (positionLocation < 0) throw new Error('Atributo WebGL a_position no encontrado.');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.requireUniforms(bundle);
    gl.uniform2f(bundle.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(bundle.uniforms.center, preset.centerX, preset.centerY);
    gl.uniform1f(bundle.uniforms.zoom, preset.zoom);
    gl.uniform1i(bundle.uniforms.maxIterations, Math.min(Math.max(Math.round(preset.maxIterations * progress), 24), 1400));
    gl.uniform1f(bundle.uniforms.escapeRadius, preset.escapeRadius);
    gl.uniform3fv(bundle.uniforms.palette, flatPalette);
    gl.uniform1f(bundle.uniforms.colorShift, preset.colorShift);
    gl.uniform1f(bundle.uniforms.contrast, preset.contrast);
    gl.uniform1f(bundle.uniforms.brightness, preset.brightness);
    gl.uniform1f(bundle.uniforms.gamma, preset.gamma);
    gl.uniform1f(bundle.uniforms.rotation, preset.rotation ?? 0);
    gl.uniform2f(bundle.uniforms.juliaC, preset.juliaC?.x ?? -0.7269, preset.juliaC?.y ?? 0.1889);
    gl.uniform1f(bundle.uniforms.progress, progress);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  destroy() {
    const gl = this.gl;
    this.programs.forEach(({ program }) => gl.deleteProgram(program));
    this.programs.clear();

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

  private getProgram(fractalType: EscapeTimeFractalType): ProgramBundle {
    const cached = this.programs.get(fractalType);
    if (cached) return cached;

    const program = createProgram(this.gl, shaderByType[fractalType], fractalType);
    if (!program) throw new Error(`No se pudo crear programa WebGL para ${fractalType}.`);
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
      progress: this.gl.getUniformLocation(program, 'u_progress'),
    };

    const bundle = { program, uniforms };
    this.requireUniforms(bundle);
    this.programs.set(fractalType, bundle);
    return bundle;
  }

  private validateGradientProgram() {
    const program = createProgram(this.gl, gradientFragmentShaderSource, 'gradient-validation');
    if (!program) throw new Error('El shader mínimo de gradiente WebGL no compiló.');
    this.gl.deleteProgram(program);
  }

  private requireUniforms(bundle: ProgramBundle) {
    const missing = Object.entries(bundle.uniforms)
      .filter(([, location]) => location === null)
      .map(([name]) => name);

    if (missing.length > 0) {
      throw new Error(`Uniforms WebGL no encontrados: ${missing.join(', ')}.`);
    }
  }
}
