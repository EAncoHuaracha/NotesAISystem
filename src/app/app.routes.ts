import { Routes } from '@angular/router';
import { RoutesNotesAI } from './core/constants/routes.constants';
import { LoginComponent } from './auth/login/login.component';
import { ProjectsComponent } from './views/pages/projects/projects.component';
import { CanvasComponent } from './views/pages/canvas/canvas.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: RoutesNotesAI.LOGIN,
        component: LoginComponent
    },
    {
        path: RoutesNotesAI.PROJECTS,
        component: ProjectsComponent,
        canActivate: [authGuard]
    },
    {
        path: RoutesNotesAI.PROJECTS + '/:id',
        component: CanvasComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: RoutesNotesAI.LOGIN,
        pathMatch: 'full'
    }
];
