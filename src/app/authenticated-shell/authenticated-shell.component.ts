import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';

@Component({
    selector: 'app-authenticated-shell',
    imports: [RouterOutlet, HeaderComponent],
    templateUrl: './authenticated-shell.component.html',
    styleUrl: './authenticated-shell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthenticatedShellComponent {}
