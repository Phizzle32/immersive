import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, debounceTime, Observable, of, share, Subject, switchMap, takeUntil } from 'rxjs';
import { ItemService, Item, Category } from '../item.service';
import { User, UserService } from '../user.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit, OnDestroy {
  @Input() isUserListings: boolean = false;
  @Output() editItemEvent = new EventEmitter<Item>;

  items$: Observable<Item[]> = new Observable<Item[]>();
  categories$: Observable<Category[]> = this.itemService.loadCategories();
  user$: Observable<User | null> = this.userService.getCurrentUser();
  query: string = '';
  selectedCategory: number = 0;

  private searchParams$ = new BehaviorSubject<{ query: string, category: number }>({ query: '', category: 0 });
  private destroy$ = new Subject<void>();

  constructor(
    private itemService: ItemService,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    if (this.isUserListings) {
      this.items$ = combineLatest([this.user$, this.searchParams$]).pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        switchMap(([user, params]) => {
          if (user) {
            const { query, category } = params;
            return category != 0
              ? this.itemService.searchUserItems(user.id, query, category)
              : this.itemService.searchUserItems(user.id, query);
          } else {
            this.snackBar.open('Log in to see your listings', 'Close', { duration: 3000 });
            return of([]);
          }
        }),
        share()
      );
    } else {
      this.items$ = this.searchParams$.pipe(
        takeUntil(this.destroy$),
        debounceTime(200),
        switchMap(({ query, category }) => {
          return category != 0
            ? this.itemService.searchItems(query, category)
            : this.itemService.searchItems(query);
        }),
        share()
      );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEdit(item: Item) {
    this.editItemEvent.emit(item);
  }

  onDelete(item: Item) {
    this.itemService.deleteItem(item).subscribe({
      next: () => {
        this.onSearch();
        this.snackBar.open('Item deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Error deleting item', 'Close', { duration: 3000 });
        console.error('Error deleting item:', err);
      },
    });
  }

  onSearch(): void {
    this.searchParams$.next({ query: this.query.trim(), category: this.selectedCategory });
  }
}
