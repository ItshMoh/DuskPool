import React from 'react';

// Table Container
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <table className={`w-full text-left ${className}`}>
      {children}
    </table>
  );
};

// Table Header
interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-white/5 border-b border-white/10 ${className}`}>
      {children}
    </thead>
  );
};

// Table Body
interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`divide-y divide-white/5 ${className}`}>
      {children}
    </tbody>
  );
};

// Table Row
interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-white/5 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

// Table Header Cell
interface TableHeaderCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  align = 'left',
  className = '',
}) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      className={`px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-wider ${alignStyles[align]} ${className}`}
    >
      {children}
    </th>
  );
};

// Table Cell
interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  mono = false,
  className = '',
}) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={`px-6 py-4 ${alignStyles[align]} ${mono ? 'font-mono' : ''} ${className}`}
    >
      {children}
    </td>
  );
};

// Convenience: Full table with standard styling
interface SimpleTableProps {
  headers: string[];
  headerAligns?: ('left' | 'center' | 'right')[];
  children: React.ReactNode;
  className?: string;
}

export const SimpleTable: React.FC<SimpleTableProps> = ({
  headers,
  headerAligns,
  children,
  className = '',
}) => {
  return (
    <Table className={className}>
      <TableHeader>
        <tr>
          {headers.map((header, i) => (
            <TableHeaderCell key={i} align={headerAligns?.[i] || 'left'}>
              {header}
            </TableHeaderCell>
          ))}
        </tr>
      </TableHeader>
      <TableBody>
        {children}
      </TableBody>
    </Table>
  );
};
