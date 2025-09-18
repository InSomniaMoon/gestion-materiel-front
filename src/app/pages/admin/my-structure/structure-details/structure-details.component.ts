import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadFileComponent } from '@components/upload-file/upload-file.component';
import { Structure } from '@core/types/structure.type';
import { environment } from '@env/environment';
import { StructuresService } from '@services/structures.service';
import { ButtonDirective } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-structure-details',
  imports: [
    UploadFileComponent,
    FloatLabel,
    InputText,
    TextareaModule,
    ReactiveFormsModule,
    ButtonDirective,
  ],
  templateUrl: './structure-details.component.html',
  styleUrl: './structure-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex wrap' },
})
export class StructureDetailsComponent implements OnInit {
  private readonly structuresService = inject(StructuresService);
  private readonly imageBasePath = `${environment.api_url}/storage/`;
  private readonly fb = inject(FormBuilder);
  structure = model.required<Structure>();
  image = computed(() => this.imageBasePath + this.structure().image);

  form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', {
      validators: [Validators.required],
    }),
    description: this.fb.nonNullable.control(''),
  });
  setImagePath(path: string) {
    const current = this.structure();
    if (current) {
      this.structure.set({
        ...current,
        image: path,
      });
    }
  }

  ngOnInit(): void {
    this.form.patchValue({
      name: this.structure().name,
      description: this.structure().description,
    });
  }
  fileUploadHandler = (file: File) => {
    return this.structuresService
      .uploadStructureImage(file)
      .pipe(
        switchMap(response => {
          return this.structuresService.updateStructure(this.structure()!.id, {
            name: this.structure()!.name,
            description: this.structure()!.description,
            image: response.path,
          });
        })
      )
      .pipe(
        tap(updatedStructure => {
          this.structure.set(updatedStructure);
        }),
        map(updatedStructure => ({ path: updatedStructure.image! }))
      );
  };
}
