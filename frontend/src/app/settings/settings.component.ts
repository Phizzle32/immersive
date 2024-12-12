import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin, Observable, take } from 'rxjs';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { User, UserService } from '../user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  passwordVisibility = 'password';

  displayName: FormControl = new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern('^[a-zA-Z]{1} ?[a-zA-Z]{1}[a-zA-Z ]*$')]);
  email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  password: FormControl = new FormControl('');
  newPassword: FormControl = new FormControl('', Validators.minLength(6));
  confirmPassword: FormControl = new FormControl('');
  phoneNumber: FormControl = new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]);

  user$: Observable<User | null> = this.userService.getCurrentUser();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      displayName: this.displayName,
      email: this.email,
      password: this.password,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber
    });

    this.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.displayName.setValue(user.name);
        this.email.setValue(user.email);
        this.phoneNumber.setValue(user.phone_number);
      } else {
        this.snackBar.open('Please log in to edit settings', 'Close', { duration: 3000 });
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisibility = this.passwordVisibility === 'password' ? 'text' : 'password';
  }

  onSave() {
    this.user$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.snackBar.open('Please log in to edit settings', 'Close', { duration: 3000 });
        return;
      }

      const updateRequests = [];
      const { displayName, email, password, newPassword, confirmPassword, phoneNumber } = this.settingsForm.value;
      const updatedUser: User = {
        id: user.id,
        name: displayName.trim(),
        email: email.trim(),
        phone_number: phoneNumber
      }

      if (user.name !== updatedUser.name || user.email !== updatedUser.email || user.phone_number !== updatedUser.phone_number) {
        updateRequests.push(this.userService.updateUser(updatedUser, password));
      }

      if (newPassword && password && confirmPassword) {
        updateRequests.push(this.userService.changePassword(newPassword, password));
      }

      if (!updateRequests.length) {
        this.snackBar.open('No changes to save', 'Close', { duration: 3000 });
      }

      forkJoin(updateRequests).subscribe({
        next: () => {
          this.snackBar.open('Changes saved', 'Close', { duration: 3000 });
          this.resetErrors();
          this.password.setValue('');
          this.newPassword.setValue('');
          this.confirmPassword.setValue('');
        },
        error: (err) => {
          if (err.code === 'auth/wrong-password') {
            this.password.setErrors({ incorrect: true });
          } else if (err.code === 'auth/email-already-in-use') {
            this.snackBar.open('Email is already in use', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Error occurred while saving changes', 'Close', { duration: 3000 });
            console.error('Error occurred while saving changes:', err);
          }
        }
      });
    });
  }

  deleteAccount() {
    this.user$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.snackBar.open('Please log in to delete account', 'Close', { duration: 3000 });
        return;
      } else if (!this.settingsForm.value.password) {
        this.snackBar.open('Enter password to delete account', 'Close', { duration: 3000 });
        return;
      }

      const confirmModal = this.dialog.open(ConfirmModalComponent, {
        data: {
          title: 'Delete Account',
          description: 'Are you sure you want to delete your account?',
          actionButtonText: 'Delete'
        }
      });

      confirmModal.afterClosed().subscribe((confirm) => {
        if (confirm) {
          this.userService.deleteUser(user.id, this.settingsForm.value.password).subscribe({
            next: () => {
              this.router.navigate(['/login']);
            },
            error: (err) => {
              if (err.code === 'auth/wrong-password') {
                this.password.setErrors({ incorrect: true });
                return;
              }
              this.snackBar.open('Error deleting account', 'Close', { duration: 3000 });
              console.error('Error deleting account:', err);
            }
          });
        }
      });
    });
  }

  onBlurEmail() {
    this.user$.pipe(take(1)).subscribe(user => {
      const { email, password } = this.settingsForm.value;
      if (user?.email !== email && !password) {
        this.password.addValidators(Validators.required);
        this.password.markAsTouched();
        this.password.updateValueAndValidity();
      } else {
        this.password.removeValidators(Validators.required);
        this.password.updateValueAndValidity();
      }
    });
  }

  onBlurPassword() {
    const { password, newPassword, confirmPassword } = this.settingsForm.value;

    this.newPassword.setErrors(null);
    this.confirmPassword.setErrors(null);

    if (!newPassword) {
      this.resetErrors();
      return;
    }

    this.password.addValidators(Validators.required);
    this.password.markAsTouched();
    this.password.updateValueAndValidity();
    this.confirmPassword.addValidators(Validators.required);

    if (newPassword === password) {
      this.newPassword.setErrors({ samePassword: true });
    }

    if (newPassword !== confirmPassword) {
      this.confirmPassword.setErrors({ passwordMismatch: true });
    }
  }

  resetErrors() {
    this.password.removeValidators(Validators.required);
    this.confirmPassword.removeValidators(Validators.required);
    this.password.updateValueAndValidity();
    this.confirmPassword.updateValueAndValidity();
  }
}