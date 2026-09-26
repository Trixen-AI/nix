import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import App from '@/App';
import { NotFound, RootLayout, RouteFallback } from '@/components/RouteStates';

// The dashboard (and the wallet SDK it pulls in) is split out of the landing bundle and loaded on first visit to /app.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    HydrateFallback: RouteFallback,
    children: [
      { path: '/', Component: App },
      {
        path: '/app',
        lazy: page(() => import('@/app/DashboardLayout')),
        children: [
          { index: true, lazy: page(() => import('@/app/pages/Overview')) },
          { path: 'private-tx', lazy: page(() => import('@/app/pages/PrivateTx')) },
          { path: 'vault', lazy: page(() => import('@/app/pages/Vault')) },
          { path: 'exposure', lazy: page(() => import('@/app/pages/Exposure')) },
          { path: 'activity', lazy: page(() => import('@/app/pages/Activity')) },
          { path: 'assets', lazy: page(() => import('@/app/pages/Assets')) },
          { path: 'network', lazy: page(() => import('@/app/pages/Network')) },
          { path: '*', Component: NotFound },
        ],
      },
      { path: '*', Component: NotFound },
    ],
  },
]);
