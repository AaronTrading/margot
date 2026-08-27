import { doctolibUrl, externalLinkProps } from '@/lib/site';

type SiteHeaderProps = {
  active?: 'home' | 'recettes';
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Accueil Margot Atlani">
        <img
          className="brand-logo"
          src="/logo.png"
          alt=""
          aria-hidden="true"
        />
        <span className="sr-only">Margot Atlani, diététicienne</span>
      </a>
      <nav aria-label="Navigation principale">
        <a href="/#approche">Approche</a>
        <a href="/#consultations">Consultations</a>
        <a
          href="/recettes"
          aria-current={active === 'recettes' ? 'page' : undefined}
        >
          Recettes
        </a>
        <a href="/#cabinet">Cabinet</a>
      </nav>
      <a className="header-action" href={doctolibUrl} {...externalLinkProps}>
        RDV
      </a>
    </header>
  );
}
