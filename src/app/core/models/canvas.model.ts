export interface PenPoint {
  x: number;
  y: number;
}

export interface PenElement {
  type: 'pen';
  points: PenPoint[];
  color: string;
  lineWidth: number;
}

export interface TextElement {
  type: 'text';
  position: { x: number; y: number };
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export type CanvasElement = PenElement | TextElement;

export interface Canvas {
  _id?: string; // opcional si lo genera backend
  userId: string;
  name: string;
  elements: CanvasElement[];
  createdAt: Date;
  updatedAt: Date;
}
