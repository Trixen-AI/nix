import { useState, type FormEvent } from 'react';
import { CTA } from '@/data/content';

export function Cta() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // No backend in this preview: acknowledge locally.
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <section className="section cta" id="contact">
      <div className="container">
        <div className="cta-box">
          <h2 className="h2 tight">{CTA.title}</h2>
          <form className="cta-form" onSubmit={onSubmit}>
            <label className="field">
              <span>{CTA.form.titleLabel}</span>
              <input name="title" required placeholder={CTA.form.titlePlaceholder} autoComplete="off" />
            </label>
            <label className="field">
              <span>{CTA.form.messageLabel}</span>
              <textarea name="message" required rows={3} placeholder={CTA.form.messagePlaceholder} />
            </label>
            <div className="cta-form-row">
              <button type="submit" className="btn btn-dark">
                {CTA.button}
              </button>
              <p className="cta-sent" role="status">
                {sent ? CTA.sent : ''}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
