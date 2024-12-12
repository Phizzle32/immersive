import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
  title: string;
  description: string;
  actionButtonText: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data?.title || 'Confirm?';
    this.description = data?.description || 'Are you sure?';
    this.actionButtonText = data?.actionButtonText || 'Yes';
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
