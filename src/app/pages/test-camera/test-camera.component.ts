import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-test-camera',
  imports: [ZXingScannerModule],
  templateUrl: './test-camera.component.html',
  styleUrls: ['./test-camera.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCameraComponent {
  alert(result: string | undefined) {
    if (result) {
      alert(result);
    }
  }
  devices = signal<MediaDeviceInfo[]>([]);
  desiredDevice = signal<MediaDeviceInfo | undefined>(undefined);
  value = signal('');
  switchCamera() {
    const currentIndex = this.devices().findIndex(
      device => device.deviceId === this.desiredDevice()?.deviceId
    );
    const nextIndex = (currentIndex + 1) % this.devices().length;
    this.desiredDevice.set(this.devices()[nextIndex]);
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    console.log('Devices: ', devices);
    this.devices.set(devices);
  }
}
