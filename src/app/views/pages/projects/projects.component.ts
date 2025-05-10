import { Component } from '@angular/core';
import { NavbarComponent } from "../../shared/navbar/navbar.component";
import { Project } from '../../../core/models/project.model';
import { ProjectsApiService } from '../../../infrastructure/projects-api.service';
import { HttpClientModule } from '@angular/common/http';
import { mapDate } from '../../../core/utils/date.utils';
import { Router } from '@angular/router';
import { RoutesNotesAI } from '../../../core/constants/routes.constants';
import { Subscription } from 'rxjs';
import { ProjectRefreshService } from '../../../infrastructure/project-refresh.service';

@Component({
  selector: 'app-projects',
  imports: [
    NavbarComponent,
    HttpClientModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  providers: [ProjectsApiService]
})
export class ProjectsComponent {
  projects: Project[] = [];
  status: string = 'init';

  mapDate = mapDate;

  refreshSubscription: Subscription;

  constructor(
    private readonly projectsApiService: ProjectsApiService,
    private readonly projectRefreshService: ProjectRefreshService,
    private readonly router: Router,
  ) {
    this.refreshSubscription = this.projectRefreshService.refreshProjects$.subscribe(() => {
      this.getProjects();
    });
  }

  ngOnInit() {
    this.getProjects();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getProjects() {
    this.status = 'loading';
    this.projectsApiService.getProjects().subscribe({
      next: projects => {
        this.projects = projects;
        this.status = 'success';
      },
      error: (error) => {
        console.error('Error getting projects:', error);
        this.status = 'error';
      }
    })
  }

  openProject(id: string) {
    this.router.navigate([RoutesNotesAI.PROJECTS, id]);
  }

  deleteProject(id: string) {
    this.status = 'loading';
    this.projectsApiService.deleteProject(id).subscribe({
      next: () => {
        this.getProjects();
        this.status = 'success';
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        this.status = 'error';
      }
    })
  }
}
