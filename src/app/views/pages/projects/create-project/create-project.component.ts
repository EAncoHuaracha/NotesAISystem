import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectsApiService } from '../../../../infrastructure/projects-api.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectRefreshService } from '../../../../infrastructure/project-refresh.service';

@Component({
  selector: 'app-create-project',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css',
  providers: [ProjectsApiService]
})
export class CreateProjectComponent {
  form: FormGroup;

  @Input() showForm: boolean = false;
  @Output() closeEvent = new EventEmitter();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly projectsApiService: ProjectsApiService,
    private readonly refreshProjects: ProjectRefreshService,
    private readonly router: Router,
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  createProject() {
    if (this.form.valid) {
      const project = this.form.value;
      this.projectsApiService.createProject(project).subscribe({
        next: () => {
          this.refreshProjects.triggerRefresh();
          this.close();
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          console.error('Error creating project:', error);
        }
      });
    } else {
      console.error('Form is invalid');
    }
  }

  close() {
    this.closeEvent.emit()
  }
}
