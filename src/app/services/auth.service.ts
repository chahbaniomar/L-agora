import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  async register(email: string, password: string, nom: string, prenom: string, age: number) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      nom, prenom, age, email,
      role: 'user',
      active: true,
      createdAt: serverTimestamp(),
    });
    return cred.user;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout() {
    return signOut(auth);
  }

  onUserChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}