import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  ImportPreviewRow,
  ImportPreviewRowStatus,
} from '@app/core/types/item-import.type';
import { Fieldset } from 'primeng/fieldset';
import { Message as PrimeMessage } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-import-preview-table',
  imports: [Fieldset, PrimeMessage, TableModule, Tag],
  template: `
    <p-fieldset legend="Prévisualisation">
      <p class="hint">
        Les catégories non identifiées utilisent la quantité du CSV comme stock.
      </p>
      <p-table [value]="rows()" stripedRows>
        <ng-template #header>
          <tr>
            <th scope="col">Catégorie</th>
            <th scope="col">Objet</th>
            <th scope="col">Quantité</th>
            <th scope="col">Statut</th>
          </tr>
        </ng-template>
        <ng-template #body let-row>
          <tr>
            <td>{{ row.category_name }}</td>
            <td>{{ row.item_name }}</td>
            <td>{{ row.quantity ?? '-' }}</td>
            <td>
              <p-tag
                [value]="statusLabel(row.status)"
                [severity]="statusSeverity(row.status)" />
              @if (row.errors.includes('quantity_required')) {
                <p-message severity="error">Quantité requise</p-message>
              }
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-fieldset>
  `,
  styles: [
    `
      .hint {
        margin: 0;
        margin-bottom: 1rem;
        color: var(--p-text-muted-color);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPreviewTableComponent {
  readonly rows = input.required<ImportPreviewRow[]>();

  statusLabel(status: ImportPreviewRowStatus) {
    if (status === 'matched') {
      return 'Prêt';
    }
    if (status === 'invalid') {
      return 'Bloquant';
    }

    return 'À résoudre';
  }

  statusSeverity(status: ImportPreviewRowStatus) {
    if (status === 'matched') {
      return 'success';
    }
    if (status === 'invalid') {
      return 'danger';
    }

    return 'warn';
  }
}
