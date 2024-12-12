import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { SettingsComponent } from './settings/settings.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ListingsComponent } from './listings/listings.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'items', component: ItemListComponent },
    { path: 'items/:item_id', component: ItemDetailsComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'transaction', component: TransactionsComponent },
    { path: 'listings', component: ListingsComponent }
];
