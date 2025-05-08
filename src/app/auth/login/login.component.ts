import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { RoutesNotesAI } from '../../core/constants/routes.constants';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  login() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(result => {
        this.router.navigate([RoutesNotesAI.PROJECTS]);
      })
      .catch(error => {
        console.error(error);
      });
  }
}
