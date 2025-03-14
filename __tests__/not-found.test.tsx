import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">{children}</a>
  );
});

describe('NotFound Page', () => {
  it('renders the not found page correctly', () => {
    render(<NotFound />);
    
    // Check if main elements are present
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(
      screen.getByText('Lo sentimos, la página que estás buscando no existe o ha sido movida.')
    ).toBeInTheDocument();
    
    // Check if the link is present and has correct href
    const link = screen.getByRole('link', { name: /volver al inicio/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('has the correct styling classes', () => {
    render(<NotFound />);
    
    // Check if main container has correct classes
    const mainContainer = screen.getByRole('heading', { name: /página no encontrada/i }).parentElement?.parentElement;
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('bg-white');
    expect(mainContainer).toHaveClass('dark:bg-gray-900');
    
    // Check if link has correct styling classes
    const link = screen.getByRole('link', { name: /volver al inicio/i });
    expect(link).toHaveClass('px-6');
    expect(link).toHaveClass('py-3');
    expect(link).toHaveClass('bg-blue-600');
    expect(link).toHaveClass('text-white');
    expect(link).toHaveClass('rounded-md');
    expect(link).toHaveClass('hover:bg-blue-700');
    expect(link).toHaveClass('transition-colors');
  });
}); 