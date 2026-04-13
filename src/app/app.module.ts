import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RemoteConfigService } from './services/remote-config.service';

function bootRemoteConfig(rc: RemoteConfigService) {
  return () => rc.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, useFactory: bootRemoteConfig, deps: [RemoteConfigService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
