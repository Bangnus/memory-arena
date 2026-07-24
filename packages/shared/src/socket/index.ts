export interface ISocketClientEventMap {
  connect: () => void;
  disconnect: () => void;
}

export interface ISocketServerEventMap {
  'session:update': (payload: unknown) => void;
  'round:result': (payload: unknown) => void;
  'match:result': (payload: unknown) => void;
}
