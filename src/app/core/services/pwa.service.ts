import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private readonly _showButton = signal(false);
  readonly showButton = this._showButton.asReadonly();

  private readonly promptEvent = signal<any>(null);

  private readonly _appInstalled = signal(true);
  readonly appInstalled = this._appInstalled.asReadonly();

  closeToast() {
    this._showButton.set(false);
    localStorage.setItem('showInstall', 'false');
  }

  constructor() {
    console.log((localStorage.getItem('showInstall') ?? 'true') === 'true');
    this._showButton.set(
      (localStorage.getItem('showInstall') ?? 'true') === 'true'
    );

    globalThis.addEventListener('beforeinstallprompt', (event: any) => {
      console.log('beforeinstallprompt event fired');
      this._appInstalled.set(false);
      event.preventDefault();
      this.promptEvent.set(event);
    });
  }

  public installPwa() {
    this.closeToast();
    this.promptEvent().prompt();
    this.promptEvent().userChoice.then((choiceResult: any) => {
      this.promptEvent.set(null);
      console.log(choiceResult);

      if (choiceResult.outcome === 'accepted') {
        this._appInstalled.set(true);
      }
    });
  }
}
