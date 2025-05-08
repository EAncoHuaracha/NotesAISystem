import { Routes } from '@angular/router';
import { RoutesNotesAI } from './core/constants/routes.constants';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
    {
        path: RoutesNotesAI.LOGIN,
        component: LoginComponent
    },
    {
        path: '**',
        redirectTo: RoutesNotesAI.LOGIN,
        pathMatch: 'full'
    }
];
