import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CalendarComponent } from './components/dashboard/sections/calendar/calendar.component';
import { SubscriptionsComponent } from './components/dashboard/sections/subscriptions/subscriptions.component';
import { EventsComponent } from './components/dashboard/sections/events/events.component';
import { ProfileComponent } from './components/dashboard/sections/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { ActivateComponent } from './components/activate/activate.component';
import { SyncComponent } from './components/dashboard/sections/sync/sync.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'statistics', component: StatisticsComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'calendar', component: CalendarComponent },
      { path: 'sync', component: SyncComponent },
      { path: 'subscriptions', component: SubscriptionsComponent },
      { path: 'events', component: EventsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'calendar', pathMatch: 'full' }, // By default
    ],
    canActivate: [authGuard], // Protect the dashboard route
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
