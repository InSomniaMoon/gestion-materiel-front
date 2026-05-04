import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ImportCategoryResolution,
  ImportPreviewRow,
  UnknownImportCategory,
} from '@app/core/types/item-import.type';
import { ItemCategory } from '@app/core/types/item.type';
import { Card } from 'primeng/card';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Message as PrimeMessage } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-import-categories-resolution',
  imports: [
    FormsModule,
    Card,
    Fieldset,
    InputText,
    PrimeMessage,
    Select,
    ToggleSwitch,
  ],
  template: `
    <p-fieldset legend="Résolution des catégories inconnues">
      <p class="hint">
        Chaque catégorie inconnue sera appliquée à toutes ses occurrences.
      </p>
      <div class="unknown-list">
        @for (
          unknownCategory of unknownCategories();
          track unknownCategory.name
        ) {
          <p-card>
            <div class="unknown-head">
              <div>
                <strong>{{ unknownCategory.name }}</strong>
                <span>{{ unknownCategory.occurrences }} occurrence(s)</span>
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
                      setCreateResolutionName(unknownCategory.name, $event)
                    " />
                </label>
                <label class="toggle-row">
                  <span>Catégorie identifiée</span>
                  <p-toggleswitch
                    [ngModel]="createResolutionIdentified(unknownCategory.name)"
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
                  [options]="existingCategories()"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Choisir une catégorie"
                  [ngModel]="existingResolutionCategoryId(unknownCategory.name)"
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
              <p-message severity="warn" class="w-full">
                Cette résolution nécessite une quantité sur toutes les lignes de
                la catégorie.
              </p-message>
            }
          </p-card>
        }
      </div>
    </p-fieldset>
  `,
  styles: [
    `
      .hint {
        margin: 0;
        margin-bottom: 1rem;
        color: var(--p-text-muted-color);
      }

      .unknown-list {
        display: grid;
        gap: 0.75rem;
      }

      p-card {
        display: block;
      }

      .unknown-head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
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

      .toggle-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      @media (max-width: 768px) {
        .unknown-head {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportCategoriesResolutionComponent {
  readonly unknownCategories = input.required<UnknownImportCategory[]>();
  readonly existingCategories =
    input.required<Pick<ItemCategory, 'id' | 'name' | 'identified'>[]>();
  readonly rows = input.required<ImportPreviewRow[]>();
  readonly resolutions =
    input.required<Record<string, ImportCategoryResolution>>();

  readonly resolutionsChange =
    output<Record<string, ImportCategoryResolution>>();

  readonly itemCategoriesSelect = [
    { label: 'Créer une catégorie', value: 'create' },
    { label: 'Associer à une catégorie existante', value: 'existing' },
  ];

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
    const next = {
      ...this.resolutions(),
      [categoryName]:
        mode === 'create'
          ? {
              action: 'create' as const,
              name: this.createResolutionName(categoryName),
              identified: this.createResolutionIdentified(categoryName),
            }
          : {
              action: 'existing' as const,
              category_id: this.findMatchingCategoryId(categoryName),
            },
    };

    this.resolutionsChange.emit(next);
  }

  setCreateResolutionName(categoryName: string, name: string) {
    this.resolutionsChange.emit({
      ...this.resolutions(),
      [categoryName]: {
        action: 'create',
        name,
        identified: this.createResolutionIdentified(categoryName),
      },
    });
  }

  setCreateResolutionIdentified(categoryName: string, identified: boolean) {
    this.resolutionsChange.emit({
      ...this.resolutions(),
      [categoryName]: {
        action: 'create',
        name: this.createResolutionName(categoryName),
        identified,
      },
    });
  }

  setExistingResolutionCategoryId(
    categoryName: string,
    categoryId: number | null
  ) {
    this.resolutionsChange.emit({
      ...this.resolutions(),
      [categoryName]: {
        action: 'existing',
        category_id: categoryId,
      },
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

    return !this.existingCategories().find(
      existingCategory => existingCategory.id === resolution.category_id
    )?.identified;
  }

  categoryRowsMissingQuantity(categoryName: string) {
    return this.rows().some(
      row =>
        row.category_name === categoryName &&
        (row.quantity === null || row.quantity < 1)
    );
  }

  private findMatchingCategoryId(categoryName: string) {
    return (
      this.existingCategories().find(
        category => category.name.toLowerCase() === categoryName.toLowerCase()
      )?.id ?? null
    );
  }
}
