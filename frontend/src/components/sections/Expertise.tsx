const stats = [
  { number: '500+', label: 'Talents référencés' },
  { number: '200+', label: 'Entreprises accompagnées' },
  { number: '95%', label: 'Taux de satisfaction' },
  { number: '48h', label: 'Délai moyen de réponse' },
]

export function Expertise() {
  return (
    <section className="section-dark section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-display font-bold text-sil-accent mb-2">
                {stat.number}
              </div>
              <div className="text-sil-light text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



