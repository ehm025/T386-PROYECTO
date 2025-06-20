import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth'; // Cambia esto a la URL de tu API
  constructor(private http: HttpClient) {}

  login(userData: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, userData);
  }
}
