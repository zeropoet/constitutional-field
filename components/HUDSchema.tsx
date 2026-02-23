export default function HUDSchema() {
  return (
    <section className="hud-panel">
      <h3>Visual Schema</h3>
      <div className="schema-grid">
        <div className="schema-item">
          <span className="schema-dot energy-low" />
          <p>
            <strong>Energy</strong>
            <br />
            Blue (low) to amber (high)
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-ring" />
          <p>
            <strong>Age</strong>
            <br />
            Older invariants breathe, gain thicker rings, and develop arc halos
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-label">dyn-*</span>
          <p>
            <strong>Identity</strong>
            <br />
            Top energy nodes show id + age + energy label in-canvas
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-anchor" />
          <p>
            <strong>Type</strong>
            <br />
            Squares are anchors (`B`, `Ci`), circles are dynamic invariants
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-basin" />
          <p>
            <strong>Basin Density</strong>
            <br />
            Transparent circles expand as basin particle count increases
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-probe">
            <span className="schema-probe-tail" />
            <span className="schema-probe-head" />
          </span>
          <p>
            <strong>Probe Motion</strong>
            <br />
            White stroke paths persist for the session; probe heads show speed and age (larger + fainter)
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-orbit">
            <span className="schema-orbit-core" />
            <span className="schema-orbit-dot" />
          </span>
          <p>
            <strong>Elder Orbit</strong>
            <br />
            A small orbiting dot appears on elder invariants to mark advanced age
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-scaffold">
            <span className="schema-scaffold-line a" />
            <span className="schema-scaffold-line b" />
            <span className="schema-scaffold-node n1" />
            <span className="schema-scaffold-node n2" />
            <span className="schema-scaffold-node n3" />
          </span>
          <p>
            <strong>Secondary Scaffold</strong>
            <br />
            Decaying memory points from the white trail connect into a constrained support network
          </p>
        </div>
        <div className="schema-item">
          <span className="schema-phase">elder</span>
          <p>
            <strong>Age Phase</strong>
            <br />
            Registry badges show lifecycle state: spark, bloom, mature, elder
          </p>
        </div>
      </div>
    </section>
  )
}
