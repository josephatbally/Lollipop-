const items = [["PROFILE","Personal information and preferences"],["SECURITY","Password, sessions and two-factor authentication"],["MEMBERSHIPS","Subscriptions and saved creators"],["PURCHASES","Your premium purchases"],["PRIVACY","Visibility, data and account controls"]];

export default function AccountPage() {
  return (
    <main className="shell page">
      <nav className="nav"><a className="brand" href="/">◉ LOLLIPOP</a><div className="nav-links"><a href="/discover">Discover</a><a href="/creators">Creators</a><a href="/account">Account</a></div><button className="ghost-button">Sign in</button></nav>
      <header className="page-header"><p className="eyebrow">YOUR SPACE</p><h1>Account<br /><span>control center.</span></h1><p>Privacy, security and membership controls in one place.</p></header>
      <section className="account-list">{items.map(([title, detail]) => <div className="account-row" key={title}><div><p className="eyebrow">{title}</p><span>{detail}</span></div><b>›</b></div>)}</section>
    </main>
  );
}
