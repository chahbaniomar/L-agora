import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.getCurrentUser();
  if (!user) return router.createUrlTree(['/login']);

  const snap = await getDoc(doc(db, 'users', user.uid));
  const isAdmin = snap.exists() && snap.data()['role'] === 'admin';

  return isAdmin ? true : router.createUrlTree(['/home']);
};