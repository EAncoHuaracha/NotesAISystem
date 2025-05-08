import { Routes } from '@angular/router';
import { RoutesNotesAI } from './core/constants/routes.constants';
import { LoginComponent } from './auth/login/login.component';
import { ProjectsComponent } from './views/pages/projects/projects.component';

export const routes: Routes = [
    {
        path: RoutesNotesAI.LOGIN,
        component: LoginComponent
    },
    {
        path: RoutesNotesAI.PROJECTS,
        component: ProjectsComponent
    },
    {
        path: '**',
        redirectTo: RoutesNotesAI.LOGIN,
        pathMatch: 'full'
    }
];
