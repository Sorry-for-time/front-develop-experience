import './public-path.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { NgModuleRef } from '@angular/core';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

let app: null | NgModuleRef<AppModule> = null;

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((res) => {
    app = res;
  });

window.addEventListener('umount', () => {
  console.log(`child app: angular module will destroy`);
  app!.destroy();
  app = null;
});
