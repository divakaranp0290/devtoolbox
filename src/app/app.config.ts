import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  LucideAngularModule,
  FileText,
  Sparkles,
  Download,
  Check,
  Upload,
  Trash2,
  Copy,
  Code2,
  AlertCircle,
  CheckCircle,
  Minimize2,
  ArrowDownAZ,
  ArrowLeftRight
} from 'lucide-angular';

import { routes } from './app.routes';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    importProvidersFrom(
      LucideAngularModule.pick({
        FileText,
        Minimize2,
        ArrowDownAZ,
        ArrowLeftRight,
        Sparkles,
        Download,
        Check,
        Upload,
        Trash2,
        Copy,
        Code2,
        AlertCircle,
        CheckCircle,
      })
    ),
  ],
};