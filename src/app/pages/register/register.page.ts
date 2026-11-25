import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonInput, IonButton, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, FormsModule, RouterLink],
})
export class RegisterPage {
  nom = '';
  prenom = '';
  age: number | null = null;
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastController,
  ) {}

  async register() {
    if (!this.nom || !this.prenom || !this.age || !this.email || this.password.length < 6) {
      return this.show('Remplis tous les champs (mot de passe : 6 caractères minimum)', 'warning');
    }
    try {
      await this.auth.register(this.email, this.password, this.nom, this.prenom, this.age);
      this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.show(e.code === 'auth/email-already-in-use' ? 'Cet email est déjà utilisé' : 'Erreur lors de l\'inscription', 'danger');
    }
  }

  private async show(message: string, color: string) {
    const t = await this.toast.create({ message, duration: 2500, color });
    t.present();
  }
}