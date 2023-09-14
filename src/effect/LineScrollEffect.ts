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
  debug: boolean;

  public get flowField(): Array<number> {
    return this.#flowField;
  }

  public constructor(readonly canvas: OffscreenCanvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.cols = 0;
    this.rows = 0;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 5;
    this.#flowField = [];
    this.#curve = 6;
    this.#zoom = 0.01;
    this.debug = false;
    this.#init();
  }

  #init(): void {
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
  #drawGrid(context: OffscreenCanvasRenderingContext2D) {
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
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.#init();
  }

  public render(context: OffscreenCanvasRenderingContext2D): void {
    if (this.debug) this.#drawGrid(context);
    for (const particle of this.particles) {
      particle.draw(context);
      particle.update();
    }
  }
}

export { LineScrollEffect };
