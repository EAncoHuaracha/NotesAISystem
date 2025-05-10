import * as fabric from 'fabric';

export class CanvasExporter {
    constructor(private readonly canvas: fabric.Canvas) { }

    exportSelectedToBase64(): string | null {
        const active = this.canvas.getActiveObject();
        if (!active) return null;

        return this.canvas.toDataURL({
            left: active.left,
            top: active.top,
            width: active.width! * active.scaleX!,
            height: active.height! * active.scaleY!,
            format: 'png',
            multiplier: 1
        });
    }
}
