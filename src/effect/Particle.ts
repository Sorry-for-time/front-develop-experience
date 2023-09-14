import type { LineScrollEffect } from "./LineScrollEffect";

/**
 * `the author youtube channel: https://www.youtube.com/frankslaboratory`
 *
 * @see {@link "https://codepen.io/franksLaboratory/pen/LYJKONw?editors=0010"}
 * @author Frank
 */
class Particle {
  #effect: LineScrollEffect;
  #x: number;
  #y: number;
  #speedY: number = 0;
  #speedX: number = 0;
  #speedModifier: number;
  #history: Array<{ x: number; y: number }>;
  #maxLength: number;
  #angle: number;
  #timer: number;
  #colors: Array<string>;
  #color: string;
  public constructor(effect: LineScrollEffect) {
    this.#effect = effect;
    this.#x = Math.floor(Math.random() * this.#effect.width);
    this.#y = Math.floor(Math.random() * this.#effect.height);
    this.#speedModifier = Math.floor(Math.random() * 5 + 1);
    this.#history = [{ x: this.#x, y: this.#y }];
    this.#maxLength = Math.floor(Math.random() * 200 + 10);
    this.#angle = 0;
    this.#timer = this.#maxLength * 2;
    this.#colors = [
      "#4c026b",
      "#730d9e",
      "#9622c7",
      "#b44ae0",
      "#cd72f2",
      "#b44ae0",
      "#72a9f2",
      "#537cb1",
      "#3f2bad",
      "white"
    ];
    this.#color = this.#colors[Math.floor(Math.random() * this.#colors.length)];
  }
  public draw(context: OffscreenCanvasRenderingContext2D): void {
    context.beginPath();
    context.moveTo(this.#history[0].x, this.#history[0].y);
    for (let i = 0; i < this.#history.length; i++) {
      context.lineTo(this.#history[i].x, this.#history[i].y);
    }
    context.strokeStyle = this.#color;
    context.stroke();
  }
  public update(): void {
    this.#timer--;
    if (this.#timer >= 1) {
      let x = Math.floor(this.#x / this.#effect.cellSize);
      let y = Math.floor(this.#y / this.#effect.cellSize);
      let index = y * this.#effect.cols + x;
      this.#angle = this.#effect.flowField[index];

      this.#speedX = Math.cos(this.#angle);
      this.#speedY = Math.sin(this.#angle);
      this.#x += this.#speedX * this.#speedModifier;
      this.#y += this.#speedY * this.#speedModifier;

      this.#history.push({ x: this.#x, y: this.#y });
      if (this.#history.length > this.#maxLength) {
        this.#history.shift();
      }
    } else if (this.#history.length > 1) {
      this.#history.shift();
    } else {
      this.reset();
    }
  }
  public reset(): void {
    this.#x = Math.floor(Math.random() * this.#effect.width);
    this.#y = Math.floor(Math.random() * this.#effect.height);
    this.#history = [{ x: this.#x, y: this.#y }];
    this.#timer = this.#maxLength * 2;
  }
}

export { Particle };
