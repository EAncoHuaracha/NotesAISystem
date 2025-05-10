import * as fabric from 'fabric';

export class CanvasInitializer {
    static init(canvasEl: HTMLCanvasElement): fabric.Canvas {
        const canvas = new fabric.Canvas(canvasEl, {
            isDrawingMode: false,
            backgroundColor: 'white',
            selection: true,
        });

        return canvas;
    }
}
