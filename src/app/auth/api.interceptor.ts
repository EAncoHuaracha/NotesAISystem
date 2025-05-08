import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { getAuth } from "firebase/auth";
import { Router } from "@angular/router";
import { RoutesNotesAI } from "../core/constants/routes.constants";

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

    constructor(private readonly router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const auth = getAuth();
        const user = auth.currentUser; 

        if (user) {
            return from(user.getIdToken()).pipe(
                switchMap(token => {
                    const cloned = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    return next.handle(cloned);
                }),
                catchError(error => {
                    if (error.status === 401 || error.status === 403) {
                        this.router.navigate([RoutesNotesAI.LOGIN]);
                    }
                    return throwError(() => error);
                })
            );
        } else {
            this.router.navigate([RoutesNotesAI.LOGIN]);
            return throwError(() => new Error('No authenticated user'));
        }
    }
}