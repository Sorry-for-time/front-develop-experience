import { APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: APP_BASE_HREF,
      // @ts-ignore
      useValue: window.__MICRO_APP_BASE_ROUTE__ || "/"
    }
  ]
})
export class AppRoutingModule {}
