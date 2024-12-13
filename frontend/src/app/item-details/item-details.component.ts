import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, take } from 'rxjs';
import { ItemService, Item, Review } from '../item.service';
import { User, UserService } from '../user.service';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.css'
})
export class ItemDetailsComponent implements OnInit {
  item$: Observable<Item> = new Observable<Item>;
  reviews$: Observable<Review[]> = new Observable<Review[]>;
  user$: Observable<User | null> = of(null);
  reviewForm!: FormGroup;
  ratings: number[] = [1, 2, 3, 4, 5];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('item_id');
    if (itemId) {
      this.item$ = this.itemService.getItem(Number(itemId));
      this.reviews$ = this.itemService.getReviews(Number(itemId));
      this.user$ = this.userService.getCurrentUser();
      this.reviewForm = this.fb.group({
        rating: [null, [Validators.required]],
        comment: ['', [Validators.required, Validators.minLength(3)]]
      });

      this.item$.subscribe({
        complete: () => setTimeout(() => this.isLoading = false, 100)
      });
    }
  }

  onBuy() {
    const itemId = Number(this.route.snapshot.paramMap.get('item_id'));
    this.user$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.snackBar.open('Log in to purchase', 'Close', { duration: 3000 });
        return;
      }
      this.itemService.buyItem(itemId, user.id).subscribe({
        next: () => {
          this.snackBar.open('Item bought successfully', 'Close', { duration: 3000 });
          this.item$ = this.itemService.getItem(Number(itemId));
        },
        error: (err) => {
          console.error('Error buying item', err);
          this.snackBar.open('Error processing purchase', 'Close', { duration: 3000 });
        }
      });
    });
  }

  onSubmitReview() {
    const { rating, comment } = this.reviewForm.value;
    const itemId = this.route.snapshot.params['item_id'];

    this.user$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.snackBar.open('Log in to submit a review', 'Close', { duration: 3000 });
        return;
      }
      this.itemService.submitReview(itemId, user.id, comment, rating).subscribe({
        next: () => {
          this.reviewForm.reset();
          this.reviews$ = this.itemService.getReviews(itemId);

          // Reset the review form errors
          Object.keys(this.reviewForm.controls).forEach(control => {
            this.reviewForm.get(control)?.setErrors(null);
          });
        },
        error: (err) => {
          this.snackBar.open('Error submitting review', 'Close', { duration: 3000 });
          console.error('Error submitting review', err);
        }
      });
    });
  }

  getAverageRating(reviews: Review[]): string {
    if (!reviews || reviews.length === 0) {
      return "N/A";
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  }
}

