import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Maximize2, Menu, LogOut, Loader2, Wallet, User } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface HeaderProps {
  currentPath?: string;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(2);
}

const Header: React.FC<HeaderProps> = ({
  currentPath = '/',
}) => {
  const { address, balances, isConnected, isPending, connect, disconnect } = useWallet();
  const navigate = useNavigate();

  const xlmBalance = balances.find(b => b.asset === 'XLM');

  const publicNavItems = [
    { label: 'MARKETS', id: 'markets' },
    { label: 'PROTOCOL', id: 'protocol' },
    { label: 'FAQ', id: 'faq' },
    { label: 'BLOG', route: '/blog' }
  ];

  const isHomePage = currentPath === '/';

  const handleScrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="px-6 py-4 md:px-8 flex items-center justify-between">
        {/* Left Section - Icons */}
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <div className="w-5 h-5 border border-white/60 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </Link>
          <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <Search className="w-4 h-4 text-white/60" />
          </button>
          <div className="w-24 h-[1px] bg-white/20 hidden md:block"></div>
        </div>

        {/* Center Section - Decorative frame only (no logo) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <svg className="w-[400px] h-12" viewBox="0 0 400 50" fill="none">
            {/* Angled lines coming down from top */}
            <path d="M120 0 L150 20 L250 20 L280 0" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
            {/* Small accent lines */}
            <line x1="140" y1="10" x2="145" y2="15" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="260" y1="10" x2="255" y2="15" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
          </svg>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-[1px] bg-white/20 hidden md:block"></div>

          {isPending ? (
            <button
              disabled
              className="hidden md:flex items-center gap-2 px-6 py-2 border border-white/20 text-[11px] font-medium tracking-widest text-white/50"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              CONNECTING
            </button>
          ) : !isConnected ? (
            <button
              onClick={handleConnect}
              className="hidden md:flex items-center gap-2 px-6 py-2 border border-white/20 hover:border-white/40 transition-colors text-[11px] font-medium tracking-widest text-white"
            >
              CONNECT
            </button>
          ) : (
            <>
              {/* Balance Button */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 border border-brand-stellar/30 bg-brand-stellar/5">
                <Wallet className="w-3.5 h-3.5 text-brand-stellar" />
                <span className="text-[11px] font-mono text-brand-stellar font-medium">
                  {xlmBalance ? `${formatBalance(xlmBalance.balance)} XLM` : '0.00 XLM'}
                </span>
              </div>

              {/* Address/Avatar Button */}
              <button
                onClick={handleDisconnect}
                className="hidden md:flex items-center gap-2 px-3 py-2 border border-white/20 hover:border-red-500/40 transition-colors group"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-stellar/60 to-purple-500/60 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-mono text-white/80">
                  {address ? truncateAddress(address) : ''}
                </span>
                <LogOut className="w-3 h-3 text-white/40 group-hover:text-red-500/70 transition-colors" />
              </button>
            </>
          )}

          <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <Bell className="w-4 h-4 text-white/60" />
          </button>
          <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
            <Maximize2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Navigation Row - Only visible on home page */}
      {isHomePage && !isConnected && (
        <div className="hidden lg:flex items-center justify-center gap-12 py-3">
          {publicNavItems.map((item) => {
            if ('route' in item) {
              return (
                <Link
                  key={item.route}
                  to={item.route}
                  className="text-[11px] font-medium tracking-[0.2em] transition-all duration-300 text-white/40 hover:text-white/70"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleScrollToSection(item.id, e)}
                className="text-[11px] font-medium tracking-[0.2em] transition-all duration-300 text-white/40 hover:text-white/70"
              >
                {item.label}
              </a>
            );
          })}
        </div>
      )}

      {/* Mobile Menu Toggle */}
      <button className="lg:hidden fixed top-4 right-4 w-10 h-10 border border-white/20 flex items-center justify-center">
        <Menu className="w-5 h-5 text-white" />
      </button>
    </header>
  );
};

export default Header;
