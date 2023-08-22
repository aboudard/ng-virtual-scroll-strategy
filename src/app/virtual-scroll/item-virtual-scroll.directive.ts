import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, Input, forwardRef } from '@angular/core';
import { Item } from '../dto/item';
import { ItemVirtualScrollStrategy } from './item-virtual-scroll-strategy';

@Directive({
  selector: '[itemVirtualScroll]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (d: ItemVirtualScrollDirective) => d._scrollStrategy,
      deps: [forwardRef(() => ItemVirtualScrollDirective)],
    },
  ],
})
export class ItemVirtualScrollDirective {
  _scrollStrategy = new ItemVirtualScrollStrategy();

  private _items: Item[] = [];

  @Input()
  set items(value: Item[] | null) {
    if (value && this._items.length !== value.length) {
      this._scrollStrategy.updateItems(value);
      this._items = value;
    }
  }
}
