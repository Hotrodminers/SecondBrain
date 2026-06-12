const metrics = [
  {
    label: "Brain-dumps",
    value: "0",
    detail: "Structured notes converted into actionable nodes"
  },
  {
    label: "Deadline conflicts",
    value: "0",
    detail: "Overlaps highlighted before they become problems"
  },
  {
    label: "Video transcripts",
    value: "0",
    detail: "Roadmap steps extracted from YouTube content"
  }
];

const lanes = [
  {
    title: "Important + urgent",
    items: ["Submit hackathon demo", "Fix auth blocker"]
  },
  {
    title: "Important + not urgent",
    items: ["Prepare portfolio", "Ship daily review habit"]
  },
  {
    title: "Urgent + not important",
    items: ["Reply to routine pings", "Rename docs"]
  },
  {
    title: "Neither",
    items: ["Scroll loop", "Random tab hoarding"]
  }
];

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Track 6 · Visual Second Brain</p>
          <h1>Turn chaos into a working life map.</h1>
          <p className="lede">
            An infinite canvas for goals, deadlines, and ideas. This baseline is
            ready for the React Flow workspace, brain-dump parser, and transcript
            extractor that will power the MVP.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#canvas">
              Open Canvas
            </a>
            <a className="secondary-button" href="#roadmap">
              View Setup
            </a>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-header">
            <span>Live board preview</span>
            <span className="chip">Seeded</span>
          </div>
          <div className="board-mock" id="canvas" aria-label="Canvas preview">
            {lanes.map((lane) => (
              <article className="lane" key={lane.title}>
                <h2>{lane.title}</h2>
                <ul>
                  {lane.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </section>

      <section className="roadmap" id="roadmap">
        <div>
          <p className="eyebrow">Initial setup complete</p>
          <h2>What this scaffold gives you now</h2>
        </div>
        <div className="roadmap-grid">
          <article>
            <h3>Production-ready baseline</h3>
            <p>Next.js App Router, TypeScript, strict linting, and deployment-friendly output.</p>
          </article>
          <article>
            <h3>Visual system</h3>
            <p>Custom typography, layered gradients, and a bento-style layout for the canvas feel.</p>
          </article>
          <article>
            <h3>Track-specific runway</h3>
            <p>Clear starting point for React Flow nodes, smart parsing, and transcript extraction.</p>
          </article>
        </div>
      </section>
    </main>
  );
}