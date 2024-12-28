import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeatureClickService {
  private readonly http = inject(HttpClient);
  private api_url = environment.api_url;
  toast = inject(MessageService);

  clickFeature(id: number) {
    return this.http.post(`${this.api_url}/features/${id}/click`, {}).pipe(
      tap((value) => {
        console.log(value);

        this.toast.add({
          severity: 'info',
          summary: 'En cours de développement',
          detail:
            'Cette feature est en cours de développement, elle arrivera bientôt !',
          text: 'OK',
        });
      }),
    );
  }
}
