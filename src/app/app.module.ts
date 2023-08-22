import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { AppComponent } from './app.component';
import { ItemComponent } from './comp/item/item.component';
import { ItemVirtualScrollDirective } from './virtual-scroll/item-virtual-scroll.directive';

@NgModule({
  declarations: [
    AppComponent,
    ItemComponent,
    ItemVirtualScrollDirective
  ],
  imports: [
    BrowserModule,
    ScrollingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
