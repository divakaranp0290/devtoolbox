
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.updateFromRoute(this.router.routerState.snapshot.root));
  }

  private updateFromRoute(route: ActivatedRouteSnapshot): void {
    let current = route;

    while (current.firstChild) {
      current = current.firstChild;
    }

    const pageTitle =
      current.title ?? 'Free Online JSON Formatter & Validator | DevToolBox';

    const description =
      current.data['description'] ??
      'Format, minify and validate JSON online with DevToolBox. Process JSON locally in your browser.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });

    // A canonical URL will be added after the production domain is chosen.
    // Never publish localhost URLs as canonical URLs.
    if (isPlatformBrowser(this.platformId)) {
      const canonical = this.document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.remove();
      }
    }
  }
}
