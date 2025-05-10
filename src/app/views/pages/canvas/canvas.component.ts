import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import * as fabric from 'fabric';
import { ProjectsApiService } from '../../../infrastructure/projects-api.service';
import { FormsModule } from '@angular/forms';
import { CanvasTools } from '../../../core/utils/canvas-tools.utils';
import { CanvasExporter } from '../../../core/utils/canvas-exporter.utils';
import { AiProcessor } from '../../../core/utils/ai-processor.utils';
import { CanvasInitializer } from '../../../core/utils/canvas-initializer.utils';

@Component({
  selector: 'app-canvas',
  imports: [
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
  providers: [ProjectsApiService]
})

export class CanvasComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: fabric.Canvas;
  currentTool: 'draw' | 'text' | 'erase' | 'none' = 'none';
  showInput: boolean = false;
  prompt: string = '';
  projectId: string | null = null;
  status: string = 'init';

  private tools!: CanvasTools;
  private exporter!: CanvasExporter;
  private aiProcessor!: AiProcessor;

  constructor(
    private readonly projectsApiService: ProjectsApiService,
    private readonly route: ActivatedRoute
  ) { }

  ngAfterViewInit(): void {
    this.canvas = CanvasInitializer.init(this.canvasRef.nativeElement);
    this.tools = new CanvasTools(this.canvas);
    this.exporter = new CanvasExporter(this.canvas);
    this.aiProcessor = new AiProcessor(this.canvas, this.projectsApiService);

    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) this.loadCanvas(this.projectId);

    this.resizeCanvasToFit();
    window.addEventListener('resize', () => this.resizeCanvasToFit());
    window.addEventListener('keydown', (e) => this.tools.handleDeleteKey(e));
  }

  enableDraw() { this.tools.enableDraw(); }
  enableErase() { this.tools.enableErase(); }
  addText() { this.tools.addText(); }
  enableSelect() { this.tools.enableSelect(); }

  saveCanvas() {
    if (!this.projectId) return;
    this.status = 'loading';
    const content = this.canvas.toJSON();
    this.projectsApiService.saveProject(this.projectId, { projectId: this.projectId, content: JSON.stringify(content) }).subscribe({
      next: () => this.status = 'success',
      error: err => console.error('Error saving canvas:', err)
    });
  }

  processSelectionWithAI() {
    this.status = 'loading';
    const base64 = this.exporter.exportSelectedToBase64();
    if (!base64 || !this.projectId) return;
    this.aiProcessor.processSelection(base64, this.prompt, this.projectId).then(() => {
      this.status = 'success';
    }).catch(err => {
      this.status = 'error';
      console.error(err);
    });
  }


  loadCanvas(projectId: string) {
    this.status = 'loading';
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
        this.status = 'success';
      },
      error: (error) => {
        console.error('Error loading canvas:', error);
      }
    });

  }

  resizeCanvasToFit() {
    this.canvas.setWidth(window.innerWidth);
    this.canvas.setHeight(window.innerHeight);
    this.canvas.renderAll();
  }
}