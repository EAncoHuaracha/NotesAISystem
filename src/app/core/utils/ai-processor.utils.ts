import * as fabric from 'fabric';
import { ProjectsApiService } from '../../infrastructure/projects-api.service';

export class AiProcessor {
    constructor(
        private canvas: fabric.Canvas,
        private api: ProjectsApiService
    ) { }

    async processSelection(base64: string, prompt: string, projectId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.api.sendToAI({ imageBase64: base64, prompt }).subscribe({
                next: (response) => {
                    // Recibimos la imagen base64 generada por la API
                    const processedImageBase64 = response.result;

                    // Convertimos el base64 a una imagen
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = processedImageBase64;

                    img.onload = () => {
                        const canvasWithoutBackground = this.removeBackgroundByColor(img);
                        const imgWithoutBackground = new Image();
                        imgWithoutBackground.src = canvasWithoutBackground.toDataURL();

                        imgWithoutBackground.onload = () => {
                            const active = this.canvas.getActiveObject();
                            if (active) this.canvas.remove(active);

                            const fabricImg = new fabric.Image(imgWithoutBackground);
                            fabricImg.set({
                                left: active?.left || 100,
                                top: active?.top || 100,
                                scaleX: (active?.width! * active?.scaleX!) / imgWithoutBackground.width,
                                scaleY: (active?.height! * active?.scaleY!) / imgWithoutBackground.height,
                                selectable: true
                            });

                            this.canvas.add(fabricImg);
                            this.canvas.setActiveObject(fabricImg);
                            this.canvas.renderAll();
                            resolve();
                        };

                        imgWithoutBackground.onerror = reject;
                    };

                    img.onerror = reject;
                },
                error: reject
            });
        });
    }

    // Function to process the image and remove the background
    removeBackgroundByColor(img: HTMLImageElement): HTMLCanvasElement {
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d')!;
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        const backgroundColor = { r: 255, g: 255, b: 255 };
        const tolerance = 150;
        const edgeThreshold = 100;

        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
            const isCloseToWhite =
                Math.abs(r - backgroundColor.r) < tolerance &&
                Math.abs(g - backgroundColor.g) < tolerance &&
                Math.abs(b - backgroundColor.b) < tolerance;

            if (isCloseToWhite && !this.isEdgePixel(i, data, tempCanvas.width, edgeThreshold)) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return tempCanvas;
    }

    // Function to check if a pixel is an edge
    isEdgePixel(index: number, data: Uint8ClampedArray, width: number, threshold: number): boolean {
        const x = (index / 4) % width;
        const y = Math.floor(index / 4 / width);
        const neighbors = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
        ];

        let edgeCount = 0;

        for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < width && ny < width) {
                const ni = ((ny * width) + nx) * 4;
                const diff = [
                    Math.abs(data[index] - data[ni]),
                    Math.abs(data[index + 1] - data[ni + 1]),
                    Math.abs(data[index + 2] - data[ni + 2]),
                ];
                if (diff.some(d => d > threshold)) edgeCount++;
            }
        }

        return edgeCount > 2;
    }
}
