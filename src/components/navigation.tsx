import { useEffect, useState } from 'react';

import NearLogo from '@/assets/near-logo.svg';
import { Link } from 'react-router';
import styles from '@/styles/app.module.css';

import { useLogin, useLogout, usePrivy, User } from '@privy-io/react-auth';
import { useNEAR } from '../context/useNear';
import { NEAR } from '@near-js/tokens';

export const Navigation = () => {
  const [action, setAction] = useState<() => void>(() => {});
  const [label, setLabel] = useState('Loading...');
  const [balance, setBalance] = useState<string>('0');
  
  const { authenticated, user } = usePrivy();

  const { login: privyLogin } = useLogin();
  const { logout: privyLogout } = useLogout();

  const { walletId, nearAccount } = useNEAR();

  useEffect(() => {
    if (authenticated && user) {
      // Safely access user properties
      const userId =
        user.google?.email ??
        user.email?.address ??
        user.github?.username ??
        'Unknown User';

      setAction(() => privyLogout);
      setLabel(`Logout ${userId}`);
    } else {
      setAction(() => privyLogin);
      setLabel('Login');
      setBalance('0');
    }
  }, [authenticated, user, privyLogin, privyLogout]);

  useEffect(() => {
    if (walletId && nearAccount) {
      nearAccount
        .getBalance()
        .then((b) => setBalance(Number(NEAR.toDecimal(b)).toFixed(2)))
        .catch(() => setBalance('0')); // fallback if account doesn't exist
    }
  }, [walletId, nearAccount]);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link to="/">
          <img
            src={NearLogo}
            alt="NEAR"
            width="30"
            height="24"
            className={styles.logo}
          />
        </Link>
        <div className="navbar-nav pt-1">
          {authenticated && walletId ? (
            <span className="badge text-dark small">
              <br />
              {walletId}: {balance} Ⓝ
            </span>
          ) : null}

          <button className="btn btn-secondary" onClick={action}>
            {label}
          </button>
        </div>
      </div>
    </nav>
  );
};
