import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  SimpleModalComponent,
  SimpleModalData,
} from '@app/components/simple-modal/simple-modal.component';
import { ItemsService } from '@app/core/services/items.service';
import {
  BulkImportPreview,
  ImportCategoryResolution,
  UnknownImportCategory,
} from '@app/core/types/item-import.type';
import { buildDialogOptions } from '@app/core/utils/constants';
import { MessageService } from 'primeng/api';
import { Button, ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Fieldset } from 'primeng/fieldset';
import {
  FileUpload,
  FileUploadEvent,
  FileUploadHandlerEvent,
} from 'primeng/fileupload';
import { Message as PrimeMessage } from 'primeng/message';
import { ImportCategoriesResolutionComponent } from './import-categories-resolution.component';
import { ImportPreviewTableComponent } from './import-preview-table.component';

@Component({
  selector: 'app-import-items',
  imports: [
    Button,
    Card,
    Fieldset,
    PrimeMessage,
    ImportCategoriesResolutionComponent,
    ImportPreviewTableComponent,
    ButtonDirective,
    FileUpload,
  ],
  template: `
    <div class="import-items">
      <p-fieldset legend="Fichier CSV">
        <div class="d-flex align-items-center gap-1 panel-header">
          <a
            pButton
            severity="help"
            outlined
            href="/template-import-materiel.csv"
            download="template-import-materiel.csv">
            Télécharger un fichier modèle
          </a>
        </div>
        <p class="hint">
          Colonnes attendues : <code>categorie;nom;description;quantite </code>
          <br />
          La quantité est obligatoire pour les catégories non identifiées.
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
            [disabled]="previewLoading() || importLoading()" />
          @if (selectedFileName()) {
            <span class="file-name">{{ selectedFileName() }}</span>
          }
        </div>
      </p-fieldset>

      @if (preview()) {
        <section class="summary-grid">
          <p-card>
            <span class="summary-label">Lignes analysées </span>
            <strong>{{ preview()!.items_count }}</strong>
          </p-card>
          <p-card>
            <span class="summary-label">Catégories inconnues </span>
            <strong>{{ preview()!.unknown_categories.length }}</strong>
          </p-card>
          <p-card>
            <span class="summary-label">Lignes bloquantes </span>
            <strong>{{ invalidRows().length }}</strong>
          </p-card>
        </section>

        @if (invalidRows().length > 0) {
          <p-message severity="warn" class="w-full"
            >Corrections requises
          </p-message>
          <p class="hint warning-hint">
            Certaines lignes visent une catégorie non identifiée sans quantité.
            Complète le CSV puis relance l'analyse.
          </p>
        }

        @if (preview()!.unknown_categories.length > 0) {
          <app-import-categories-resolution
            [unknownCategories]="preview()!.unknown_categories"
            [existingCategories]="preview()!.existing_categories"
            [rows]="preview()!.rows"
            [resolutions]="resolutions()"
            (resolutionsChange)="resolutions.set($event)" />
        }

        <app-import-preview-table [rows]="preview()!.rows" />
      }
    </div>
    <div class="modal-footer">
      <div class="footer-actions">
        <p-button
          text
          severity="secondary"
          label="Fermer"
          [disabled]="importLoading()"
          (onClick)="!importLoading() && close()" />
        <p-button
          label="Importer"
          icon="pi pi-upload"
          [disabled]="!canImport()"
          [loading]="importLoading()"
          (onClick)="confirmImport()" />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .import-items {
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

      .warning-hint {
        margin-top: -0.5rem;
      }

      .actions,
      .footer-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .actions {
        margin-top: 0.75rem;
      }

      .file-name {
        color: var(--p-text-muted-color);
      }

      .summary-grid {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }

      .summary-grid p-card {
        display: block;
      }

      .summary-label {
        color: var(--p-text-muted-color);
        font-size: 0.875rem;
      }

      @media (max-width: 768px) {
        .panel-header,
        .footer-actions {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportItemsComponent {
  private readonly itemsService = inject(ItemsService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);
  readonly ref = inject(DynamicDialogRef);

  readonly selectedFile = signal<File | null>(null);
  readonly preview = signal<BulkImportPreview | null>(null);
  readonly previewLoading = signal(false);
  readonly importLoading = signal(false);
  readonly resolutions = signal<Record<string, ImportCategoryResolution>>({});

  readonly selectedFileName = computed(() => this.selectedFile()?.name ?? '');
  readonly invalidRows = computed(
    () => this.preview()?.rows.filter(row => row.status === 'invalid') ?? []
  );
  readonly canImport = computed(() => {
    const currentPreview = this.preview();
    if (
      !currentPreview ||
      !this.selectedFile() ||
      this.previewLoading() ||
      this.importLoading()
    ) {
      return false;
    }

    if (this.invalidRows().length > 0) {
      return false;
    }

    return currentPreview.unknown_categories.every(category =>
      this.isResolutionComplete(category)
    );
  });

  onFileSelected(event: FileUploadEvent | FileUploadHandlerEvent) {
    const file = event.files?.at(0);
    console.log(event);

    if (!file) {
      return;
    }

    this.selectedFile.set(file);
    this.preview.set(null);
    this.resolutions.set({});
    this.previewFile();
  }

  previewFile() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.previewLoading.set(true);
    this.itemsService.previewImport(file).subscribe({
      next: preview => {
        this.preview.set(preview);
        this.resolutions.set(
          this.buildDefaultResolutions(preview.unknown_categories)
        );
      },
      error: () => {
        this.previewLoading.set(false);
        this.preview.set(null);
      },
      complete: () => this.previewLoading.set(false),
    });
  }

  close() {
    this.ref.close(false);
  }

  confirmImport() {
    if (!this.canImport()) {
      return;
    }

    this.dialogService
      .open(
        SimpleModalComponent,
        buildDialogOptions<SimpleModalData>({
          header: 'Importer le matériel',
          data: {
            message: "Confirmer l'import de ce fichier CSV ?",
            confirm: true,
            confirmText: 'Importer',
            cancelText: 'Annuler',
          },
        })
      )!
      .onClose.subscribe(confirmed => {
        if (confirmed) {
          this.importFile();
        }
      });
  }

  importFile() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.importLoading.set(true);
    this.itemsService.importItems(file, this.resolutions()).subscribe({
      next: result => {
        this.messageService.add({
          severity: 'success',
          summary: 'Import terminé',
          detail: `${result.imported_count} objet(s) importé(s).`,
        });
        this.ref.close(true);
      },
      error: () => {
        this.importLoading.set(false);
      },
      complete: () => this.importLoading.set(false),
    });
  }

  resolutionRequiresQuantity(category: UnknownImportCategory) {
    const resolution = this.resolutions()[category.name];

    if (!resolution) {
      return false;
    }

    if (resolution.action === 'create') {
      return !resolution.identified;
    }

    return !this.preview()!.existing_categories.find(
      existingCategory => existingCategory.id === resolution.category_id
    )?.identified;
  }

  categoryRowsMissingQuantity(categoryName: string) {
    return this.preview()!.rows.some(
      row =>
        row.category_name === categoryName &&
        (row.quantity === null || row.quantity < 1)
    );
  }

  private buildDefaultResolutions(categories: UnknownImportCategory[]) {
    return categories.reduce<Record<string, ImportCategoryResolution>>(
      (acc, category) => {
        acc[category.name] = {
          action: 'create',
          name: category.name,
          identified: true,
        };
        return acc;
      },
      {}
    );
  }

  private isResolutionComplete(category: UnknownImportCategory) {
    const resolution = this.resolutions()[category.name];
    if (!resolution) {
      return false;
    }

    if (resolution.action === 'create') {
      return (
        resolution.name.trim().length > 0 &&
        (!this.resolutionRequiresQuantity(category) ||
          !this.categoryRowsMissingQuantity(category.name))
      );
    }

    return (
      resolution.category_id !== null &&
      resolution.category_id !== undefined &&
      (!this.resolutionRequiresQuantity(category) ||
        !this.categoryRowsMissingQuantity(category.name))
    );
  }
}
