import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  linkedSignal,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadHandlerEvent,
} from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BackofficeService } from '../../services/backoffice.service';
import { tap } from 'rxjs';
@Component({
  selector: 'app-backoffice-create-group',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    Textarea,
    FileUpload,
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
      <!-- (onSelect)="onUpload($event)"
      (onUpload)="onSend($event)" -->
      <p-fileupload
        name="image"
        #fileUploader
        [multiple]="false"
        [customUpload]="true"
        (uploadHandler)="handleUpload($event)"
        [auto]="true"
        accept="image/*"
        [maxFileSize]="maxFileSize"
        [invalidFileSizeMessageSummary]="invalidFileSizeMessageSummary"
        [invalidFileSizeMessageDetail]="invalidFileSizeMessageDetail"
        [invalidFileTypeMessageSummary]="invalidFileTypeMessageSummary"
        [invalidFileTypeMessageDetail]="invalidFileTypeMessageDetail"
        [invalidFileLimitMessageSummary]="invalidFileLimitMessageSummary"
        [invalidFileLimitMessageDetail]="invalidFileLimitMessageDetail"
        [showUploadButton]="false"
        [showCancelButton]="false"
        chooseLabel="Choisir une image"
        mode="advanced"
      >
        <ng-template #empty>
          <div>Glisser et deposer le fichier ici pour l'uploader</div>
        </ng-template>
      </p-fileupload>
    </form>
    <p-footer>
      <p-button label="Fermer" severity="secondary" (onClick)="ref.close()" />
      <p-button
        label="Créer"
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

  private readonly data = this.dialogRef.getInstance(this.ref).data;

  fileUploader = viewChild.required('fileUploader', { read: FileUpload });
  baseUrl = environment.api_url;

  maxFileSize = 1024 * 1024 * 2; // 2MB
  invalidFileSizeMessageSummary = '{0} : Taille de fichier invalide,';
  invalidFileSizeMessageDetail =
    'la taille du fichier ne doit pas dépasser {0}.';
  invalidFileTypeMessageSummary = '{0} : Type de fichier invalide,';
  invalidFileTypeMessageDetail = 'le type de fichier doit être une image.';
  invalidFileLimitMessageDetail =
    'le nombre de fichiers ne doit pas dépasser {0}.';
  invalidFileLimitMessageSummary = 'Nombre de fichiers max atteints,';
  saveClicked = signal(false);

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

    this.saveOrUpdateGroup().subscribe({
      next: () => {
        this.ref.close(true);
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

  private saveOrUpdateGroup() {
    return this.data
      ? this.backofficeService
          .updateGroup(this.data.group.id, this.form.getRawValue())
          .pipe(
            tap(() => {
              this.toast.add({
                severity: 'success',
                summary: 'Groupe mis à jour',
                detail: 'Le groupe a été mis à jour avec succès',
              });
            })
          )
      : this.backofficeService.createGroup(this.form.getRawValue()).pipe(
          tap(() => {
            this.toast.add({
              severity: 'success',
              summary: 'Groupe créé',
              detail: 'Le groupe a été créé avec succès',
            });
          })
        );
  }

  file = signal<File>(null!);
  fileUrl = linkedSignal<string>(() =>
    this.file() ? URL.createObjectURL(this.file()) : ''
  );

  totalSize = signal(0);

  totalSizePercent = signal(0);

  private messageService = inject(MessageService);

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

  async handleUpload(event: FileUploadHandlerEvent) {
    const file = event.files[0];
    if (!file) {
      this.messageService.add({
        severity: 'error',
        summary: 'Aucun fichier sélectionné',
        detail: 'Veuillez sélectionner un fichier à télécharger.',
      });
      return;
    }
    if (file.size > this.maxFileSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Taille de fichier invalide',
        detail: `La taille du fichier ne doit pas dépasser ${
          this.maxFileSize / 1024 / 1024
        } Mo.`,
      });
      return;
    }
    const { height, width } = await this.getHeightAndWidthFromDataUrl(
      URL.createObjectURL(file)
    );
    if (height !== width) {
      this.messageService.add({
        severity: 'error',
        summary: 'Image non carrée',
        detail: "L'image doit être carrée (hauteur = largeur).",
      });

      this.fileUploader()!.clear();
      return;
    }
    this.fileUploader().progress = 50; // Simulate progress
    this.uploadFile(file);
  }

  async onUpload(event: FileSelectEvent) {
    console.log('Files uploaded:', event);
    for (let file of event.files) {
      if (file.size > this.maxFileSize) {
        continue;
      }
    }
  }

  private uploadFile(file: File) {
    this.backofficeService.uploadGroupImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({
          image: res.path,
        });
        this.file.set(file);
        this.fileUploader().progress = 100; // Simulate progress completion
        this.fileUploader().clear(); // Clear the file input
        this.messageService.add({
          severity: 'info',
          summary: 'Image uploadée',
          detail: '',
        });
      },
    });
  }

  private getHeightAndWidthFromDataUrl(
    dataURL: string
  ): Promise<{ height: number; width: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          height: img.height,
          width: img.width,
        });
      };
      img.src = dataURL;
    });
  }
}
