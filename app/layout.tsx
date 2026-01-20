import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DonAssistec - Serviços de Reparo Técnico',
  description: 'Plataforma B2B para consulta de serviços e peças de reparo técnico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}