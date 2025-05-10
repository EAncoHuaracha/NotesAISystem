import * as fabric from 'fabric';

export class CanvasTools {
    private readonly brush: fabric.PencilBrush;

    constructor(private readonly canvas: fabric.Canvas) {
        this.brush = new fabric.PencilBrush(this.canvas);
        this.brush.width = 2;
        this.brush.color = '#000000';
    }

    enableDraw() {
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = this.brush;
    }

    enableErase() {
        this.canvas.isDrawingMode = false;
        const selected = this.canvas.getActiveObjects();
        selected.forEach(obj => this.canvas.remove(obj));
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
    }

    handleDeleteKey(event: KeyboardEvent) {
        if (event.key === 'Delete') this.enableErase();
    }

    addText() {
        const text = new fabric.IText('New Text', {
            left: 100,
            top: 100,
            fill: 'black',
            fontSize: 12,
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
    }

    enableSelect() {
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
        this.canvas.defaultCursor = 'default';
    }
}
