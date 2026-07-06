import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError,BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RnvBabelioService {
  constructor(private http: HttpClient) {}

  // Define babelioData as an observable with getter and setter.
  // This will help prevent the same data being fetched multiple times by different components.
  private _babelioData = new BehaviorSubject<any>(null);
  public babelioData$ = this._babelioData.asObservable();

  set babelioData(data: any) {
    this._babelioData.next(data);
  }

  get babelioData() {
    return this._babelioData.value;
  }

  public isbn: string = '';
  public title: string = '';
  public displayCitations: boolean = true;
  public ApiGatewayUrl: string = '';

  applyConfig(config: { displayCitations?: unknown; ApiGatewayUrl?: unknown } | null | undefined): void {
    if (!config) {
      return;
    }

    if (config.displayCitations !== undefined && config.displayCitations !== null) {
      this.displayCitations = this.toBoolean(config.displayCitations, true);
    }

    if (config.ApiGatewayUrl !== undefined && config.ApiGatewayUrl !== null) {
      this.ApiGatewayUrl = String(config.ApiGatewayUrl).trim();
    }
  }

  private toBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }

    return fallback;
  }

  // Function to fetch data from Babelio API
  getBabelioData(isbn: string, type: string = 'all', page: number = 1): Observable<any> {
    let baseUrl = this.ApiGatewayUrl;

    let url = '';

    if (type == 'all') {
        url = baseUrl + '?type=all&isbn=' + isbn;
    } else if (type == 'reviews') {
        url = baseUrl + '?type=reviews&isbn=' + isbn + '&page=' + page;
    } else if (type == 'citations') {
        url = baseUrl + '?type=citations&isbn=' + isbn + '&page=' + page;
    } else {
        return throwError(() => new Error('Missing or invalid parameter in getBabelioData API query!'));
    }
    console.log('Fetching Babelio data with URL:', url);
    return this.http.get(url);
  }
}