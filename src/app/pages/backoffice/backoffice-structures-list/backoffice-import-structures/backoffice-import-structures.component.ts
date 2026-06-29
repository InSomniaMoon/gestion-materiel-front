import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ImportStructuresResult } from '@app/core/types/structure-import.type';
import { Button, ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Fieldset } from 'primeng/fieldset';
import {
  FileUpload,
  FileUploadEvent,
  FileUploadHandlerEvent,
} from 'primeng/fileupload';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { BackofficeService } from '../../services/backoffice.service';

@Component({
  selector: 'app-backoffice-import-structures',
  imports: [Button, ButtonDirective, Fieldset, FileUpload, Message, Tag],
  template: `
    <div class="import-structures">
      <p-fieldset legend="Fichier CSV">
        <div class="d-flex align-items-center gap-1 panel-header">
          <a
            pButton
            severity="help"
            outlined
            href="/template-import-structures.csv"
            download="template-import-structures.csv">
            Télécharger un fichier modèle
          </a>
        </div>
        <p class="hint">
          Colonnes attendues :
          <code>nomStructure;codeStructure;parentCodeStructure;nomCustom</code>
          <br />
          nomCustom est facultatif. Les structures dont le code existe déjà ne
          sont pas modifiées.
        </p>
        <div class="actions">
          <p-fileUpload
            type="file"
            mode="basic"
            accept=".csv,text/csv"
            chooseLabel="Choisir un fichier"
            customUpload
            auto
            (uploadHandler)="onFileSelected($event)"
            [disabled]="importLoading()" />
          @if (selectedFileName()) {
            <span class="file-name">{{ selectedFileName() }}</span>
          }
        </div>
      </p-fieldset>

      @if (result()) {
        <section class="summary-grid">
          <p-tag
            severity="info"
            value="Lignes analysées : {{ result()!.totalRows }}" />
          <p-tag
            severity="success"
            value="Structures créées : {{ result()!.createdCount }}" />
          <p-tag
            severity="secondary"
            value="Déjà existantes : {{ result()!.skippedExistingCount }}" />
        </section>

        @if (result()!.errors.length > 0) {
          <p-message severity="warn" class="w-full">
            {{ result()!.errors.length }} ligne(s) ignorée(s)
          </p-message>
          <ul class="error-list">
            @for (error of result()!.errors; track error.row) {
              <li>
                Ligne {{ error.row }} ({{ error.codeStructure || '?' }}) :
                {{ error.message }}
              </li>
            }
          </ul>
        }
      }
    </div>
    <div class="modal-footer">
      <div class="footer-actions">
        <p-button
          text
          severity="secondary"
          label="Fermer"
          [disabled]="importLoading()"
          (onClick)="close()" />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .import-structures {
        display: grid;
        gap: 1rem;
      }

      .panel-header {
        display: flex;
        justify-content: end;
        gap: 1rem;
        align-items: start;
        margin-bottom: 0.75rem;
      }

      .hint {
        margin: 0;
        color: var(--p-text-muted-color);
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .file-name {
        color: var(--p-text-muted-color);
      }

      .summary-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .error-list {
        margin: 0;
        padding-left: 1.25rem;
        color: var(--p-text-muted-color);
      }

      .footer-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        justify-content: end;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackofficeImportStructuresComponent {
  private readonly backofficeService = inject(BackofficeService);
  readonly ref = inject(DynamicDialogRef);

  readonly selectedFile = signal<File | null>(null);
  readonly selectedFileName = signal('');
  readonly importLoading = signal(false);
  readonly result = signal<ImportStructuresResult | null>(null);
  private hasImported = false;

  onFileSelected(event: FileUploadEvent | FileUploadHandlerEvent) {
    const file = event.files?.at(0);

    if (!file) {
      return;
    }

    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);
    this.result.set(null);
    this.importFile();
  }

  importFile() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.importLoading.set(true);
    this.backofficeService.importStructures(file).subscribe({
      next: result => {
        this.result.set(result);
        this.hasImported = true;
      },
      error: () => {
        this.importLoading.set(false);
      },
      complete: () => this.importLoading.set(false),
    });
  }

  close() {
    this.ref.close(this.hasImported);
  }
}
