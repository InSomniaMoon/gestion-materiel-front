import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-mass-import',
  imports: [FileUpload],
  templateUrl: './mass-import.component.html',
  styleUrl: './mass-import.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MassImportComponent {
  structureId = input.required<number>();
  text = signal('idle');

  handleError(event: any) {
    const errorMessage =
      event?.error?.message ||
      event?.error ||
      "Erreur inconnue lors de l'upload";
    console.log(event);

    this.text.set(`error: ${errorMessage}`);
  }
  async handleUpload(event: File[]) {
    console.log(await event[0].text());
  }
}
