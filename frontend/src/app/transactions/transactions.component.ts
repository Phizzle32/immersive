import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { Transaction, User, UserService, UserTransaction } from '../user.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit, OnDestroy {
  user$: Observable<User | null> = this.userService.getCurrentUser();
  purchases: Transaction[] = [];
  sales: Transaction[] = [];
  totalExpense: number = 0;
  totalRevenue: number = 0;
  balance: number = 0;

  private destroy$ = new Subject<void>()

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.userService.getTransactions(user.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: UserTransaction) => {
            this.purchases = data.purchases;
            this.sales = data.sales;

            this.totalExpense = this.purchases.reduce((sum, purchase) => sum + purchase.price, 0);
            this.totalRevenue = this.sales.reduce((sum, sale) => sum + sale.price, 0);
            this.balance = this.totalRevenue - this.totalExpense;
          });
      } else {
        this.snackBar.open('Log in to see transactions', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
