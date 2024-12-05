import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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
export class NavbarComponent implements OnInit, OnDestroy {
  loggedIn = false;

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private auth: AngularFireAuth) { }

  ngOnInit(): void {
    this.auth.authState.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.loggedIn = !!user;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
