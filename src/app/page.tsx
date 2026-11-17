import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 text-4xl">🏢</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Réservez votre salle de réunion
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Trouvez et réservez la salle parfaite en quelques secondes. Gérez vos réunions, invitez des participants et recevez des confirmations instantanées.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/rooms"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Trouver une salle
            </Link>
            <Link
              href="/register"
              className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '🔍', title: 'Recherche intelligente', desc: 'Filtrez par capacité, équipements et localisation. Résultats en temps réel.' },
            { icon: '⚡', title: 'Réservation instantanée', desc: 'Confirmez en un clic. Aucun conflit possible grâce aux verrous transactionnels.' },
            { icon: '📧', title: 'Notifications', desc: 'Confirmations et rappels automatiques par e-mail pour vous et vos participants.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white text-center grid grid-cols-3 gap-4">
          {[
            { value: '5', label: 'Salles disponibles' },
            { value: '3', label: 'Bâtiments' },
            { value: '100%', label: 'Disponibilité temps réel' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
