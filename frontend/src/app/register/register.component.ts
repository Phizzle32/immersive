import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Auth, AuthError, createUserWithEmailAndPassword, deleteUser } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  errorMsg: String | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Initialize signup form
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z]+[a-zA-Z ]*$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.errorMsg = "Please fill out all fields";
      return;
    }

    const { email, password, name, phone } = this.signupForm.value;

    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const userData = {
          name,
          email,
          phone_number: phone
        };

        // Add the user to the database
        this.http.post('/api/user/create', userData)
          .subscribe({
            next: (response) => {
              console.log("User created successfully in the database:", response);
              this.router.navigate(['/']);
            },
            error: (error) => {
              // Unregister email when it fails
              deleteUser(userCredential.user);
              console.error("Error saving user to the backend:", error);
              this.errorMsg = "Something went wrong while saving your data";
            }
          });
      }).catch((error) => {
        if ((error as AuthError).code === "auth/email-already-in-use") {
          this.errorMsg = "This email is already in use";
        } else {
          console.log("Register error:", error);
          this.errorMsg = "Something went wrong while registering";
        }
      });
  }
}
