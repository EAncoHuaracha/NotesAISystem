import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { RoutesNotesAI } from '../../../core/constants/routes.constants';
import { CreateProjectComponent } from "../../pages/projects/create-project/create-project.component";

@Component({
  selector: 'app-navbar',
  imports: [CreateProjectComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // Profile
  username: string = 'User';
  image: string = '';

  // Dropdown
  dropdownOpen: boolean = false;

  // Create Project
  showCreateModal: boolean = false;

  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.username = user.displayName || 'User';
        this.image = user.photoURL || '';
      } else {
        this.router.navigate([RoutesNotesAI.LOGIN]);
      }
    });
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate([RoutesNotesAI.LOGIN]);
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  createProject() {
    this.showCreateModal = true;
  }
}
