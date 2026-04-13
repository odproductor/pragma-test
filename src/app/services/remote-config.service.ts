import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private app?: FirebaseApp;
  private rc?: RemoteConfig;
  private flags: Record<string, boolean> = {
    categoriesEnabled: environment.flags.categoriesEnabled
  };

  async init(): Promise<void> {
    try {
      if (environment.firebase.apiKey.startsWith('REPLACE')) return;
      this.app = initializeApp(environment.firebase);
      this.rc = getRemoteConfig(this.app);
      this.rc.settings.minimumFetchIntervalMillis = 60_000;
      this.rc.defaultConfig = { categoriesEnabled: environment.flags.categoriesEnabled };
      await fetchAndActivate(this.rc);
      this.flags['categoriesEnabled'] = getValue(this.rc, 'categoriesEnabled').asBoolean();
    } catch {
      return;
    }
  }

  getFlag(name: string): boolean {
    return !!this.flags[name];
  }
}
