import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

/** Internal routes ("/app/...") go through React Router; hashes and outside URLs stay plain anchors. */
export function SiteLink({ href, external, ...rest }: Props) {
  if (href.startsWith('/')) return <Link to={href} {...rest} />;
  return <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest} />;
}
