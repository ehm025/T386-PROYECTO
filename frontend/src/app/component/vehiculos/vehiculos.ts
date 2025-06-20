import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersServices } from '../../services/services/users';

@Component({
  selector: 'app-vehiculos',
  imports: [CommonModule],
  templateUrl: './vehiculos.html',
  styleUrls: ['./vehiculos.css']
})
export class VehiculosComponent implements OnInit {
  vehiculos: any [] = [];
  errorMessage: string = '';
  constructor(private usersService: UsersServices) {}
  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos() {
    this.errorMessage = '';
    this.usersService.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data.data;
      },
      error: (error) => {
        console.error('Error al obtener vehículos:', error);

        if (error.status === 401) {
          this.errorMessage = error.error?.message || 'Credenciales incorrectas.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado. Intenta de nuevo.';
        }
      }
    });
  }

}
