import { Component, ViewChild } from '@angular/core';
import { Item } from './dto/item';
import { LoremIpsum } from 'lorem-ipsum';
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  names,
} from 'unique-names-generator';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ng-virtual-scroll-strategy';
  public items: Array<Item>;
  @ViewChild(CdkVirtualScrollViewport)
  public virtualScrollViewport!: CdkVirtualScrollViewport;

  constructor() {
    this.items = Array.from({ length: 25 }).map((_, i) => {
      return {
        id: i + '',
        title: uniqueNamesGenerator({
          dictionaries: [adjectives, colors, names],
          length: 2,
          style: 'capital',
          separator: ' ',
        }),
        text: new LoremIpsum({
          wordsPerSentence: {
            max: 40,
            min: 4,
          },
        }).generateSentences(1),
      };
    });
  }

  pouf(event: number): void {
    console.log('scrollEvent : ' + event);
  }

  meuh(): void {
    this.virtualScrollViewport.scrollToIndex(5);
  }
}
