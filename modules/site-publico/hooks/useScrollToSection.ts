import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook para scroll suave até uma seção da página.
 * Compartilhado entre PublicNavbar e PublicFooter.
 */
export function useScrollToSection(offset = 140) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string, onDone?: () => void) => {
      e.preventDefault();
      onDone?.();

      const element = document.getElementById(id);

      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 100);
      }
    },
    [navigate, offset]
  );

  return scrollToSection;
}
