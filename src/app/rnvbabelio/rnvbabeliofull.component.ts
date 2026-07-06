import { Component, HostListener, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RnvBabelioService } from '../services/rnvbabelio.service';
import { Subscription } from 'rxjs';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AssetsPublicPathDirective } from '../services/assets-public-path.directive';

interface LanguageState {
  lang?: string;
}

const selectLanguageFeature = createFeatureSelector<LanguageState>('language');
const selectLanguageLang = createSelector(selectLanguageFeature, (state) => state?.lang ?? 'fr');

@Component({
  selector: 'custom-rnvbabeliofull',
  standalone: true,
  imports: [CommonModule, TranslateModule, AssetsPublicPathDirective],
  templateUrl: './rnvbabeliofull.component.html',
  styleUrl: './rnvbabelio.component.scss'
})
export class RNVBabelioFullComponent {
  private babelioDataSub?: Subscription;
  private languageSub?: Subscription;
  private store = inject(Store);

  constructor(
    public rnvBabelioService: RnvBabelioService, 
    private translateService: TranslateService,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any) {
      rnvBabelioService.applyConfig(this.moduleParameters);
      console.log('Loaded module parameters for RNVBabelioComponent:', this.moduleParameters);
    }
  
  // Limit the number of items displayed outside of modal window
  public displayLimit = 3;
  // Limit the size of user reviews displayed outside of modal window (number of characters)
  public maxReviewLength = 500;

  // Set default language. This is normally updated on init from the store.
  public language: string = 'fr';

  // Initial modal windows state
  public showReviewsModal: boolean = false;
  public displayedReviewPageNr: number = 1;
  public showCitationsModal: boolean = false;
  public displayedCitationPageNr: number = 1;

  ngOnInit() {
    console.log('RNVBabelioFullComponent initialized');
    this.languageSub = this.store.select(selectLanguageLang).subscribe((lang) => {
      this.language = lang;
      console.log('Language updated in RNVBabelioFullComponent:', this.language);
    });

    if (this.rnvBabelioService.isbn) {
      this.rnvBabelioService.getBabelioData(this.rnvBabelioService.isbn).subscribe(
        (data) => {
          this.rnvBabelioService.babelioData = data;
          console.log('Babelio data fetched successfully:', this.rnvBabelioService.babelioData);

        }
      );
    }

    this.babelioDataSub = this.rnvBabelioService.babelioData$.subscribe(data => {
      if (data) {
        // When babelioData is ready:
        // - trim the list of user reviews and citations to only display the first 3
        if (this.rnvBabelioService.babelioData.critiques_notice) this.rnvBabelioService.babelioData.critiques_notice = this.rnvBabelioService.babelioData.critiques_notice.slice(0, this.displayLimit);
        if (this.rnvBabelioService.babelioData.critiques_presse_affichees) this.rnvBabelioService.babelioData.critiques_presse_affichees = this.rnvBabelioService.babelioData.critiques_presse.slice(0, this.displayLimit);
        if (this.rnvBabelioService.babelioData.citations_notice) this.rnvBabelioService.babelioData.citations_notice = this.rnvBabelioService.babelioData.citations_notice.slice(0, this.displayLimit);

        // - add a toggle value for user reviews
        if (this.rnvBabelioService.babelioData.critiques_notice) this.rnvBabelioService.babelioData.critiques_notice.forEach(
          (critique: any) => {
            if (critique.texte.length > this.maxReviewLength) {
              critique.toggle = true;
              critique.open = false;
            } else {
              critique.toggle = false;
              critique.open = true;
          }
        });
        console.log('Babelio data processed for display:', this.rnvBabelioService.babelioData);
      }
    });
  }

  // Translation function for the template. For some reason, the standard translate pipe does not work.
  t(code: string, params?: Record<string, unknown>): string {
    const translated = this.translateService.instant(code, params);
    return translated || code;
  }

  ngOnDestroy() {
    this.babelioDataSub?.unsubscribe();
    this.languageSub?.unsubscribe();
  }

  // Utility function to clean up date strings for display
  cleanDate(dateString: string): string {
    if (!dateString) return '';

    let parsedDate = new Date(dateString);

    if (Number.isNaN(parsedDate.getTime())) {
      const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = dateString.match(ddmmyyyy);
      if (match) {
        const [, day, month, year] = match;
        parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      }
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return dateString;
    }

    // Adjust language code for parsing if necessary (e.g. fr-CH instead of fr) to ensure correct date formatting
    let language = this.language;
    if (language == 'fr') { language = 'fr-CH'; }
    if (language == 'de') { language = 'de-CH'; }

    return parsedDate.toLocaleDateString(language || 'fr', { dateStyle: 'medium' });
  }

  // Open full reviews display modal.
  // This involves making another API request to get the next page of reviews
  babelthequeDisplayReviews(pageNr: number = 1) {
    console.log('Displaying all reviews (page ', pageNr, ')');

    this.displayedReviewPageNr = pageNr;

    // Call API to get next page of reviews
    this.rnvBabelioService.getBabelioData(this.rnvBabelioService.isbn, 'reviews', pageNr).subscribe({
      next: (data: any) => {
        try {
          if (!data) return;
          console.log(data)
          this.rnvBabelioService.babelioData.critiques_affichees = data.critiques;
          console.log(this.rnvBabelioService.babelioData)
          this.showReviewsModal = true;
          document.body.style.overflow = 'hidden';
        } catch (error) {
          console.error('RNV Error fetching reviews for modal:', error);
        }
    },
    error: (error) => {
      console.error('RNV Error fetching reviews for modal:', error);
    }
    });
  }

  // Open full citations display modal.
  // This involves making another API request to get the next page of citations
  babelthequeDisplayCitations(pageNr: number = 1){
    console.log('Displaying all citations (page ', pageNr,')');

    this.displayedCitationPageNr = pageNr;

    // Call API to get next page of citations
    this.rnvBabelioService.getBabelioData(this.rnvBabelioService.isbn, 'citations', pageNr).subscribe({
      next: (data: any) => {
        try {
          if (!data) return;
          console.log(data)
          this.rnvBabelioService.babelioData.citations_affichees = data.citations;
          this.showCitationsModal = true;
          document.body.style.overflow = 'hidden';
        } catch (error) {
          console.error('RNV Error fetching citations for modal:', error);
        }
    },
    error: (error) => {
      console.error('RNV Error fetching citations for modal:', error);
    }
    });
  } 

  closeModal() {
    this.showReviewsModal = false;
    this.showCitationsModal = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeHandler(_event?: Event) {
    if (this.showReviewsModal) this.closeModal();
    if (this.showCitationsModal) this.closeModal();
  }

}
