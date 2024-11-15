import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ItemListComponent } from './item-list/item-list.component';

export const routes: Routes = [
    { path: '', component: ItemListComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
];
