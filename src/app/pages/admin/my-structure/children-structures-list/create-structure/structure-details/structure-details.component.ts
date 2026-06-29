import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { UploadFileComponent } from '@components/upload-file/upload-file.component';
import { environment } from '@env/environment';
import { StructuresService } from '@services/structures.service';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { tap } from 'rxjs';

export interface StructureDetailsModel {
  name: string;
  image: string;
}

@Component({
  selector: 'app-structure-details',
  imports: [
    UploadFileComponent,
    FloatLabel,
    InputText,
    TextareaModule,
    FormField,
  ],
  templateUrl: './structure-details.component.html',
  styleUrl: './structure-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex wrap' },
})
export class StructureDetailsComponent {
  private readonly structuresService = inject(StructuresService);
  private readonly imageBasePath = `${environment.api_url}`;

  field = input.required<FieldTree<StructureDetailsModel>>();

  image = computed(() => {
    const path = this.field().image().value();
    return path ? this.imageBasePath + path : null;
  });

  setImagePath(path: string) {
    console.log(path);

    this.field().image().value.set(path);
  }

  fileUploadHandler = (file: File) => {
    return this.structuresService
      .uploadStructureImage(file)
      .pipe(tap(s => console.log(s)));
  };
}
