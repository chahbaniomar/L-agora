import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonInput, IonButton, ToastController,
} from '@ionic/angular';
import {
  addDoc, collection, deleteDoc, doc, getDocs,
  orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthService } from '../../services/auth.service';

interface AppUser {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  active: boolean;
}

interface Film {
  id: string;
  titre: string;
  annee: number;
  genres: string[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonInput, IonButton, FormsModule,
  ],
})
export class AdminPage implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastController);

  tab: 'users' | 'films' = 'users';
  myUid = '';

  users: AppUser[] = [];
  films: Film[] = [];

  titre = '';
  resume = '';
  genres = '';
  annee: number | null = null;
  acteurs = '';
  affiche = '';

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    this.myUid = user?.uid ?? '';
    await this.loadUsers();
    await this.loadFilms();
  }

  // ---------- Utilisateurs ----------

  async loadUsers() {
    const snap = await getDocs(collection(db, 'users'));
    this.users = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        prenom: data['prenom'] ?? '',
        nom: data['nom'] ?? '',
        email: data['email'] ?? '',
        role: data['role'] ?? 'user',
        active: data['active'] !== false,
      };
    });
  }

  async toggleActive(u: AppUser) {
    if (u.id === this.myUid) {
      return this.show('Tu ne peux pas désactiver ton propre compte', 'warning');
    }
    try {
      const newState = !u.active;
      await updateDoc(doc(db, 'users', u.id), { active: newState });
      u.active = newState;
      this.show(newState ? 'Compte activé' : 'Compte désactivé', 'success');
    } catch (e) {
      console.error(e);
      this.show('Erreur lors de la modification', 'danger');
    }
  }

  // ---------- Films ----------

  async loadFilms() {
    const q = query(collection(db, 'films'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    this.films = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        titre: data['titre'] ?? '',
        annee: data['annee'] ?? 0,
        genres: data['genres'] ?? [],
      };
    });
  }

  async addFilm() {
    if (!this.titre.trim() || !this.resume.trim() || !this.annee) {
      return this.show('Titre, résumé et année sont obligatoires', 'warning');
    }
    try {
      await addDoc(collection(db, 'films'), {
        titre: this.titre.trim(),
        resume: this.resume.trim(),
        genres: this.split(this.genres),
        annee: this.annee,
        acteurs: this.split(this.acteurs),
        affiche: this.affiche.trim(),
        createdAt: serverTimestamp(),
      });
      this.titre = '';
      this.resume = '';
      this.genres = '';
      this.annee = null;
      this.acteurs = '';
      this.affiche = '';
      this.show('Film ajouté', 'success');
      await this.loadFilms();
    } catch (e) {
      console.error(e);
      this.show('Erreur lors de l\'ajout du film', 'danger');
    }
  }

  async deleteFilm(f: Film) {
    try {
      await deleteDoc(doc(db, 'films', f.id));
      this.films = this.films.filter((x) => x.id !== f.id);
      this.show('Film supprimé', 'success');
    } catch (e) {
      console.error(e);
      this.show('Erreur lors de la suppression', 'danger');
    }
  }

  private split(value: string): string[] {
    return value.split(',').map((s) => s.trim()).filter((s) => s);
  }

  private async show(message: string, color: string) {
    const t = await this.toast.create({ message, duration: 2000, color });
    t.present();
  }
}