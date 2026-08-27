const doctolibUrl =
  'https://www.doctolib.fr/dieteticien/saint-alban/margot-atlani';
const instagramUrl = 'https://www.instagram.com/margot.diet/';

const supportAreas = [
  'Rééquilibrage alimentaire',
  'Nutrition du sportif',
  'Surpoids et obésité',
  'Intolérances alimentaires',
  'Consultation enfant',
  'Suivi adulte',
];

const hours = [
  ['Lundi', '10h00 - 13h30', '16h30 - 20h30'],
  ['Mardi', '09h00 - 13h30', '16h30 - 20h30'],
  ['Mercredi', '10h00 - 13h30', '16h30 - 20h30'],
  ['Jeudi', '09h00 - 13h30', '16h30 - 20h30'],
  ['Vendredi', '10h00 - 13h30', '16h30 - 20h30'],
  ['Samedi', '10h00 - 12h00', ''],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="Accueil Margot Atlani">
          <span>Margot Atlani</span>
          <small>Diététicienne</small>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#approche">Approche</a>
          <a href="#consultations">Consultations</a>
          <a href="#cabinet">Cabinet</a>
        </nav>
        <a className="header-action" href={doctolibUrl}>
          RDV
        </a>
      </header>

      <section className="hero" id="accueil">
        <div className="hero-copy">
          <p className="eyebrow">Saint-Alban - 31140</p>
          <h1>Margot Atlani, diététicienne à Saint-Alban</h1>
          <p className="lead">
            Un accompagnement nutritionnel clair, concret et bienveillant pour
            retrouver une alimentation qui vous ressemble, sans discours
            culpabilisant.
          </p>
          <div className="hero-actions" aria-label="Actions principales">
            <a className="primary-button" href={doctolibUrl}>
              Prendre rendez-vous
            </a>
            <a className="secondary-button" href="tel:+33777203145">
              Appeler le cabinet
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-label="Ambiance nutrition">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=82"
            alt="Assiette colorée et aliments frais sur une table"
          />
          <div className="consult-note">
            <strong>Consultations au cabinet</strong>
            <span>11 rue Pierre Mendès France</span>
          </div>
        </div>
      </section>

      <section className="intro-band" id="approche">
        <div>
          <p className="eyebrow">Une méthode simple</p>
          <h2>Avancer par petites habitudes, pas par interdits.</h2>
        </div>
        <p>
          L'objectif est de comprendre votre quotidien, vos contraintes, votre
          activité et votre rapport à l'alimentation. Les conseils sont ajustés
          à votre rythme pour construire des changements qui tiennent dans la
          vraie vie.
        </p>
      </section>

      <section className="content-section" id="consultations">
        <div className="section-heading">
          <p className="eyebrow">Consultations</p>
          <h2>Pour quels besoins ?</h2>
        </div>
        <div className="areas-grid">
          {supportAreas.map((area) => (
            <article className="area-card" key={area}>
              <span aria-hidden="true" />
              <h3>{area}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <div className="image-panel">
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1100&q=82"
            alt="Salade fraîche préparée dans un bol"
          />
        </div>
        <div className="text-panel">
          <p className="eyebrow">Déroulement</p>
          <h2>Une première consultation pour poser les bases.</h2>
          <p>
            Le premier rendez-vous permet de faire le point sur vos habitudes,
            vos objectifs et votre santé. Les suivis servent ensuite à ajuster
            les conseils, garder le cap et rendre les changements plus naturels.
          </p>
          <div className="price-row">
            <div>
              <strong>70 €</strong>
              <span>Première consultation</span>
            </div>
            <div>
              <strong>55 €</strong>
              <span>Consultation de suivi</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section cabinet-section" id="cabinet">
        <div className="section-heading">
          <p className="eyebrow">Infos pratiques</p>
          <h2>Cabinet au sein de CrossFit Naveli</h2>
        </div>
        <div className="practical-grid">
          <article className="info-card">
            <h3>Adresse</h3>
            <p>
              11 rue Pierre Mendès France
              <br />
              31140 Saint-Alban
            </p>
            <p className="muted">Rez-de-chaussée, parking gratuit.</p>
          </article>
          <article className="info-card">
            <h3>Contact</h3>
            <p>
              <a href="tel:+33777203145">07 77 20 31 45</a>
              <br />
              <a href={instagramUrl}>@margot.diet</a>
            </p>
            <p className="muted">Rendez-vous en ligne via Doctolib.</p>
          </article>
          <article className="info-card">
            <h3>Paiement</h3>
            <p>Chèques, espèces et virement bancaire.</p>
            <p className="muted">Carte Vitale non acceptée.</p>
          </article>
        </div>
      </section>

      <section className="hours-section" aria-labelledby="hours-title">
        <div>
          <p className="eyebrow">Horaires</p>
          <h2 id="hours-title">Ouverture du cabinet</h2>
        </div>
        <div className="hours-list">
          {hours.map(([day, morning, afternoon]) => (
            <div className="hours-line" key={day}>
              <strong>{day}</strong>
              <span>
                {morning}
                {afternoon ? ` / ${afternoon}` : ''}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow">Prendre soin de son alimentation</p>
        <h2>Commencer par un rendez-vous, simplement.</h2>
        <div className="hero-actions">
          <a className="primary-button" href={doctolibUrl}>
            Réserver sur Doctolib
          </a>
          <a className="secondary-button" href={instagramUrl}>
            Voir Instagram
          </a>
        </div>
      </section>
    </main>
  );
}
