import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ model: string }>
}

const modelData: Record<string, {
  name: string;
  videos: { id: string; title: string; url: string }[];
  services: { id: string; name: string; icon: string; description: string }[];
  parts: { id: string; name: string; price: string }[];
}> = {
  'iphone-15': {
    name: 'iPhone 15',
    videos: [
      { id: '1', title: 'Troca de Tela iPhone 15', url: 'https://example.com/video1' },
      { id: '2', title: 'Reparo de Bateria', url: 'https://example.com/video2' },
    ],
    services: [
      { id: '1', name: 'Troca de Tela', icon: '📱', description: 'Substituição completa da tela com garantia' },
      { id: '2', name: 'Reparo de Bateria', icon: '🔋', description: 'Troca da bateria com testes completos' },
      { id: '3', name: 'Reparo de Câmera', icon: '📷', description: 'Conserto do sistema de câmera' },
    ],
    parts: [
      { id: '1', name: 'Tela Original Apple', price: 'R$ 1.200,00' },
      { id: '2', name: 'Bateria Original', price: 'R$ 350,00' },
      { id: '3', name: 'Câmera Traseira', price: 'R$ 450,00' },
    ]
  },
  'galaxy-s24': {
    name: 'Galaxy S24',
    videos: [
      { id: '1', title: 'Troca de Tela Galaxy S24', url: 'https://example.com/video3' },
    ],
    services: [
      { id: '1', name: 'Troca de Tela', icon: '📱', description: 'Substituição da tela com garantia Samsung' },
      { id: '2', name: 'Reparo de Software', icon: '💻', description: 'Atualização e reparo do sistema' },
    ],
    parts: [
      { id: '1', name: 'Tela AMOLED', price: 'R$ 800,00' },
      { id: '2', name: 'Placa Mãe', price: 'R$ 600,00' },
    ]
  },
  // Add more models as needed
}

export default async function ModelPage({ params }: PageProps) {
  const { model } = await params
  const data = modelData[model]

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/brands/apple" className="text-blue-600 hover:text-blue-800">
            ← Voltar para Modelos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {data.name}
          </h1>
        </div>

        {/* Videos Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vídeos Explicativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="aspect-video bg-gray-200 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Vídeo: {video.title}</span>
                </div>
                <h3 className="text-lg font-semibold">{video.title}</h3>
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Assistir Vídeo
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Serviços Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Parts Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Peças Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.parts.map((part) => (
              <div key={part.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{part.name}</h3>
                <p className="text-2xl font-bold text-green-600 mb-4">{part.price}</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                  Solicitar Peça
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center">
          <div className="bg-green-100 border border-green-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Não encontrou o que procura?
            </h3>
            <p className="text-green-700 mb-4">
              Fale conosco no WhatsApp para serviços ou peças personalizadas
            </p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold">
              📱 Falar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}