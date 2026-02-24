import type {Metadata} from 'next';
import './globals.css'; // Global styles
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ConvexClientProvider>
          {children}
          <Toaster position="top-center" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
