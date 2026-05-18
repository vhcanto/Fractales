export class Container {
  blendMode?: string;
  filters?: unknown[];
  protected children: Container[] = [];

  addChild<T>(child: T): T {
    if (child instanceof Container) this.children.push(child);
    return child;
  }

  removeChildren(): Container[] {
    const removed = [...this.children];
    this.children = [];
    return removed;
  }

  destroy(..._args: unknown[]): void {
    void _args;
    this.removeChildren();
  }
}

export class Graphics extends Container {
  circle(..._args: unknown[]): this { void _args; return this; }
  rect(..._args: unknown[]): this { void _args; return this; }
  moveTo(..._args: unknown[]): this { void _args; return this; }
  lineTo(..._args: unknown[]): this { void _args; return this; }
  quadraticCurveTo(..._args: unknown[]): this { void _args; return this; }
  bezierCurveTo(..._args: unknown[]): this { void _args; return this; }
  fill(..._args: unknown[]): this { void _args; return this; }
  stroke(..._args: unknown[]): this { void _args; return this; }
}

export class BlurFilter {
  constructor(..._args: unknown[]) {
    void _args;
  }
}

export class Application {
  canvas = document.createElement('canvas');
  stage = new Container();
  renderer = {
    resize: (width: number, height: number) => {
      this.canvas.width = Math.max(1, Math.floor(width));
      this.canvas.height = Math.max(1, Math.floor(height));
      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#155e75');
      gradient.addColorStop(1, '#4c1d95');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(103, 232, 249, 0.85)';
      ctx.font = '600 16px Inter, sans-serif';
      ctx.fillText('Fallback PixiJS (stub local)', 24, 36);
    },
  };

  async init(options?: Record<string, unknown>): Promise<void> {
    this.renderer.resize(Number(options?.width ?? 640), Number(options?.height ?? 420));
  }

  destroy(..._args: unknown[]): void {
    void _args;
    this.stage.destroy();
    this.canvas.remove();
  }
}
