import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/angular';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton],
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  isAdmin = false;

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    this.isAdmin = snap.exists() && snap.data()['role'] === 'admin';
  }

  goProfile() {
    this.router.navigateByUrl('/profile');
  }

  goAdmin() {
    this.router.navigateByUrl('/admin');
  }

  async logout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}