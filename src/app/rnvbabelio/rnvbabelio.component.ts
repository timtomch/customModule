import { Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RnvBabelioService } from '../services/rnvbabelio.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'custom-rnvbabelio',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './rnvbabelio.component.html',
  styleUrl: './rnvbabelio.component.scss'
})
export class RNVBabelioComponent implements OnInit, OnChanges, DoCheck {
  @Input() private hostComponent!: any;
  private lastSearchResultID: string | null = null;

  constructor(
    public rnvBabelioService: RnvBabelioService,
    private location: Location,
    private translateService: TranslateService
  ) {}
  
  // Restrict Babelio content to fulldisplay pages only
  get isFullDisplay(): boolean {
    return (this.location.path().toLowerCase().includes('fulldisplay'));
  }

  // Fetches the Alma ID of the currently displayed record and use it to check for changes.
  private getAlmaId(): string | null {
    let searchResult = this.hostComponent?.searchResult;
    if (!searchResult) {
      return null;
    }
    return searchResult?.pnx?.control?.recordid ?? '';
  }

  // This function is called on init and when changes are detected.
  private refreshData() {
    // Check if the search result has changed. If not, do not fetch data again.
    let currentID = this.getAlmaId();
    if (!currentID || currentID === this.lastSearchResultID) {
      return;
    }

    // Start from a clean slate.
    this.rnvBabelioService.babelioData = null;

    this.lastSearchResultID = currentID;
    this.fetchBabelioData();
  }

  private fetchBabelioData() {
    // If multiple ISBNs are present, take the first one only.
    let isbnRaw = this.hostComponent?.searchResult?.pnx?.addata?.isbn;
    this.rnvBabelioService.isbn = Array.isArray(isbnRaw) ? isbnRaw[0] : isbnRaw;
    this.rnvBabelioService.title = this.hostComponent?.searchResult?.pnx?.display?.title;

    console.log(this.rnvBabelioService.isbn);

    // Call the service to fetch data from Babelio API (promise)
    if (this.rnvBabelioService.isbn) {
      this.rnvBabelioService.getBabelioData(this.rnvBabelioService.isbn).subscribe(
        (data) => {
          this.rnvBabelioService.babelioData = data;
          console.log('Babelio data fetched successfully:', this.rnvBabelioService.babelioData);
        }
      );
    }
  }

  // On init, check if we are on a fulldisplay page and if so, fetch the data.
  ngOnInit() {
    console.log('RNVBabelioComponent initialized');
    if (this.isFullDisplay) {
      this.refreshData();
    }
  }

  // Check if there are changes (eg user navigates to another record) and if so, update the data.
  ngOnChanges(changes: SimpleChanges) {
    if (changes['hostComponent'] && this.isFullDisplay) {
      this.refreshData();
    }
  }
  ngDoCheck() {
    if (this.isFullDisplay) {
      this.refreshData();
    }
  }

  // Translation function for the template. For some reason, the standard translate pipe does not work.
  t(code: string, params?: Record<string, unknown>): string {
    const translated = this.translateService.instant(code, params);
    return translated || code;
  }

  // Helper function to scroll to the reviews section from the short ratings display.
  scrollToBabelMain(event?: Event) {
    try {
      // prevent default anchor jump so we can do smooth scroll
      event?.preventDefault();
      const el = document.getElementById('babelio-full');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // optional: focus for accessibility
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      } else {
        // fallback: change hash so href fallback works
        window.location.hash = '#babelio-full';
      }
    } catch (e) {
      // last-resort fallback
      window.location.hash = '#babelio-full';
    }
  }
}
