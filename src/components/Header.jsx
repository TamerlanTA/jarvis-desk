export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="./" aria-label="Klick Desk — главная">
          <span className="brand-wordmark">
            klick<span className="brand-dot">.</span>
          </span>
          <span className="brand-product">desk</span>
        </a>
        <span className="header-caption">Личный планировщик</span>
      </div>
    </header>
  );
}
