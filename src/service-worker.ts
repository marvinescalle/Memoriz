import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;
// Pré-cache des ressources lors de l'installation du service worker
precacheAndRoute(self.__WB_MANIFEST);

// Utilisez la stratégie StaleWhileRevalidate pour les requêtes d'API
registerRoute(
  /^https:\/\/api\.exemple\.com/,
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);
