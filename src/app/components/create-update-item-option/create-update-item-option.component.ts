import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-create-update-item-option',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputSwitchModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './create-update-item-option.component.html',
  styleUrl: './create-update-item-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateItemOptionComponent implements OnInit {
  private ref = inject(DynamicDialogRef);
  private dialog$ = inject(DialogService);

  constructor() {}
  // primeng dialog

  ngOnInit(): void {
    if (this.dialog$.getInstance(this.ref).data) {
      const data = this.dialog$.getInstance(this.ref).data;
      this.form.setValue({
        name: data.name,
        usable: data.usable,
        description: data.description,
      });
    }
  }

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    usable: new FormControl(true, Validators.required),
    description: new FormControl(''),
  });

  closeDialog() {
    this.form.reset();
    this.ref.close();
  }

  save() {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    }
  }
}
