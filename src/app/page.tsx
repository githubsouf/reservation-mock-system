import Link from 'next/link';
import Navbar from '@/components/Navbar';

const S = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
};

export default function Home() {
  return (
    <div style={S.page}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)', padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: 'rgba(37,99,235,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div style={{ ...S.container, position: 'relative', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Disponible 24h/24</span>
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, margin: '0 auto 24px' }}>
            Réservez votre<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>salle de réunion</span>
          </h1>
          <p style={{ fontSize: 20, color: '#94a3b8', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Trouvez et réservez la salle parfaite en quelques secondes. Gérez vos réunions, invitez des participants, confirmez en un clic.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/rooms" style={{
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff',
              padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 600,
              boxShadow: '0 4px 24px rgba(37,99,235,0.4)',
            }}>
              Trouver une salle →
            </Link>
            <Link href="/register" style={{
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)',
              padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 500,
            }}>
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ ...S.container, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
          {[
            { value: '5', label: 'Salles disponibles', icon: '🏛️' },
            { value: '3', label: 'Bâtiments couverts', icon: '🏢' },
            { value: '100%', label: 'Temps réel', icon: '⚡' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '32px 24px', borderRight: i < 2 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px', letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px' }}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-1px' }}>Tout ce dont vous avez besoin</h2>
            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>Une plateforme simple et puissante pour gérer toutes vos salles de réunion.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🔍', title: 'Recherche intelligente', desc: 'Filtrez par capacité, équipements et localisation. Résultats instantanés avec disponibilité en temps réel.', color: '#eff6ff', iconBg: '#2563eb' },
              { icon: '⚡', title: 'Réservation instantanée', desc: 'Confirmez en un clic. Verrous transactionnels pour éviter tout conflit de réservation.', color: '#faf5ff', iconBg: '#7c3aed' },
              { icon: '📅', title: 'Gestion complète', desc: 'Modifiez, annulez, créez des récurrences. Historique complet de toutes vos réunions.', color: '#f0fdf4', iconBg: '#16a34a' },
              { icon: '🛡️', title: 'Rôles & permissions', desc: "Employé, organisateur ou admin. Chaque rôle a accès aux bonnes fonctionnalités.", color: '#fff7ed', iconBg: '#ea580c' },
              { icon: '📊', title: 'Dashboard admin', desc: 'Statistiques d\'utilisation, top salles, gestion des utilisateurs et des espaces.', color: '#fdf2f8', iconBg: '#db2777' },
              { icon: '🏢', title: 'Multi-bâtiments', desc: 'Gérez plusieurs bâtiments et étages avec filtres par localisation précise.', color: '#eff6ff', iconBg: '#0284c7' },
            ].map(f => (
              <div key={f.title} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, transition: 'box-shadow 0.2s' }}>
                <div style={{ width: 52, height: 52, background: f.color, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ ...S.container }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
            borderRadius: 24, padding: '56px 48px', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, background: 'rgba(99,102,241,0.2)', borderRadius: '50%', filter: 'blur(60px)' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: '#ffffff', margin: '0 0 16px', letterSpacing: '-0.5px' }}>Prêt à réserver ?</h2>
              <p style={{ fontSize: 18, color: '#93c5fd', margin: '0 0 32px' }}>Créez votre compte gratuitement et réservez votre première salle en moins d'une minute.</p>
              <Link href="/register" style={{
                textDecoration: 'none', background: '#ffffff', color: '#1e3a8a',
                padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700,
                display: 'inline-block',
              }}>
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800 }}>S</div>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>SalleRésa</span>
        </div>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>© 2024 SalleRésa. Application de réservation de salles de réunion.</p>
      </footer>
    </div>
  );
}
