import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ brand: string }>
}

const brandData: Record<string, { name: string; models: { id: string; name: string }[] }> = {
  apple: {
    name: 'Apple',
    models: [
      { id: 'iphone-15', name: 'iPhone 15' },
      { id: 'iphone-14', name: 'iPhone 14' },
      { id: 'iphone-13', name: 'iPhone 13' },
      { id: 'ipad-pro', name: 'iPad Pro' },
      { id: 'macbook-air', name: 'MacBook Air' },
    ]
  },
  samsung: {
    name: 'Samsung',
    models: [
      { id: 'galaxy-s24', name: 'Galaxy S24' },
      { id: 'galaxy-s23', name: 'Galaxy S23' },
      { id: 'galaxy-a54', name: 'Galaxy A54' },
      { id: 'galaxy-tab-s9', name: 'Galaxy Tab S9' },
    ]
  },
  xiaomi: {
    name: 'Xiaomi',
    models: [
      { id: 'redmi-note-13', name: 'Redmi Note 13' },
      { id: 'poco-x6', name: 'Poco X6' },
      { id: 'mi-14', name: 'Mi 14' },
    ]
  },
  motorola: {
    name: 'Motorola',
    models: [
      { id: 'edge-40', name: 'Edge 40' },
      { id: 'moto-g54', name: 'Moto G54' },
    ]
  },
  lg: {
    name: 'LG',
    models: [
      { id: 'wing', name: 'Wing' },
      { id: 'velvet', name: 'Velvet' },
    ]
  },
}

export default async function BrandPage({ params }: PageProps) {
  const { brand } = await params
  const data = brandData[brand]

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Modelos {data.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900">{model.name}</h3>
              <p className="text-gray-600 mt-2">Ver serviços e peças</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}