import {getDefaultSession} from '@inrupt/solid-client-authn-browser';
import {mountApp} from './parents-app.mjs';
await mountApp(getDefaultSession());
