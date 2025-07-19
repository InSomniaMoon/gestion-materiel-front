import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { StepperModule } from 'primeng/stepper';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { Step4Component } from './step4/step4.component';

@Component({
  selector: 'app-create-event',
  imports: [
    StepperModule,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
  ],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventComponent {
  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    informations: this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      start_date: [null],
      end_date: [null],
    }),
    materials: this.fb.nonNullable.control([]),
    comment: [''],
  });

  get informationsFormGroup() {
    return this.form.get('informations') as FormGroup;
  }

  get materialsFormControl() {
    return this.form.get('materials') as FormControl;
  }
  get commentFormControl() {
    return this.form.get('comment') as FormControl;
  }

  submitForm() {
    console.log(this.form.value);
  }
}
