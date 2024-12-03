import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMsg: String | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AngularFireAuth,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  register() {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMsg = "Please fill out all fields";
      return;
    }

    const { email, password } = this.loginForm.value;
    this.auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        this.router.navigate(['/items']);
      }).catch((e) => {
        console.log("Login error:", e);
        this.errorMsg = "Incorrect email or password";
      });
  }
}
