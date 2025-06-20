import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '../../services/services/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

    constructor(private authService: Auth,
    private router: Router
  ) {}

  login() {
    const credentials = {
      email: this.email,
      password: this.password
    };
    this.errorMessage = '';
    this.authService.login(credentials).subscribe({
      
      next: (response) => {
        console.log('Login exitoso:', response);
        localStorage.setItem('token', response.data.token);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error de login:', error);
        
        // Detecta si viene un mensaje personalizado del backend
        if (error.status === 401) {
          this.errorMessage = error.error?.message || 'Credenciales incorrectas.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
        }
      }

    });
  }
}


