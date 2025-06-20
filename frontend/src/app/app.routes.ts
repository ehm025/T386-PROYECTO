import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Home } from './component/home/home';
import { Users } from './component/users/users';
import { VehiculosComponent } from './component/vehiculos/vehiculos';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'home', component: Home },
    { path: 'users', component: Users },
    { path: 'vehiculos', component: VehiculosComponent }
];
