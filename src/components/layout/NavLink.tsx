import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { NavigationItem } from '../../utils/navigation';
import { useLanguage } from '../../context/useLanguage';

interface NavLinkProps {
  item: NavigationItem;
}

const NavLink = ({ item }: NavLinkProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  
  // Check if the current route matches the nav item
  const isActive = item.href === '/' 
    ? location.pathname === '/'
    : location.pathname.startsWith(item.href);

  return (
    <Link
      to={item.href}
      className={cn(
        'navigation-link',
        isActive 
          ? 'navigation-link-active' 
          : 'navigation-link-inactive'
      )}
    >
      {t(item.nameKey)}
    </Link>
  );
};

export default NavLink; 