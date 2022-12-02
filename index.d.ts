
type EncoderDecoderInput = Object;

interface ICodecOptions {
  preset?: boolean;
  safe?: boolean;
  useraw?: boolean;
  int64?: boolean;
  uint8array?: boolean;
  binarraybuffer?: boolean;
  usemap?: boolean;
}

interface ICodec {
  (options?: ICodecOptions);
  options: ICodecOptions;
  addExtPacker<T extends typeof FunctionConstructor = typeof FunctionConstructor>(type: number, instanceConstructor: T, instancePacker: (instance: InstanceType<T>) => Uint8Array);
  addExtUnpacker<T = any>(type: number, instanceUnpacker: (buffer: Buffer) => T);
}

interface IEncoderDecoderOptions {
  codec: ICodec;
}

interface IEncodeBuffer {
  codec: ICodec;
  write(input: EncoderDecoderInput);
}

interface IDecodeBuffer {
  codec: ICodec;
  fetch(): any;
}

class Encoder extends IEncodeBuffer {
  constructor(options?: IEncoderDecoderOptions);
  encode(chunk: any);
  end(chunk: any);
}

class Decoder extends IDecodeBuffer {
  constructor(options?: IEncoderDecoderOptions);
  decode(chunk: any);
  push(chunk: any);
  end(chunk: any);
}

export function encode(input: EncoderDecoderInput, options?: IEncoderDecoderOptions): Uint8Array;

export function decode(input: Buffer, options?: IEncoderDecoderOptions): any;
export function decode(input: Uint8Array, options?: IEncoderDecoderOptions): any;
export function decode(input: number[], options?: IEncoderDecoderOptions): any;

export const Encoder: Encoder;
export const Decoder: Decoder;

export function createEncodeStream(): TransformStream;
export function createDecodeStream(): TransformStream;

export function createCodec(options?: ICodecOptions): ICodec;
export const codec: ICodec;
