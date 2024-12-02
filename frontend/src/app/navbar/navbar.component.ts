import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    RouterModule,
    MatMenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  loggedIn = false;

  constructor(private router: Router, private auth: AngularFireAuth) { }

  ngOnInit(): void {
    this.auth.authState.subscribe((user) => {
      this.loggedIn = !!user;
    });
  }

  logout() {
    this.auth.signOut().then(() => {
      this.loggedIn = false;
      this.router.navigate(['login']);
    }).catch((error) => {
      console.error("Error during logout:", error);
    });
  }
}
