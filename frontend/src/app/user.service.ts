import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthError, EmailAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, firstValueFrom, from, map, Observable, of, switchMap, throwError } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export interface Transaction {
  trans_id: number;
  item_title: string;
  price: number;
  date: string;
}

export interface UserTransaction {
  purchases: Transaction[];
  sales: Transaction[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private auth: AngularFireAuth
  ) { }

  getCurrentUser(): Observable<User | null> {
    const user$ = this.auth.authState;
    return user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(null);
        }
        return this.http.get<User>(`/api/user/email/${user.email}`).pipe(
          catchError((error) => {
            console.error('Error getting user:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  registerUser(email: string, password: string, name: string, phone: string): Promise<{ success: boolean; error: string | null }> {
    return this.auth.createUserWithEmailAndPassword(email, password)
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
          await userCredential.user?.delete();
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

  updateUser(user: User, password?: string): Observable<User> {
    return from(this.auth.currentUser).pipe(
      switchMap((firebaseUser) => {
        // If changing emails, reauthenticate, then update email in Firebase and backend
        if (firebaseUser && firebaseUser.email && user.email !== firebaseUser.email && password) {
          const credential = EmailAuthProvider.credential(firebaseUser.email, password);
          return from(firebaseUser.reauthenticateWithCredential(credential)).pipe(
            switchMap(() => firebaseUser.updateEmail(user.email)),
            switchMap(() => this.http.patch<User>(`/api/user/${user.id}`, user))
          );
        }
        // If not changing emails, just update the backend
        return this.http.patch<User>(`/api/user/${user.id}`, user);
      })
    );
  }

  deleteUser(userId: number, password: string): Observable<void> {
    return from(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (user && user.email) {
          const credential = EmailAuthProvider.credential(user.email, password);
          return from(user.reauthenticateWithCredential(credential)).pipe(
            switchMap(() => this.http.delete(`/api/user/${userId}`)),
            switchMap(() => user.delete()),
          );
        }
        return throwError(() => new Error('No authenticated user found'));
      })
    );
  }

  changePassword(newPassword: string, oldPassword: string): Observable<void> {
    return from(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (user && user.email) {
          const credential = EmailAuthProvider.credential(user.email, oldPassword);
          return from(user.reauthenticateWithCredential(credential)).pipe(
            switchMap(() => user.updatePassword(newPassword))
          );
        }
        return throwError(() => new Error('No authenticated user found'));
      })
    );
  }

  getTransactions(userId: number): Observable<UserTransaction> {
    return this.http.get<UserTransaction>(`/api/transaction/user/${userId}`).pipe(
      map((data: UserTransaction) => {
        // Convert the price fields from strings to numbers
        data.purchases.forEach((transaction) => {
          transaction.price = Number(transaction.price);
        });
        data.sales.forEach((transaction) => {
          transaction.price = Number(transaction.price);
        });
        return data;
      }),
      catchError((error) => {
        console.error('Error getting transactions:', error);
        return throwError(() => error);
      })
    );
  }
}
