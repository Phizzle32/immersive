import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { Category, Item, ItemService } from '../item.service';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './item-modal.component.html',
  styleUrl: './item-modal.component.css'
})
export class ItemModalComponent {
  itemForm!: FormGroup;
  categories$: Observable<Category[]> = new Observable<Category[]>;
  data: Item = inject(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ItemModalComponent>,
    private itemService: ItemService,
  ) { }

  ngOnInit(): void {
    this.categories$ = this.itemService.loadCategories();
    this.itemForm = this.fb.group({
      title: [this.data.item_title || '', Validators.required],
      description: [this.data.description || '', Validators.required],
      cost: [this.data.item_amount || '', [Validators.required, Validators.min(0.01)]],
      quantity: [this.data.quantity || '', [Validators.required, Validators.min(1)]],
      category_id: [this.data.category_id || null],
    });
  }

  onSave() {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      const item: Item = {
        item_id: this.data.item_id,
        item_title: formValue.title,
        description: formValue.description,
        item_amount: formValue.cost,
        quantity: formValue.quantity,
        seller_id: this.data.seller_id,
        seller_name: '',
        category_id: formValue.category_id,
      };

      this.dialogRef.close(item);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
