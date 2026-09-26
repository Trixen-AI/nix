import { lazy, Suspense } from 'react';
import { INTRO } from '@/data/content';

// three.js is only needed for this scene, so it ships in its own chunk.
const AgentScene = lazy(() => import('@/components/scene/AgentScene'));

export function Intro() {
  return (
    <section className="section" id="how">
      <div className="container pb-default">
        <div className="intro-text">
          <h2 className="h2">{INTRO.title}</h2>
          <p className="p">{INTRO.body}</p>
        </div>
        <div className="scene" role="img" aria-label="Traceable transactions pass behind the Zentry and come out as private zero-knowledge commitments">
          <Suspense fallback={null}>
            <AgentScene />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
