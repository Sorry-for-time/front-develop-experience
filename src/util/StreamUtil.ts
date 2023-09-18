/**
 * 将一个默认源转换为每次读取指定字节数大小块的可读流
 *
 * @param streamReader 输入源
 * @param chunkSize 转换流读取的块大小, 默认为 4MB
 * @returns 具有特定读取块大小的可读流
 */
function toChunkReadLimitReadableStream(
  streamReader: Readonly<ReadableStreamDefaultReader<Uint8Array>>,
  chunkSize: Readonly<number> = 1024 * 1024 * 4,
  highWaterMark: number = 1
) {
  // const readableStream = new ReadableStream(streamReader, {
  //   highWaterMark: 1,
  //   size: (chunk: Uint8Array) => {
  //     return chunk.length;
  //   }
  // })
  let bufferCache: Uint8Array;
  return new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        let fulfilled: boolean = false;
        while (!fulfilled) {
          const { value, done } = await streamReader.read();
          if (!done) {
            bufferCache = new Uint8Array([...(bufferCache || []), ...value]);
            while (bufferCache.byteLength >= chunkSize) {
              const chunkToSend = bufferCache.slice(0, chunkSize);
              controller.enqueue(chunkToSend);
              bufferCache = new Uint8Array([...bufferCache.slice(chunkSize)]);
              fulfilled = true;
            }
          } else {
            fulfilled = true;
            if (bufferCache.byteLength > 0) {
              controller.enqueue(bufferCache);
            }
            controller.close();
            streamReader.releaseLock();
          }
        }
      }
    },
    {
      highWaterMark
    }
  );
}

export { toChunkReadLimitReadableStream };
