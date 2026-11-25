import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonInput, IonButton, ToastController,
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonInput, IonButton, FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastController);

  uid = '';
  prenom = '';
  nom = '';
  age: number | null = null;
  email = '';
  role = '';
  photo = '';
  loading = true;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (!user) return;

    this.uid = user.uid;
    const snap = await getDoc(doc(db, 'users', this.uid));
    if (snap.exists()) {
      const d = snap.data();
      this.prenom = d['prenom'] ?? '';
      this.nom = d['nom'] ?? '';
      this.age = d['age'] ?? null;
      this.email = d['email'] ?? user.email ?? '';
      this.role = d['role'] ?? 'user';
      this.photo = d['photo'] ?? '';
    }
    this.loading = false;
  }

  async save() {
    if (!this.prenom || !this.nom || !this.age) {
      return this.show('Remplis tous les champs', 'warning');
    }
    try {
      await updateDoc(doc(db, 'users', this.uid), {
        prenom: this.prenom,
        nom: this.nom,
        age: this.age,
      });
      this.show('Profil mis à jour', 'success');
    } catch (e) {
      console.error(e);
      this.show('Erreur lors de la sauvegarde', 'danger');
    }
  }

  async changePhoto() {
    let image;
    try {
      image = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Photo de profil',
        promptLabelPhoto: 'Galerie',
        promptLabelPicture: 'Caméra',
        promptLabelCancel: 'Annuler',
      });
    } catch {
      return; // l'utilisateur a annulé
    }

    if (!image.dataUrl) return;

    try {
      const small = await this.resize(image.dataUrl, 300);
      await updateDoc(doc(db, 'users', this.uid), { photo: small });
      this.photo = small;
      this.show('Photo mise à jour', 'success');
    } catch (e) {
      console.error(e);
      this.show('Erreur lors de l\'envoi de la photo', 'danger');
    }
  }

  private resize(dataUrl: string, max: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  private async show(message: string, color: string) {
    const t = await this.toast.create({ message, duration: 2000, color });
    t.present();
  }
}