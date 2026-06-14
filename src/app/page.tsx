const bentoHighlights = [
  {
    title: "Signal-first capture",
    body: "Drop the chaos in one move, then shape it into something you can actually act on.",
    accent: "Quick intake",
  },

  {
    title: "From thought to motion",
    body: "Turn loose notes and learning into a cleaner next step without the extra ceremony.",
    accent: "Sharper output",
  },
];

const pulseNotes = ["Clean capture", "Calm hierarchy", "Built for momentum"];

export default function Home() {
  return (
    <main className="shell home-page">
      <section className="hero">
        <div className="hero-copy panel panel-large">
          <p className="eyebrow">Focus interface</p>
          <h1>SecondBrain</h1>
          <p className="lede">
            Think less. Move faster.<br />
            Remove the extra clutter.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="/canvas">
              Open Canvas
            </a>
            <a className="secondary-button" href="#system">
              Explore the flow
            </a>
          </div>

          <div className="hero-strip" aria-label="Product highlights">
           
            
            
          </div>
        </div>

        <div className="hero-aside">
          <article className="panel panel-signal panel-tall">
            <div className="card-header">
              
              
            </div>
            <p className="signal-copy">
              Built to turn loose thoughts into a cleaner next move without the
              clutter.
            </p>
            <div className="signal-stack">
              {pulseNotes.map((note) => (
                <div className="signal-pill" key={note}>
                  {note}
                </div>
              ))}
            </div>
          </article>

          <article className="panel panel-compact panel-score">
            <p className="eyebrow eyebrow-inline">Two inputs</p>
            <h2>Brain dump or video, straight to action.</h2>
            <p>
              Capture the mess, extract the path, then move. No extra ceremony.
            </p>
          </article>
        </div>
      </section>

      <section className="bento-grid" id="system">
        {bentoHighlights.map((item, index) => (
          <article className={`panel bento-card bento-card-${index + 1}`} key={item.title}>
            <div className="card-header">
              <span>{item.accent}</span>
              <span className="chip">0{index + 1}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}

        <article className="panel bento-card bento-card-wide">
          <div className="card-header">
            <span>Next move</span>
            <span className="chip chip-muted">Canvas ready</span>
          </div>
          <h3>Step into the workspace when you’re ready to work, not browse.</h3>

        </article>
      </section>
    </main>
  );
}
