// No client signals — pulled into client graph by DashboardNav
// Classic creep candidate: could be a server component passed as children

interface Props {
  href: string;
  label: string;
}

export function NavItem({ href, label }: Props) {
  return <a href={href}>{label}</a>;
}
