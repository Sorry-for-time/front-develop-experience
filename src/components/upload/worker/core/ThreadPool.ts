class ThreadPool {
  #pool:Array<Worker>;
  public constructor () {
    this.#pool = [];
  }
}


export {ThreadPool}
