import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { Observable } from 'rxjs';

type HandlerFunc = (file: File) => Observable<{ path: string }>;

@Component({
  selector: 'app-upload-file',
  imports: [FileUpload],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadFileComponent {
  private readonly messageService = inject(MessageService);

  fileUploaded = output<string>();

  file = signal<File | null>(null);
  fileUrl = linkedSignal(() => {
    const file = this.file();
    return file ? URL.createObjectURL(file) : '';
  });

  handler = input.required<HandlerFunc>();

  fileUploader = viewChild.required('fileUploader', { read: FileUpload });

  maxFileSize = input(5 * 1024 * 1024); // 5 MB
  accept = input('image/*');
  progress = signal(0);

  invalidFileSizeMessageSummary = '{0} : Taille de fichier invalide,';
  invalidFileSizeMessageDetail =
    'la taille du fichier ne doit pas dépasser {0}.';
  invalidFileTypeMessageSummary = '{0} : Type de fichier invalide,';
  invalidFileTypeMessageDetail = 'le type de fichier doit être une image.';
  invalidFileLimitMessageDetail =
    'le nombre de fichiers ne doit pas dépasser {0}.';
  invalidFileLimitMessageSummary = 'Nombre de fichiers max atteints,';

  protected async handleUpload(event: FileUploadHandlerEvent) {
    const file = event.files[0];
    if (!file) {
      this.messageService.add({
        severity: 'error',
        summary: 'Aucun fichier sélectionné',
        detail: 'Veuillez sélectionner un fichier à télécharger.',
      });
      return;
    }
    if (file.size > this.maxFileSize()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Taille de fichier invalide',
        detail: `La taille du fichier ne doit pas dépasser ${
          this.maxFileSize() / 1024 / 1024
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

  private uploadFile(file: File) {
    this.handler()(file).subscribe({
      next: (res) => {
        this.file.set(file);
        this.fileUrl.set(URL.createObjectURL(file));
        this.progress.set(100); // Simulate progress completion
        this.fileUploaded.emit(res.path);
        this.messageService.add({
          severity: 'info',
          summary: 'Fichier uploadé',
          detail: 'Le fichier a été uploadé avec succès.',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: "Erreur d'upload",
          detail: err.message || "Une erreur est survenue lors de l'upload.",
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
