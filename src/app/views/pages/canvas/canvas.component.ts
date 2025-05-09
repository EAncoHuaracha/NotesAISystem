import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { HttpClientModule } from '@angular/common/http';
import * as fabric from 'fabric';
import { ProjectsApiService } from '../../../infrastructure/projects-api.service';

@Component({
  selector: 'app-canvas',
  imports: [
    NavbarComponent,
    HttpClientModule
  ],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
  providers: [ProjectsApiService]
})

export class CanvasComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: fabric.Canvas;

  currentTool: 'draw' | 'text' | 'erase' | 'none' = 'none';

  private drawingBrush!: fabric.PencilBrush;
  private isResizing = false;

  projectId: string | null = null;

  constructor(
    private readonly projectsApiService: ProjectsApiService,
    private readonly route: ActivatedRoute,
  ) { }
  ngAfterViewInit() {
    this.initializeCanvas();
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadCanvas(this.projectId);
    }
    this.setDefaultCanvasSize();
    window.addEventListener('resize', () => this.resizeCanvasToFit());

  }

  private initializeCanvas() {
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      isDrawingMode: false,
      backgroundColor: 'white',
      selection: true,
    });

    this.drawingBrush = new fabric.PencilBrush(this.canvas);
    this.drawingBrush.width = 2;
    this.drawingBrush.color = '#000000';
  }

  private setDefaultCanvasSize() {
    const defaultWidth = 800;
    const defaultHeight = 600;
    this.canvas.setDimensions({ width: defaultWidth, height: defaultHeight });

    this.canvas.renderAll();
  }

  enableDraw() {
    this.currentTool = 'draw';
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush = this.drawingBrush;
  }

  enableErase() {
    this.currentTool = 'erase';
    this.canvas.isDrawingMode = false;
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.remove(active);
    }
  }

  addText() {
    this.canvas.isDrawingMode = false;
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
    this.currentTool = 'none';
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default';
  }

  saveCanvas() {
    const json = this.canvas.toJSON();
    const data = {
      projectId: this.projectId,
      content: JSON.stringify(json),
    };
    this.projectsApiService.saveProject(this.projectId!, data).subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('Error saving canvas:', error);
      }
    });
  }

  exportSelectedToBase64(): string | null {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) {
      console.warn('No object selected');
      return null;
    }

    const dataUrl = this.canvas.toDataURL({
      left: activeObject.left,
      top: activeObject.top,
      width: activeObject.width! * activeObject.scaleX!,
      height: activeObject.height! * activeObject.scaleY!,
      format: 'png',
      multiplier: 1
    });

    return dataUrl;
  }

  processSelectionWithAI() {
    const base64 = this.exportSelectedToBase64();
    const prompt = 'Generate a realistic heart';

    console.log('Base64:', base64);
    console.log('Prompt:', prompt);
    if (!base64 || !this.projectId) return;

    this.projectsApiService.sendToAI({ imageBase64: base64, prompt }).subscribe({
      next: (response) => {
        console.log('AI response:', response);
        const imgUrl = response.result;

        console.log('Image URL:', imgUrl);

        const imgElement = new Image();
        imgElement.crossOrigin = 'anonymous';
        imgElement.src = imgUrl;

        imgElement.onload = () => {
          // Primero, obtenemos el objeto activo y lo eliminamos
          const activeObject = this.canvas.getActiveObject();
          if (activeObject) {
            this.canvas.remove(activeObject);
          }

          // Luego, procesamos la imagen para eliminar el fondo
          const cleanedCanvas = this.removeBackgroundByColor(imgElement);

          const newImg = new fabric.Image(cleanedCanvas);

          if (activeObject) {
            const left = activeObject.left!;
            const top = activeObject.top!;
            const width = activeObject.width! * activeObject.scaleX!;
            const height = activeObject.height! * activeObject.scaleY!;

            const scaleX = width / newImg.width!;
            const scaleY = height / newImg.height!;

            newImg.set({
              left,
              top,
              scaleX,
              scaleY,
              selectable: true,
              hasBorders: true,
              hasControls: true,
            });
          } else {
            newImg.set({ left: 100, top: 100 });
          }
          this.canvas.add(newImg);
          this.canvas.setActiveObject(newImg);
          this.canvas.renderAll();
        };

        imgElement.onerror = (err) => {
          console.error('❌ Error al cargar la imagen:', err);
        };
      },
      error: (err) => {
        console.error('AI processing error:', err);
      }
    });
  }
  removeBackgroundByColor(imgElement: HTMLImageElement): HTMLCanvasElement {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d')!;
    tempCanvas.width = imgElement.width;
    tempCanvas.height = imgElement.height;

    // Draw the image on the canvas
    ctx.drawImage(imgElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Threshold for white or light-colored background (adjustable as needed)
    const backgroundColor = { r: 255, g: 255, b: 255 };
    const tolerance = 150; // Tolerance for colors close to white
    const edgeThreshold = 100; // Threshold to detect object edges

    // Process each pixel of the image
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate the difference between the pixel and the background color
      const diffR = Math.abs(r - backgroundColor.r);
      const diffG = Math.abs(g - backgroundColor.g);
      const diffB = Math.abs(b - backgroundColor.b);

      // If the difference is smaller than the tolerance, consider it the background and make it transparent
      if (diffR < tolerance && diffG < tolerance && diffB < tolerance) {
        const isEdge = this.isEdgePixel(i, data, tempCanvas.width, edgeThreshold);
        if (!isEdge) {
          data[i + 3] = 0;
        }
      }
    }

    // Apply the changes
    ctx.putImageData(imageData, 0, 0);
    return tempCanvas;
  }

  isEdgePixel(index: number, data: Uint8ClampedArray, width: number, threshold: number): boolean {
    const x = (index / 4) % width;
    const y = Math.floor(index / 4 / width);

    // Detect pixels near the edges
    const neighbors = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
    ];

    let edgeCount = 0;

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && ny >= 0 && nx < width && ny < width) {
        const neighborIndex = ((ny * width) + nx) * 4;
        const r = data[neighborIndex];
        const g = data[neighborIndex + 1];
        const b = data[neighborIndex + 2];

        // If the neighboring pixel is very different, consider it an edge
        const diffR = Math.abs(data[index] - r);
        const diffG = Math.abs(data[index + 1] - g);
        const diffB = Math.abs(data[index + 2] - b);

        if (diffR > threshold || diffG > threshold || diffB > threshold) {
          edgeCount++;
        }
      }
    }

    return edgeCount > 2;
  }


  loadCanvas(projectId: string) {
    this.projectsApiService.getProject(projectId).subscribe({
      next: (canvasData) => {
        const canvasContent = JSON.parse(canvasData.content);

        if (canvasContent && canvasContent.version && Array.isArray(canvasContent.objects)) {
          this.canvas.loadFromJSON(canvasContent, () => {
            this.canvas.getObjects().forEach(obj => {
              obj.setCoords();
            });

            this.canvas.renderAll();
            this.canvas.requestRenderAll();
          });
        } else {
          console.error('Invalid canvas content:', canvasContent);
        }
      },
      error: (error) => {
        console.error('Error loading canvas:', error);
      }
    });

  }

  resizeCanvasToFit() {
    const parent = this.canvasRef.nativeElement.parentElement;
    if (parent) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      this.canvas.setHeight(height, { cssOnly: true });
      this.canvas.setWidth(width, { cssOnly: true });
      this.canvas.renderAll();
    }
  }

  startResizing(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;

    const onMouseMove = (e: MouseEvent) => {
      if (this.isResizing) {
        const parent = this.canvasRef.nativeElement.parentElement;
        if (parent) {
          const newWidth = e.clientX - parent.getBoundingClientRect().left;
          const newHeight = e.clientY - parent.getBoundingClientRect().top;

          this.canvas.setWidth(newWidth, { cssOnly: true });
          this.canvas.setHeight(newHeight, { cssOnly: true });
          this.canvas.renderAll();
        }
      }
    };

    const onMouseUp = () => {
      this.isResizing = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
}