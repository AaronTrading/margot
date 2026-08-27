import type { Metadata } from 'next';
import { RecipesGrid } from '@/components/RecipesGrid';
import { SiteHeader } from '@/components/SiteHeader';
import { doctolibUrl, externalLinkProps } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Recettes - Margot Atlani',
  description:
    'Des recettes simples, équilibrées et gourmandes pour composer vos repas au quotidien.',
};

export default function RecipesPage() {
  return (
    <main>
      <SiteHeader active="recettes" />

      <section className="recipes-hero">
        <div className="recipes-hero-copy">
          <p className="eyebrow">Idées recettes</p>
          <h1>Des repas simples, équilibrés et gourmands.</h1>
          <p className="lead">
            Une sélection de recettes faciles à intégrer dans votre quotidien,
            pour manger mieux sans se compliquer la vie.
          </p>
        </div>
      </section>

      <section className="recipes-section">
        <RecipesGrid />
      </section>

      <section className="final-cta">
        <p className="eyebrow">Besoin d’un accompagnement personnalisé ?</p>
        <h2>On construit votre alimentation ensemble.</h2>
        <div className="hero-actions">
          <a className="primary-button" href={doctolibUrl} {...externalLinkProps}>
            Prendre rendez-vous
          </a>
          <a className="secondary-button" href="/">
            Retour à l&apos;accueil
          </a>
        </div>
      </section>
    </main>
  );
}
