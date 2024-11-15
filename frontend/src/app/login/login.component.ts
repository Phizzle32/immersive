import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
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
    private auth: Auth,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Initialize login form
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
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        console.log(userCredential);
        this.router.navigate(['/']);
      }).catch((e) => {
        console.log("Login error:", e);
        this.errorMsg = "Incorrect email or password";
      });
  }
}
