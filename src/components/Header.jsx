export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="./" aria-label="Jarvis Desk — главная">
          <span className="brand-mark" aria-hidden="true">J</span>
          <span>jarvis desk</span>
        </a>
        <span className="header-caption">Личное пространство</span>
      </div>
    </header>
  );
}
