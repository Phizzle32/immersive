import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Observable, take } from 'rxjs';
import { Item, ItemService } from '../item.service';
import { ItemListComponent } from "../item-list/item-list.component";
import { ItemModalComponent } from '../item-modal/item-modal.component';
import { User, UserService } from '../user.service';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    ItemListComponent
  ],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.css'
})
export class ListingsComponent {
  @ViewChild(ItemListComponent) itemList?: ItemListComponent;

  user$: Observable<User | null> = this.userService.getCurrentUser();

  constructor(
    private itemService: ItemService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  openCreateModal() {
    this.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        const dialogRef = this.dialog.open(ItemModalComponent, {
          width: '400px',
          data: { item_title: '', description: '', item_amount: 0, quantity: 1, seller_id: user.id } as Item,
        });

        dialogRef.afterClosed().subscribe((result: Item | null) => {
          if (result) {
            this.itemService.createItem(result).subscribe({
              next: () => {
                this.itemList?.onSearch();
                this.snackBar.open('Item created successfully', 'Close', { duration: 3000 });
              },
              error: (err) => {
                this.snackBar.open('Error creating item', 'Close', { duration: 3000 });
                console.error('Error creating item:', err);
              },
            });
          }
        });
      } else {
        this.snackBar.open('Please log in to create a listing', 'Close', { duration: 3000 });
      }
    });
  }

  openEditModal(item: Item) {
    const dialogRef = this.dialog.open(ItemModalComponent, {
      width: '400px',
      data: item,
    });

    dialogRef.afterClosed().subscribe((result: Item | null) => {
      if (result) {
        this.itemService.updateItem(result).subscribe({
          next: () => {
            this.itemList?.onSearch();
            this.snackBar.open('Item updated successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open('Error updating item', 'Close', { duration: 3000 });
            console.error('Error updating item:', err);
          },
        });
      }
    });
  }
}
