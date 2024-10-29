import { Routes } from '@angular/router';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';

export const SUBSCRIPTIONS_ROUTES: Routes = [
  {
    path: ':subscriptionId',
    component: SubscriptionDetailsComponent,
  },
];
