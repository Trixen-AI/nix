import ProofScene from '@/components/scene/ProofScene';
import { INTRO } from '@/data/content';

export function Intro() {
  return (
    <section className="section" id="how">
      <div className="container pb-default">
        <div className="section-head">
          <div className="section-head-title">
            <p className="eyebrow">{INTRO.eyebrow}</p>
            <h2 className="h2">{INTRO.title}</h2>
          </div>
          <p className="p section-head-body">{INTRO.body}</p>
        </div>
        <div className="scene">
          <ProofScene />
        </div>
      </div>
    </section>
  );
}
