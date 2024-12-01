import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemService, Item, Category } from '../item.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {
  items$: Observable<Item[]> = new Observable<Item[]>();
  categories$: Observable<Category[]> = new Observable<Category[]>();
  query: string = '';
  selectedCategory: number = 0;

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    this.items$ = this.itemService.loadItems();
    this.categories$ = this.itemService.loadCategories()
  }

  onSearch(): void {
    if (this.selectedCategory != 0) {
      this.items$ = this.itemService.searchItems(this.query, this.selectedCategory);
    } else {
      this.items$ = this.itemService.searchItems(this.query);
    }
  }
}
