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

  constructor(private readonly projectsApiService: ProjectsApiService) { }

  ngAfterViewInit() {
    this.initializeCanvas();
    this.loadCanvas();
    this.setDefaultCanvasSize(); // Establecer tamaño por defecto
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
      projectId: 'ID_DEL_PROYECTO',
      content: JSON.stringify(json),
    };
    console.log('Canvas data:', data);
    this.projectsApiService.saveProject(data.projectId, data).subscribe({
      next: (response) => {
        console.log('Canvas saved:', response);
      },
      error: (error) => {
        console.error('Error saving canvas:', error);
      }
    });
  }

  loadCanvas() {
    this.projectsApiService.getProject('1').subscribe({
      next: (canvasData) => {
        const canvasContent = canvasData[0].content;

        if (canvasContent && canvasContent.version && Array.isArray(canvasContent.objects)) {
          this.canvas.loadFromJSON(canvasContent, () => {
            this.canvas.renderAll();
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