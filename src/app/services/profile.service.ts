import { Injectable } from "@angular/core"
import { type Observable, of, tap } from "rxjs"
import { ResetPassword, User } from "../models/user.model"
import { Role } from "../models/user.model"
import { ApiService } from "./api.service"
import { AuthService } from "./auth.service"

@Injectable({
  providedIn: "root",
})
export class ProfileService {

  constructor(private apiService: ApiService) { }

  // Profile
  user : User = {
    nickname: "usuario_ejemplo",
    email: "ejem@gmail.com",
    role: {
      name: "ROLE_STUDENT"
    },
    notification: true
  }

  getCurrentUser(): Observable<User> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.get<User>('user/user-info', {}, access_token).pipe(
      tap((response) => {
        //console.log('Subscriptions response', response);
      })
    );
  }

  updateNickname(nickname: string): Observable<User> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.put<User>('user/nickname', { nickname },{}, access_token).pipe(
      tap((response) => {
        //console.log('Subscriptions response', response);
      })
    );
  }


  updateNotificationSettings(enabled: boolean): Observable<boolean> {
    const access_token: string = localStorage.getItem('access_token') || '';

    if (enabled) {
      return this.apiService.put<boolean>('user/deactivate-notifications', {}, {}, access_token).pipe(
        tap((response) => {
          //console.log('Subscriptions response', response);
        })
      );
    }else{
      return this.apiService.put<boolean>('user/activate-notifications', {}, {}, access_token).pipe(
        tap((response) => {
          //console.log('Subscriptions response', response);
        })
      );
    }
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.put<boolean>('user/password', { currentPassword, newPassword }, {}, access_token).pipe(
      tap((response) => {
        //console.log('Subscriptions response', response);
      })
    );
  }


  changeRole(newRole: Role): Observable<User> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.put<User>('user/role', {}, {}, access_token).pipe(
      tap((response) => {
        //console.log('Subscriptions response', response);
      })
    );

  }


  deactivateAccount(currentPassword: string): Observable<User> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.put<User>('user/deactivate', {currentPassword},{}, access_token).pipe(
      tap((response) => {
        //console.log('Subscriptions response', response);
      })
    );
  }

  sendResetPasswordEmail(email: string): Observable<void> {
    const access_token: string = localStorage.getItem('access_token') || '';

    return this.apiService.post<void>('user/reset-pass-mail', { email }, {}).pipe(
      tap((response) => {
        console.log('Reset password email sent', response);
      })
    );
  }

  resetPassword (newPassword: string, token: string): Observable<User> {
    // ResetPassword interface
    const reset_info: ResetPassword = {
      newPassword: newPassword,
      currentPassword: newPassword, // Adapting to a DTO in the backend. Actually is confirmPassword.
      token: token
    };

    return this.apiService.put<User>('user/reset-password', reset_info, {}).pipe(
      tap((response) => {
        console.log('Password reset successfully', response);
      })
    );
  }
}
