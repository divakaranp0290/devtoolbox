
import { Routes } from '@angular/router';
import { JsonFormatterComponent } from './features/json-formatter/json-formatter.component';
import { About } from './pages/about/about.component';
import { Privacy } from './pages/privacy/privacy.component';
import { Contact } from './pages/contact/contact.component';



export const routes: Routes = [
    {
        path: '',
        component: JsonFormatterComponent,
        title: 'Free Online JSON Formatter & Validator | DevToolBox',
        data: {
            description:
                'Format, minify and validate JSON online. Upload JSON files, copy results and download formatted output.',
        },
    },
    {
        path: 'about',
        component: About,
        title: 'About DevToolBox',
        data: {
            description:
                'Learn about DevToolBox and our practical browser-based developer tools.',
        },
    },
    {
        path: 'privacy',
        component: Privacy,
        title: 'Privacy Policy | DevToolBox',
        data: {
            description:
                'Learn how DevToolBox handles information and how its browser-based JSON formatter processes your data.',
        },
    },
    {
        path: 'contact',
        component: Contact,
        title: 'Contact DevToolBox',
        data: {
            description:
                'Contact DevToolBox with questions, bug reports and suggestions for improving our developer tools.',
        },
    },
    {
        path: '**',
        redirectTo: '',
    },
];
