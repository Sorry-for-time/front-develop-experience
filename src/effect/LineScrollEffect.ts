import { Particle } from "./Particle";

/**
 * `the author youtube channel: https://www.youtube.com/frankslaboratory`
 *
 * @see {@link "https://codepen.io/franksLaboratory/pen/LYJKONw?editors=0010"}
 * @author Frank
 */
class LineScrollEffect {
  width: number;
  height: number;
  particles: Array<Particle>;
  numberOfParticles: number;
  cellSize: number;
  rows: number;
  cols: number;
  #flowField: Array<number>;
  #curve: number;
  #zoom: number;
  #debug: boolean;
  #uiAutoResizeFit: boolean;
  #parent: HTMLElement;

  public get flowField(): Array<number> {
    return this.#flowField;
  }

  public set uiResizeAutoFit(val: boolean) {
    if (!val) {
      window.visualViewport!.removeEventListener("resize", this.#updateUI);
    }

    if (val && !this.#uiAutoResizeFit) {
      window.visualViewport!.addEventListener("resize", this.#updateUI);
      this.#uiAutoResizeFit = val;
    }
  }

  public get uiResizeAutoFit(): boolean {
    return this.#uiAutoResizeFit;
  }

  public removeActive(): void {
    if (this.#uiAutoResizeFit) {
      window.visualViewport!.removeEventListener(
        "resize",
        this.#updateUI.bind(this)
      );
    }
  }

  public constructor(
    readonly canvas: HTMLCanvasElement | OffscreenCanvas,
    parent: HTMLDivElement,
    autoFit: boolean = false
  ) {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.cols = 0;
    this.rows = 0;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 5;
    this.#flowField = [];
    this.#curve = 6;
    this.#zoom = 0.01;
    this.#debug = false;
    this.#uiAutoResizeFit = autoFit;
    this.init();
    this.#parent = parent;

    window.addEventListener("keydown", (e) => {
      if (e.key === "d") this.#debug = !this.#debug;
    });

    if (this.#uiAutoResizeFit) {
      window.visualViewport!.addEventListener("resize", this.#updateUI);
    }
  }

  #updateUI = (): void => {
    this.resize(this.#parent.clientWidth, this.#parent.clientHeight);
  };
  init() {
    // create flow field
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.#flowField = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let angle =
          (Math.sin(x * this.#zoom) + Math.cos(y * this.#zoom)) * this.#curve;
        this.#flowField.push(angle);
      }
    }

    // create particles
    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }
  drawGrid(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    context.save();
    // context.strokeStyle = "line";
    context.lineWidth = 30;
    for (let c = 0; c < this.cols; c++) {
      context.beginPath();
      context.moveTo(this.cellSize * c, 0);
      context.lineTo(this.cellSize * c, this.height);
      context.stroke();
    }
    for (let r = 0; r < this.rows; r++) {
      context.beginPath();
      context.moveTo(0, this.cellSize * r);
      context.lineTo(this.width, this.cellSize * r);
      context.stroke();
    }
    context.restore();
  }
  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.init();
  }
  render(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    if (this.#debug) this.drawGrid(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
}

export { LineScrollEffect };
