import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { client } from './hey-api/client.gen';
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import { getFullLocale } from './services/localeService';

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
    },
  },
});

client.setConfig({
  // set default base url for requests
  baseUrl: 'https://localhost:26786/',
  // set default headers for requests
  headers: {
    'Accept-Language': getFullLocale(),
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webDarkTheme} style={{ flexGrow: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </FluentProvider>
  </StrictMode>,
)
