import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadFileComponent } from '@app/components/upload-file/upload-file.component';
import { environment } from '@env/environment';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BackofficeService } from '../../services/backoffice.service';
@Component({
  selector: 'app-backoffice-create-group',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Textarea,
    UploadFileComponent,
  ],
  template: ` <form [formGroup]="form">
      <p-float-label>
        <input pInputText formControlName="name" />
        <label>Nom du groupe</label>
      </p-float-label>
      <p-float-label>
        <textarea
          pTextarea
          cols="auto"
          rows="6"
          formControlName="description"
        ></textarea>
        <label>Description (optionnel)</label>
      </p-float-label>
      @if (file()) {
      <img
        [src]="fileUrl()"
        alt="Image"
        class="group-image"
        width="128px"
        height="128px"
      />
      <p>Fichier utilisé : {{ file().name }}</p>
      }
      <app-upload-file
        [maxFileSize]="maxFileSize"
        [handler]="uploadGroupImage"
        (fileUploaded)="setFilePath($event)"
      />
    </form>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button
        [label]="data ? 'Mettre à jour' : 'Créer'"
        [disabled]="!form.valid || saveClicked()"
        (onClick)="save()"
        [loading]="saveClicked()"
      />
    </p-footer>`,
  styleUrl: './backoffice-create-update-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUpdateGroupComponent implements OnInit {
  readonly ref = inject(DynamicDialogRef);
  readonly dialogRef = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly backofficeService = inject(BackofficeService);
  private readonly toast = inject(MessageService);

  protected readonly data = this.dialogRef.getInstance(this.ref).data;

  protected readonly uploadGroupImage = this.backofficeService.uploadGroupImage;

  baseUrl = environment.api_url + '/storage/';

  maxFileSize = 1024 * 1024 * 2; // 2MB

  saveClicked = signal(false);

  progress = signal(0);

  form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', {
      validators: [Validators.required],
    }),
    description: this.fb.control(''),
    image: this.fb.control<string>('', {
      validators: [Validators.required],
    }),
  });

  save() {
    this.saveClicked.set(true);

    (this.data
      ? this.backofficeService.updateGroup(
          this.data.group.id,
          this.form.getRawValue()
        )
      : this.backofficeService.createGroup(this.form.getRawValue())
    ).subscribe({
      next: () => {
        this.ref.close(true);
        this.toast.add({
          severity: 'success',
          summary: `Groupe ${this.data ? 'mis à jour' : 'créé'}`,
          detail: `Le groupe a été ${
            this.data ? 'mis à jour' : 'créé'
          } avec succès`,
        });
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Une erreur est survenue lors de la ${
            this.data ? 'mise à jour' : 'création'
          } du groupe`,
        });
        this.saveClicked.set(false);
      },
      complete: () => {
        this.saveClicked.set(false);
      },
    });
  }

  file = signal<File>(null!);
  fileUrl = linkedSignal<string>(() =>
    this.file() ? URL.createObjectURL(this.file()) : ''
  );

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.group.name,
        description: this.data.group.description,
      });
      this.file.set(this.data.group.image);
      this.fileUrl.set(
        `${this.baseUrl}/${this.data.group.image ?? 'default-group.png'}`
      );
    }
  }

  setFilePath(filePath: string) {
    this.form.patchValue({ image: filePath });
  }
}
