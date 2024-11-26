import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemDetailsComponent } from './item-details/item-details.component';

export const routes: Routes = [
    { path: '', redirectTo: '/items', pathMatch: 'full' },
    { path: 'items', component: ItemListComponent},
    { path: 'items/:item_id', component: ItemDetailsComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
];
