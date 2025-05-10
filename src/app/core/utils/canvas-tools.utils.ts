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
            fontSize: 32,
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
    }

    enableSelect() {
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
        this.canvas.defaultCursor = 'default';
    }

    enableArrow() {
        let isDrawing = false;
        let line: fabric.Line;
        let arrowHead: fabric.Triangle;

        this.canvas.on('mouse:down', (opt) => {
            isDrawing = true;
            const pointer = this.canvas.getPointer(opt.e);
            const points = [pointer.x, pointer.y, pointer.x, pointer.y] as [number, number, number, number];

            // Line
            line = new fabric.Line(points, {
                strokeWidth: 2,
                fill: 'black',
                stroke: 'black',
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false,
            });

            // Arrow head
            arrowHead = new fabric.Triangle({
                width: 10,
                height: 15,
                fill: 'black',
                left: pointer.x,
                top: pointer.y,
                originX: 'center',
                originY: 'center',
                angle: 90,
                selectable: false,
                evented: false,
            });

            this.canvas.add(line, arrowHead);
        });

        this.canvas.on('mouse:move', (opt) => {
            if (!isDrawing) return;
            const pointer = this.canvas.getPointer(opt.e);

            line.set({ x2: pointer.x, y2: pointer.y });

            // Calculate the angle for the arrow head
            const dx = pointer.x - line.x1!;
            const dy = pointer.y - line.y1!;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            // set the angle of the arrow head
            arrowHead.set({
                left: pointer.x,
                top: pointer.y,
                angle: angle + 90,
            });

            this.canvas.requestRenderAll();
        });

        this.canvas.on('mouse:up', () => {
            isDrawing = false;

            // Group the line and arrow head
            const arrowGroup = new fabric.Group([line, arrowHead], {
                selectable: true,
                evented: true,
            });

            this.canvas.remove(line);
            this.canvas.remove(arrowHead);
            this.canvas.add(arrowGroup);
            this.canvas.setActiveObject(arrowGroup);

            // Desactivate the arrow tool
            this.canvas.off('mouse:down');
            this.canvas.off('mouse:move');
            this.canvas.off('mouse:up');
        });
    }


}
