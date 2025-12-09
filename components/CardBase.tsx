import React from 'react';

interface CardBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Componente ícone para o canto superior direito (opcional) */
  icon?: React.ReactNode;
  /** Classe adicional do ícone */
  iconClassName?: string;
  /** Header section (título + descrição) */
  header?: {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
  };
  /** Conteúdo principal do card */
  children?: React.ReactNode;
  /** Footer section (botões, ações) */
  footer?: React.ReactNode;
  /** Se true, aplica flex column com justify-between para full height */
  fullHeight?: boolean;
  /** Borda esquerda para destaque (ex: 'border-l-github-success') */
  accentBorder?: string;
  /** Variante visual: 'default', 'elevated', 'bordered' */
  variant?: 'default' | 'elevated' | 'bordered';
  /** Padding interno: 'compact' (12px), 'normal' (16px), 'spacious' (24px) */
  padding?: 'compact' | 'normal' | 'spacious';
  /** Hover effect: true, false */
  hoverable?: boolean;
}

/**
 * CardBase: Componente base reutilizável para todos os Cards
 * 
 * Regras aplicadas:
 * - Largura 100% em telas < 480px
 * - Arredondamento: 16px
 * - Sombra: md (padrão)
 * - Responsive padding: 12-24px
 * - Ícones máx 24px
 * - Botões com mín 40px altura
 * - Paleta consistente (github-surface, github-border)
 * - Suporta header, content e footer compartimentalizados
 */
export const CardBase: React.FC<CardBaseProps> = ({
  icon,
  iconClassName = '',
  header,
  children,
  footer,
  fullHeight = false,
  accentBorder = '',
  variant = 'default',
  padding = 'normal',
  hoverable = false,
  className = '',
  ...props
}) => {
  // Padding classes baseado na prop
  const paddingClasses = {
    compact: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-5 lg:p-6',
    spacious: 'p-6 sm:p-8 lg:p-10'
  };

  // Variante visual
  const variantClasses = {
    default: 'bg-github-surface border border-github-border',
    elevated: 'bg-github-surface border border-github-border shadow-md',
    bordered: 'bg-github-surface border-2 border-github-border'
  };

  // Hover effect
  const hoverClass = hoverable ? 'hover:shadow-lg hover:border-github-primary transition-all duration-200' : '';

  // Accent border
  const accentClass = accentBorder ? accentBorder : '';

  const baseClasses = `
    w-full rounded-[16px] transition-colors duration-200
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${accentClass}
    ${hoverClass}
    ${fullHeight ? 'flex flex-col h-full justify-between' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses} {...props}>
      {/* Header Section */}
      {header && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            {header.icon && (
              <div className="mb-2 flex items-center gap-2">
                <div className="text-github-muted max-w-[24px]">
                  {header.icon}
                </div>
              </div>
            )}
            {header.title && (
              <h3 className="text-base sm:text-lg font-semibold text-github-text break-words">
                {header.title}
              </h3>
            )}
            {header.subtitle && (
              <p className="text-xs sm:text-sm text-github-muted mt-1">
                {header.subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={`flex-shrink-0 flex items-center justify-center text-github-muted max-w-[24px] ${iconClassName}`}>
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      {children && (
        <div className={header ? 'mb-4' : ''}>
          {children}
        </div>
      )}

      {/* Footer Section */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-github-border/50">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * CardGrid: Layout de múltiplos cards responsivo
 * - Coluna 1: 1 card (mobile)
 * - Coluna 2: 2 cards (sm/md)
 * - Coluna 3+: 3+ cards (lg/xl)
 */
export const CardGrid: React.FC<{
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'tight' | 'normal' | 'loose';
}> = ({
  children,
  cols = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 'normal'
}) => {
  const gapClasses = {
    tight: 'gap-2 sm:gap-3',
    normal: 'gap-3 sm:gap-4 lg:gap-5',
    loose: 'gap-4 sm:gap-6 lg:gap-8'
  };

  const gridClasses = `
    grid w-full
    grid-cols-${cols.xs || 1}
    sm:grid-cols-${cols.sm || 2}
    md:grid-cols-${cols.md || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
    ${gapClasses[gap]}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default CardBase;
