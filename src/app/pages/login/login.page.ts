import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonInput, IonButton, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, FormsModule, RouterLink],
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastController,
  ) {}

  async login() {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigateByUrl('/home');
    } catch (e: any) {
  const message = e?.message === 'account-disabled'
    ? 'Ce compte a été désactivé'
    : 'Email ou mot de passe incorrect';
  const t = await this.toast.create({ message, duration: 2500, color: 'danger' });
  t.present();
}
  }
}