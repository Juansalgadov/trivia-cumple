import './globals.css';

export const metadata = {
  title: 'Trivia de Cumpleaños | ¿Cuánto conoces a Juan?',
  description:
    'Trivia interactiva en tiempo real para celebrar el cumpleaños de Juan. Responde preguntas desde tu celular y compite con tus amigos.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#08080f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="bg-[#08080f]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
