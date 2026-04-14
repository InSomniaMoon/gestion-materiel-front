import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LOAD_WASM, NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();
@Component({
  selector: 'app-test-camera',
  imports: [NgxScannerQrcodeComponent, JsonPipe, AsyncPipe],
  templateUrl: './test-camera.component.html',
  styleUrls: ['./test-camera.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCameraComponent {}
