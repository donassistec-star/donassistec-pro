import Link from 'next/link'

const brands = [
  { id: 'apple', name: 'Apple', image: 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png' },
  { id: 'samsung', name: 'Samsung', image: 'https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png' },
  { id: 'xiaomi', name: 'Xiaomi', image: 'https://logos-world.net/wp-content/uploads/2020/04/Xiaomi-Logo.png' },
  { id: 'motorola', name: 'Motorola', image: 'https://logos-world.net/wp-content/uploads/2020/04/Motorola-Logo.png' },
  { id: 'lg', name: 'LG', image: 'https://logos-world.net/wp-content/uploads/2020/04/LG-Logo.png' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            DonAssistec
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Serviços e peças de reparo técnico para lojistas
          </p>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Selecione a Marca
          </h2>
          <p className="text-gray-600">Escolha a marca do dispositivo para ver serviços disponíveis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center transform hover:-translate-y-1"
            >
              <img src={brand.image} alt={brand.name} className="w-20 h-20 mx-auto mb-6 object-contain" />
              <h3 className="text-2xl font-semibold text-gray-900">{brand.name}</h3>
              <p className="text-gray-500 mt-2">Ver modelos e serviços</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}