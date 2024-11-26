import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemService, Item } from '../item.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.css'
})
export class ItemDetailsComponent implements OnInit {
  item$: Observable<Item> = new Observable<Item>;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('item_id');
    if (itemId) {
      this.item$ = this.itemService.getItem(Number(itemId));
    }
  }
}

