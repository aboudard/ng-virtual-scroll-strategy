import { CdkVirtualScrollViewport, VirtualScrollStrategy } from "@angular/cdk/scrolling";
import { Observable, Subject, distinctUntilChanged } from "rxjs";
import { Item } from "../dto/item";
import { itemHeightPredictor } from "./item-height-predictor";

const PaddingAbove = 3;
const PaddingBelow = 3;

interface ItemHeight {
  value: number;
  source: 'predicted' | 'actual';
}

export class ItemVirtualScrollStrategy implements VirtualScrollStrategy {

  _scrolledIndexChange$ = new Subject<number>();
  scrolledIndexChange: Observable<number> = this._scrolledIndexChange$.pipe(
    distinctUntilChanged(),
  );

  private _viewport!: CdkVirtualScrollViewport | null;
  private _wrapper!: ChildNode | null;
  private _items: Item[] = [];
  private _heightCache = new Map<string, ItemHeight>();

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._wrapper = viewport.getElementRef().nativeElement.childNodes[0];

    if (this._items) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
      this._updateRenderedRange();
    }
  }

  detach(): void {
    this._viewport = null;
    this._wrapper = null;
  }

  onContentScrolled(): void {
    if (this._viewport) {
      this._updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (!this._viewport) {
      return;
    }

    this._viewport.setTotalContentSize(this._getTotalHeight());
    this._updateRenderedRange();
  }

  onContentRendered(): void {
    /** no-op */
  }

  onRenderedOffsetChanged(): void {
    /** no-op */
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this._viewport) {
      return;
    }

    const offset = this._getOffsetByItemIndex(index);
    this._viewport.scrollToOffset(offset, behavior);
  }

    /**
   * Update the items array.
   *
   * @param items
   */
     updateItems(items: Item[]) {
      this._items = items;
  
      if (this._viewport) {
        this._viewport.checkViewportSize();
      }
    }

    /**
   * Returns the total height of the scrollable container
   * given the size of the elements.
   */
  private _getTotalHeight(): number {
    return this._measureItemsHeight(this._items);
  }

    /**
   * Returns the offset relative to the top of the container
   * by a provided message index.
   *
   * @param idx
   * @returns
   */
     private _getOffsetByItemIndex(idx: number): number {
      return this._measureItemsHeight(this._items.slice(0, idx));
    }

    /**
   * Returns the item index by a provided offset.
   *
   * @param offset
   * @returns
   */
  private _getItemIndexByOffset(offset: number): number {
    let accumOffset = 0;

    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const itemHeight = this._getItemHeight(item);
      accumOffset += itemHeight;
      if (accumOffset >= offset) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Measure items height.
   *
   * @param items
   * @returns
   */
   private _measureItemsHeight(items: Item[]): number {
    return items
      .map((m) => this._getItemHeight(m))
      .reduce((a, c) => a + c, 0);
  }

/**
   * Determine the number of renderable items
   * withing the viewport by given item index.
   *
   * @param startIdx
   * @returns
   */
 private _determineItemsCountInViewport(startIdx: number): number {
  if (!this._viewport) {
    return 0;
  }

  let totalSize = 0;
  const viewportSize = this._viewport.getViewportSize();

  for (let i = startIdx; i < this._items.length; i++) {
    const item = this._items[i];
    totalSize += this._getItemHeight(item);

    if (totalSize >= viewportSize) {
      return i - startIdx + 1;
    }
  }

  return 0;
}

/**
   * Update the range of rendered messages.
   *
   * @returns
   */
 private _updateRenderedRange() {
  if (!this._viewport) {
    return;
  }

  const scrollOffset = this._viewport.measureScrollOffset();
  const scrollIdx = this._getItemIndexByOffset(scrollOffset);
  const dataLength = this._viewport.getDataLength();
  const renderedRange = this._viewport.getRenderedRange();
  const range = {
    start: renderedRange.start,
    end: renderedRange.end,
  };

  range.start = Math.max(0, scrollIdx - PaddingAbove);
  range.end = Math.min(
    dataLength,
    scrollIdx + this._determineItemsCountInViewport(scrollIdx) + PaddingBelow,
  );

  this._viewport.setRenderedRange(range);
  this._viewport.setRenderedContentOffset(
    this._getOffsetByItemIndex(range.start),
  );
  this._scrolledIndexChange$.next(scrollIdx);

  this._updateHeightCache();
}

/**
   * Get the height of a given item.
   * It could be either predicted or actual.
   * Results are memoized.
   *
   * @param item
   * @returns
   */
 private _getItemHeight(item: Item): number {
  let height = 0;
  const cachedHeight = this._heightCache.get(item.id);

  if (!cachedHeight) {
    height = itemHeightPredictor(item);
    this._heightCache.set(item.id, { value: height, source: 'predicted' });
  } else {
    height = cachedHeight.value;
  }

  return height;
}

/**
   * Update the height cache with the actual height
   * of the rendered message components.
   *
   * @returns
   */
 private _updateHeightCache() {
  if (!this._wrapper || !this._viewport) {
    return;
  }

  const nodes = this._wrapper.childNodes;
  let cacheUpdated: boolean = false;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i] as HTMLElement;

    if (node && node.nodeName === 'APP-ITEM') {
      const id = node.getAttribute('data-hm-id') as string;
      const cachedHeight = this._heightCache.get(id);

      if (!cachedHeight || cachedHeight.source !== 'actual') {
        const height = node.clientHeight;

        this._heightCache.set(id, { value: height, source: 'actual' });
        cacheUpdated = true;
      }
    }
  }

  if (cacheUpdated) {
    this._viewport.setTotalContentSize(this._getTotalHeight());
  }
}

}