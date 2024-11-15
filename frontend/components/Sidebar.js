// components/Sidebar.js
import { useRouter } from 'next/router';

export default function Sidebar({ account }) {
  const router = useRouter();

  return (
    <nav className="sidebar">
      <ul>
        <li onClick={() => router.push('/assets')}>assets</li>{' '}
        <li onClick={() => router.push('/crosschain-swap')}>crosschain-swap</li>{' '}
        <li onClick={() => router.push('/setting')}>setting</li>{' '}
      </ul>{' '}
    </nav>
  );
}
