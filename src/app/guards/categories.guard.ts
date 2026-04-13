import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { RemoteConfigService } from '../services/remote-config.service';

export const categoriesGuard: CanMatchFn = () => {
  const rc = inject(RemoteConfigService);
  const router = inject(Router);
  if (rc.getFlag('categoriesEnabled')) return true;
  router.navigateByUrl('/home');
  return false;
};
