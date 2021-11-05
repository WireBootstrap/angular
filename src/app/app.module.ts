import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WireModule } from '@wirebootstrap/wire-angular';
import { Example1Component } from './sample/example1/example1.component';
import { Example2Component } from './sample/example2/example2.component';

@NgModule({
  declarations: [
    AppComponent,    
    Example1Component,
    Example2Component
  ],
  imports: [    
    WireModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
