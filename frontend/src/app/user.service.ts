import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth, AuthError, createUserWithEmailAndPassword, deleteUser } from '@angular/fire/auth';
import { catchError, firstValueFrom, Observable, of, throwError } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: Auth, private http: HttpClient) { }

  getCurrentUser(): Observable<User | null> {
    const user = this.auth.currentUser;
    if(!user || !user.email) {
      return of(null);
    }
    return this.http.get<User>(`/api/user/email/${user?.email}`).pipe(
      catchError((error) => {
        console.error('Error getting user:', error);
        return throwError(() => error);
      })
    );
  }

  registerUser(email: string, password: string, name: string, phone: string): Promise<{ success: boolean; error: string | null }> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const userData = {
          name,
          email,
          phone_number: phone
        };
  
        try {
          // Save the user to the backend
          await firstValueFrom(this.http.post('/api/user/create', userData));
          return { success: true, error: null };
        } catch (e) {
          // Rollback Firebase user creation if the backend request fails
          await deleteUser(userCredential.user);
          console.error("Error saving user to the backend:", e);
          return { success: false, error: "Something went wrong while saving your data" };
        }
      })
      .catch((error) => {
        if ((error as AuthError).code === "auth/email-already-in-use") {
          return { success: false, error: 'This email is already in use' };
        }
        console.error("Error during registration:", error);
        return { success: false, error: "Something went wrong while registering" };
      });
  }
}
