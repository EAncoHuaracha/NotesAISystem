import { Injectable } from '@angular/core';
import { environment } from '../../environment/firebase-config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../core/models/project.model';
import { Canvas } from '../core/models/canvas.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsApiService {

  private readonly apiUrl: string = environment.apiUrl;
  constructor(
    private readonly http: HttpClient,
  ) { }

  getProjects(): Observable<Project[]> {
    return this.http.get<any>(`${this.apiUrl}/projects`);
  }

  createProject(project: any) {
    return this.http.post(`${this.apiUrl}/projects`, project);
  }

  deleteProject(id: string) {
    return this.http.delete(`${this.apiUrl}/projects/${id}`);
  }

  getProject(id: string): Observable<any> {
    return this.http.get<Canvas>(`${this.apiUrl}/projects/${id}`);
  }

  saveProject(id: string, canvas: any) {
    return this.http.put(`${this.apiUrl}/projects/${id}`, canvas);
  }
}
