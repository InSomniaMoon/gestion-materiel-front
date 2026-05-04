import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { take } from 'rxjs';

@Component({
  selector: 'app-import-items',
  imports: [
    FormsModule,
    Button,
    InputTextModule,
    Select,
    TableModule,
    ToggleSwitch,
  ],
  template: `
    <div class="import-items">
      <section class="panel">
        <div class="d-flex align-items-center gap-1 panel-header">
          <h2>Fichier CSV</h2>
          <a
            class="btn btn-link template-link"
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
        <input
          type="file"
          accept=".csv,text/csv"
          (change)="onFileSelected($event)" />
        <div class="actions">
          <p-button
            label="Analyser le fichier"
            icon="pi pi-search"
            [disabled]="!selectedFile() || previewLoading()"
            [loading]="previewLoading()"
            (onClick)="previewFile()" />
          @if (selectedFileName()) {
            <span class="file-name">{{ selectedFileName() }}</span>
          }
        </div>
      </section>

      @if (preview()) {
        <section class="summary-grid">
          <article class="summary-card">
            <span class="summary-label">Lignes analysées</span>
            <strong>{{ preview()!.items_count }}</strong>
          </article>
          <article class="summary-card">
            <span class="summary-label">Catégories inconnues</span>
            <strong>{{ preview()!.unknown_categories.length }}</strong>
          </article>
          <article class="summary-card">
            <span class="summary-label">Lignes bloquantes</span>
            <strong>{{ invalidRows().length }}</strong>
          </article>
        </section>

        @if (invalidRows().length > 0) {
          <section class="panel panel-warning">
            <h2>Corrections requises</h2>
            <p>
              Certaines lignes visent une catégorie non identifiée sans
              quantité. Complète le CSV puis relance l'analyse.
            </p>
          </section>
        }

        @if (preview()!.unknown_categories.length > 0) {
          <section class="panel">
            <div class="panel-header">
              <h2>Résolution des catégories inconnues</h2>
              <p>
                Chaque catégorie inconnue sera appliquée à toutes ses
                occurrences.
              </p>
            </div>
            <div class="unknown-list">
              @for (
                unknownCategory of preview()!.unknown_categories;
                track unknownCategory.name
              ) {
                <article class="unknown-card">
                  <div class="unknown-head">
                    <div>
                      <strong>{{ unknownCategory.name }}</strong>
                      <span
                        >{{ unknownCategory.occurrences }} occurrence(s)</span
                      >
                    </div>
                    <p-select
                      [ngModel]="resolutionMode(unknownCategory.name)"
                      [options]="itemCategoriesSelect"
                      (ngModelChange)="
                        setResolutionMode(unknownCategory.name, $event)
                      " />
                  </div>

                  @if (resolutionMode(unknownCategory.name) === 'create') {
                    <div class="resolution-grid">
                      <label>
                        <span>Nom de la catégorie</span>
                        <input
                          pInputText
                          [ngModel]="createResolutionName(unknownCategory.name)"
                          (ngModelChange)="
                            setCreateResolutionName(
                              unknownCategory.name,
                              $event
                            )
                          " />
                      </label>
                      <label class="toggle-row">
                        <span>Catégorie identifiée</span>
                        <p-toggleswitch
                          [ngModel]="
                            createResolutionIdentified(unknownCategory.name)
                          "
                          (ngModelChange)="
                            setCreateResolutionIdentified(
                              unknownCategory.name,
                              $event
                            )
                          " />
                      </label>
                    </div>
                  } @else {
                    <label>
                      <span>Catégorie existante</span>
                      <p-select
                        [options]="preview()!.existing_categories"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Choisir une catégorie"
                        [ngModel]="
                          existingResolutionCategoryId(unknownCategory.name)
                        "
                        (ngModelChange)="
                          setExistingResolutionCategoryId(
                            unknownCategory.name,
                            $event
                          )
                        " />
                    </label>
                  }

                  @if (
                    resolutionRequiresQuantity(unknownCategory) &&
                    categoryRowsMissingQuantity(unknownCategory.name)
                  ) {
                    <p class="error-text">
                      Cette résolution nécessite une quantité sur toutes les
                      lignes de la catégorie.
                    </p>
                  }
                </article>
              }
            </div>
          </section>
        }

        <section class="panel">
          <div class="panel-header">
            <h2>Prévisualisation</h2>
            <p>
              Les catégories non identifiées utilisent la quantité du CSV comme
              stock.
            </p>
          </div>
          <p-table [value]="preview()!.rows" stripedRows>
            <ng-template #header>
              <tr>
                <th>Ligne</th>
                <th>Catégorie</th>
                <th>Objet</th>
                <th>Quantité</th>
                <th>Statut</th>
              </tr>
            </ng-template>
            <ng-template #body let-row>
              <tr>
                <td>{{ row.row }}</td>
                <td>{{ row.category_name }}</td>
                <td>{{ row.item_name }}</td>
                <td>{{ row.quantity ?? '-' }}</td>
                <td>
                  <span [class]="statusClass(row.status)">{{
                    statusLabel(row.status)
                  }}</span>
                  @if (row.errors.includes('quantity_required')) {
                    <div class="error-text">Quantité requise</div>
                  }
                </td>
              </tr>
            </ng-template>
          </p-table>
        </section>
      }
    </div>
    <p-footer>
      <div class="footer-actions">
        <p-button
          text
          severity="secondary"
          label="Fermer"
          (onClick)="close()" />
        <p-button
          label="Importer"
          icon="pi pi-upload"
          [disabled]="!canImport()"
          [loading]="importLoading()"
          (onClick)="confirmImport()" />
      </div>
    </p-footer>
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

      .panel {
        border: 1px solid var(--p-content-border-color);
        border-radius: 1rem;
        padding: 1rem;
        background: var(--p-content-background);
      }

      .panel-warning {
        border-color: var(--p-orange-300);
        background: color-mix(in srgb, var(--p-orange-100) 40%, white);
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: start;
        margin-bottom: 1rem;
      }

      .panel-header p,
      .hint {
        margin: 0;
        color: var(--p-text-muted-color);
      }

      .template-link {
        display: inline-flex;
        margin-top: 0.75rem;
        color: var(--p-primary-color);
        text-decoration: underline;
        text-underline-offset: 0.2rem;
      }

      .actions,
      .footer-actions,
      .unknown-head,
      .toggle-row {
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

      .summary-card {
        border-radius: 1rem;
        padding: 1rem;
        background: color-mix(in srgb, var(--p-primary-color) 7%, white);
        display: grid;
        gap: 0.25rem;
      }

      .summary-label {
        color: var(--p-text-muted-color);
        font-size: 0.875rem;
      }

      .unknown-list {
        display: grid;
        gap: 0.75rem;
      }

      .unknown-card {
        border: 1px solid var(--p-content-border-color);
        border-radius: 0.875rem;
        padding: 1rem;
        display: grid;
        gap: 0.75rem;
      }

      .unknown-head {
        justify-content: space-between;
      }

      .unknown-head span {
        display: block;
        color: var(--p-text-muted-color);
        font-size: 0.875rem;
      }

      .resolution-grid {
        display: grid;
        gap: 0.75rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      label {
        display: grid;
        gap: 0.5rem;
      }

      .status-matched {
        color: var(--p-green-600);
      }

      .status-unknown {
        color: var(--p-orange-600);
      }

      .status-invalid {
        color: var(--p-red-600);
      }

      .error-text {
        color: var(--p-red-600);
        font-size: 0.875rem;
      }

      @media (max-width: 768px) {
        .panel-header,
        .unknown-head,
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

  readonly itemCategoriesSelect = [
    { label: 'Créer une catégorie', value: 'create' },
    { label: 'Associer à une catégorie existante', value: 'existing' },
  ];

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;

    this.selectedFile.set(file);
    this.preview.set(null);
    this.resolutions.set({});
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

    this.importLoading.set(true);
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
      .onClose.pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.importFile();
        } else {
          this.importLoading.set(false);
        }
      });
  }

  importFile() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    // importLoading is already true (set in confirmImport)
    this.itemsService.importItems(file, this.resolutions()).subscribe({
      next: result => {
        this.messageService.add({
          severity: 'success',
          summary: 'Import terminé',
          detail: `${result.imported_count} objet(s) importé(s).`,
        });
        this.ref.close(true);
      },
      complete: () => this.importLoading.set(false),
    });
  }

  resolutionMode(categoryName: string) {
    return this.resolutions()[categoryName]?.action ?? 'create';
  }

  createResolutionName(categoryName: string) {
    const resolution = this.resolutions()[categoryName];
    return resolution?.action === 'create' ? resolution.name : categoryName;
  }

  createResolutionIdentified(categoryName: string) {
    const resolution = this.resolutions()[categoryName];
    return resolution?.action === 'create' ? resolution.identified : true;
  }

  existingResolutionCategoryId(categoryName: string) {
    const resolution = this.resolutions()[categoryName];
    return resolution?.action === 'existing' ? resolution.category_id : null;
  }

  setResolutionMode(categoryName: string, mode: 'create' | 'existing') {
    this.resolutions.update(current => ({
      ...current,
      [categoryName]:
        mode === 'create'
          ? {
              action: 'create',
              name: this.createResolutionName(categoryName),
              identified: this.createResolutionIdentified(categoryName),
            }
          : {
              action: 'existing',
              category_id: this.findMatchingCategoryId(categoryName),
            },
    }));
  }

  setCreateResolutionName(categoryName: string, name: string) {
    this.resolutions.update(current => ({
      ...current,
      [categoryName]: {
        action: 'create',
        name,
        identified: this.createResolutionIdentified(categoryName),
      },
    }));
  }

  setCreateResolutionIdentified(categoryName: string, identified: boolean) {
    this.resolutions.update(current => ({
      ...current,
      [categoryName]: {
        action: 'create',
        name: this.createResolutionName(categoryName),
        identified,
      },
    }));
  }

  setExistingResolutionCategoryId(
    categoryName: string,
    categoryId: number | null
  ) {
    this.resolutions.update(current => ({
      ...current,
      [categoryName]: {
        action: 'existing',
        category_id: categoryId,
      },
    }));
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

  statusClass(status: 'matched' | 'unknown' | 'invalid') {
    return `status-${status}`;
  }

  statusLabel(status: 'matched' | 'unknown' | 'invalid') {
    if (status === 'matched') {
      return 'Prêt';
    }
    if (status === 'invalid') {
      return 'Bloquant';
    }

    return 'À résoudre';
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

  private findMatchingCategoryId(categoryName: string) {
    return (
      this.preview()?.existing_categories.find(
        category => category.name.toLowerCase() === categoryName.toLowerCase()
      )?.id ?? null
    );
  }
}
