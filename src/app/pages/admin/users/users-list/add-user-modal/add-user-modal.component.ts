import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '@services/group.service';
import { UsersService } from '@services/users.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-add-user-modal',
  imports: [
    DialogModule,
    Button,
    FloatLabel,
    ReactiveFormsModule,
    InputText,
    Select,
  ],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly usersService = inject(UsersService);
  private readonly groupService = inject(GroupService);
  private readonly messageService = inject(MessageService);

  isUserChecked = signal(false);
  userExists = signal(false);

  roles = [
    { label: 'Chef', value: 'user' },
    { label: 'Responsable matériel', value: 'admin' },
  ];

  form = this.fb.nonNullable.group(
    {
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      phone: [''],
    },
    {
      validators: [
        form => (this.isUserChecked() ? null : { userNotChecked: true }),
      ],
    }
  );

  close() {
    this.dialogRef.close();
  }

  save() {
    // Logic to save the user
    if (this.userExists()) {
      this.groupService
        .addUserToGroup({
          email: this.form.value.email!,
          role: this.form.value.role!,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Utilisateur ajouté au groupe',
              detail: 'L’utilisateur a été ajouté avec succès.',
            });
            this.dialogRef.close(true);
          },
          error: err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Une erreur est survenue : ${err.message}`,
            });
          },
        });
    } else {
      this.usersService.createUserForGroup(this.form.getRawValue()).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Utilisateur créé',
            detail: 'L’utilisateur a été créé et ajouté avec succès.',
          });
          this.dialogRef.close(true);
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Une erreur est survenue : ${err.message}`,
          });
        },
      });
    }
  }

  checkUser() {
    this.usersService.checkUser(this.form.value.email!).subscribe(res => {
      this.isUserChecked.set(true);
      this.userExists.set(res.exists);
      if (res.exists && res.already_in_group) {
        this.messageService.add({
          severity: 'info',
          summary: "L'utilisateur est déjà dans le groupe.",
        });
        this.dialogRef.close();
      }
      if (!res.exists) {
        this.form.get('name')?.addValidators([Validators.required]);
        this.form.get('name')?.updateValueAndValidity();
        console.log(this.form.get('name')?.validator);
      }
    });
  }
}
