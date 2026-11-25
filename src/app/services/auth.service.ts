import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists() && snap.data()['active'] === false) {
      await signOut(auth);
      throw new Error('account-disabled');
    }
    return cred.user;
  }

  logout() {
    return signOut(auth);
  }

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }
}