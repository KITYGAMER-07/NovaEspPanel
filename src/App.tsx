import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebase';
import { handleFirestoreError, OperationType } from './utils/firestoreError';
import {
  UserProfile,
  StockDoc,
  LogEntry,
  PlanType,
  PLAN_LABELS,
  DEFAULT_PRICES,
} from './types';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { KeyModal } from './components/KeyModal';
import { KeyInspectorModal } from './components/KeyInspectorModal';
import { AuthPage } from './components/AuthPage';

import { AdminDashboard } from './components/AdminDashboard';
import { StockManagement } from './components/StockManagement';
import { ResellerManagement } from './components/ResellerManagement';
import { PriceSettings } from './components/PriceSettings';
import { BalanceControl } from './components/BalanceControl';
import { LogsViewer } from './components/LogsViewer';
import { AnalyticsView } from './components/AnalyticsView';

import { ResellerPortal } from './components/ResellerPortal';
import { HelpPage } from './components/HelpPage';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';

import { SecurityGuard } from './components/SecurityGuard';
import { DeviceLockModal } from './components/DeviceLockModal';
import { getOrCreateDeviceId, getDeviceName } from './utils/deviceSecurity';

const OWNER_EMAIL = 'owner@novaesppanel.com';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // View state
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isViewAsReseller, setIsViewAsReseller] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App Data
  const [stockData, setStockData] = useState<Record<string, StockDoc>>({});
  const [pricesData, setPricesData] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [resellersData, setResellersData] = useState<UserProfile[]>([]);
  const [logsData, setLogsData] = useState<LogEntry[]>([]);

  // Device Lock State
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);
  const [boundDeviceName, setBoundDeviceName] = useState<string>('');

  // Modals & Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Generated Key Output Modal
  const [generatedModal, setGeneratedModal] = useState<{
    isOpen: boolean;
    keys: string[];
    plan: PlanType;
    totalCost: number;
    balanceLeft: number;
  }>({
    isOpen: false,
    keys: [],
    plan: '1D',
    totalCost: 0,
    balanceLeft: 0,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Auth Listener & Initial User Fetching
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Look up user doc
          let userDocSnap = null;
          let q = query(collection(db, 'users'), where('authUid', '==', user.uid), limit(1));
          let qSnap = await getDocs(q);

          if (!qSnap.empty) {
            userDocSnap = qSnap.docs[0];
          } else if (user.email) {
            q = query(collection(db, 'users'), where('email', '==', user.email), limit(1));
            qSnap = await getDocs(q);
            if (!qSnap.empty) {
              userDocSnap = qSnap.docs[0];
              await updateDoc(userDocSnap.ref, { authUid: user.uid });
            }
          }

          if (userDocSnap) {
            const data = userDocSnap.data() as UserProfile;
            const isOwner = user.email === OWNER_EMAIL || data.role === 'owner';
            const updatedProfile: UserProfile = {
              ...data,
              docId: userDocSnap.id,
              uid: user.uid,
              role: isOwner ? 'owner' : 'reseller',
              email: user.email || data.email || '',
            };

            if (isOwner && data.role !== 'owner') {
              await updateDoc(userDocSnap.ref, { role: 'owner' });
            }

            setUserData(updatedProfile);
            setCurrentPage(isOwner ? 'dashboard' : 'resellerDashboard');
          } else {
            // Create user document
            const docId = user.email ? user.email.replace(/\./g, '_') : user.uid;
            const isOwner = user.email === OWNER_EMAIL;
            const newProfile: UserProfile = {
              name: user.displayName || (isOwner ? 'System Owner' : 'Reseller User'),
              email: user.email || '',
              role: isOwner ? 'owner' : 'reseller',
              balance: isOwner ? 999999 : 0,
              telegramId: docId,
              username: '',
              authUid: user.uid,
              docId: docId,
              createdAt: serverTimestamp(),
            };

            await setDoc(doc(db, 'users', docId), newProfile);
            setUserData(newProfile);
            setCurrentPage(isOwner ? 'dashboard' : 'resellerDashboard');
          }
        } catch (err: any) {
          showToast(err.message || 'Error initializing user profile', 'error');
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Snapshot Listeners for Application Data
  useEffect(() => {
    if (!currentUser || !userData) return;

    // Real-time listener for current logged-in user profile & single device lock
    const userDocPath = `users/${userData.docId || userData.telegramId || currentUser.uid}`;
    const userDocRef = doc(db, 'users', userData.docId || userData.telegramId || currentUser.uid);

    const currentDeviceId = getOrCreateDeviceId();
    const currentDeviceName = getDeviceName();

    const unsubsUser = onSnapshot(
      userDocRef,
      async (snap) => {
        if (snap.exists()) {
          const u = snap.data() as UserProfile;
          setUserData((prev) => (prev ? { ...prev, ...u, balance: u.balance ?? 0 } : null));

          // Enforce single device lock
          if (!u.activeDeviceId) {
            // First time login or admin just reset device lock! Claim lock for current device
            setIsDeviceLocked(false);
            try {
              await updateDoc(userDocRef, {
                activeDeviceId: currentDeviceId,
                activeDeviceName: currentDeviceName,
                lastLoginAt: new Date().toISOString(),
              });
            } catch (err) {
              console.error('Failed to claim device lock:', err);
            }
          } else if (u.activeDeviceId === currentDeviceId) {
            // Valid session on this device!
            setIsDeviceLocked(false);
          } else {
            // Account is active on ANOTHER device! Block access!
            setBoundDeviceName(u.activeDeviceName || 'Primary Device');
            setIsDeviceLocked(true);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
    );

    // Stock listener
    const unsubsStock = onSnapshot(
      collection(db, 'stock'),
      (snap) => {
        const sData: Record<string, StockDoc> = {};
        snap.forEach((d) => {
          const data = d.data();
          sData[d.id] = { keys: Array.isArray(data.keys) ? data.keys : [] };
        });
        setStockData(sData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'stock');
      }
    );

    // Prices listener
    const unsubsPrices = onSnapshot(
      collection(db, 'prices'),
      (snap) => {
        const pData: Record<string, number> = { ...DEFAULT_PRICES };
        snap.forEach((d) => {
          pData[d.id] = d.data().price;
        });
        setPricesData(pData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'prices');
      }
    );

    // Resellers listener (Owner only)
    let unsubsResellers = () => {};
    if (userData.role === 'owner') {
      const qResellers = query(collection(db, 'users'), where('role', '==', 'reseller'));
      unsubsResellers = onSnapshot(
        qResellers,
        (snap) => {
          const list: UserProfile[] = [];
          snap.forEach((d) => list.push({ docId: d.id, ...d.data() } as UserProfile));
          setResellersData(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
      );
    }

    // Logs listener
    const qLogs =
      userData.role === 'owner'
        ? query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(50))
        : query(
            collection(db, 'logs'),
            where('resellerId', '==', userData.docId || userData.telegramId || userData.email),
            limit(50)
          );

    const unsubsLogs = onSnapshot(
      qLogs,
      (snap) => {
        const lList: LogEntry[] = [];
        snap.forEach((d) => lList.push({ id: d.id, ...d.data() } as LogEntry));
        setLogsData(lList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'logs');
      }
    );

    return () => {
      unsubsUser();
      unsubsStock();
      unsubsPrices();
      unsubsResellers();
      unsubsLogs();
    };
  }, [currentUser, userData?.docId, userData?.role]);

  // Auth Handlers
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      showToast('Signed in successfully!', 'success');
      return true;
    } catch (err: any) {
      let msg = err.message || 'Login failed';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-email'
      ) {
        msg = 'Account not found or invalid credentials. Please Sign Up first if you do not have an account.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Incorrect password! Please check your credentials.';
      }
      showToast(msg, 'error');
      return false;
    }
  };

  const handleRegister = async (
    name: string,
    telegramId: string,
    username: string,
    email: string,
    pass: string
  ): Promise<boolean> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanTelegramId = telegramId.trim();

      // Create Firebase Auth user first (populates request.auth)
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const authUid = cred.user.uid;

      const adminDocRef = doc(db, 'users', cleanTelegramId);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        const existing = adminDocSnap.data();
        await updateDoc(adminDocRef, {
          authUid,
          email: cleanEmail,
          name: name.trim() || existing.name || name.trim(),
          username: username.trim() || existing.username || username.trim(),
          role: 'reseller',
          telegramId: cleanTelegramId,
        });
      } else {
        await setDoc(adminDocRef, {
          name: name.trim(),
          email: cleanEmail,
          role: 'reseller',
          balance: 0,
          telegramId: cleanTelegramId,
          username: username.trim(),
          authUid,
          createdAt: serverTimestamp(),
        });
      }

      // DO NOT AUTO-LOGIN! Immediately sign out so user must log in explicitly on Sign In tab.
      await signOut(auth);
      showToast('Account created successfully! Please Sign In with your credentials.', 'success');
      return true;
    } catch (err: any) {
      let msg = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered! Please Sign In instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      showToast(msg, 'error');
      return false;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent to email!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    showToast('Logged out', 'info');
  };

  // Admin Actions
  const handleUploadStock = async (plan: PlanType, newKeysList: string[]) => {
    try {
      const currentKeys = stockData[plan]?.keys || [];
      const formattedNew = newKeysList.map((k) => ({
        key: k,
        used: false,
        usedBy: null,
        usedAt: null,
        addedAt: new Date().toISOString(),
      }));

      const merged = [...currentKeys, ...formattedNew];
      await setDoc(doc(db, 'stock', plan), { keys: merged });
      showToast(`Uploaded ${formattedNew.length} key(s) to ${plan} stock`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteKeyFromStock = async (plan: PlanType, targetKey: string) => {
    try {
      const currentKeys = stockData[plan]?.keys || [];
      const updated = currentKeys.filter((k) => k.key !== targetKey);
      await setDoc(doc(db, 'stock', plan), { keys: updated });
      showToast(`Key removed from ${plan} stock`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleClearUsedKeys = async (plan: PlanType) => {
    try {
      const currentKeys = stockData[plan]?.keys || [];
      const activeOnly = currentKeys.filter((k) => !k.used);
      await setDoc(doc(db, 'stock', plan), { keys: activeOnly });
      showToast(`Purged used keys from ${plan}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddReseller = async (telegramId: string, username: string, name: string) => {
    try {
      await setDoc(doc(db, 'users', telegramId), {
        telegramId,
        username,
        name,
        email: '',
        role: 'reseller',
        balance: 0,
        createdAt: serverTimestamp(),
      });
      showToast(`Reseller ${name} registered!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveReseller = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove reseller ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      showToast(`Reseller ${name} removed`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleResetDeviceLock = async (resellerDocId: string, resellerName: string) => {
    try {
      await updateDoc(doc(db, 'users', resellerDocId), {
        activeDeviceId: null,
        activeDeviceName: null,
      });
      showToast(`Device lock reset for ${resellerName}. They can now log in on a new device.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset device lock', 'error');
    }
  };

  const handleUpdatePrice = async (plan: PlanType, price: number) => {
    try {
      await setDoc(doc(db, 'prices', plan), { price, updatedAt: serverTimestamp() });
      showToast(`Price for ${plan} set to ₹${price}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddBalance = async (resellerId: string, amount: number) => {
    try {
      await updateDoc(doc(db, 'users', resellerId), {
        balance: increment(amount),
      });
      showToast(`Added ₹${amount.toFixed(2)} to reseller`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveBalance = async (resellerId: string, amount: number) => {
    try {
      await updateDoc(doc(db, 'users', resellerId), {
        balance: increment(-amount),
      });
      showToast(`Deducted ₹${amount.toFixed(2)} from reseller`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Custom Key Injector (Admin)
  const handleGenerateCustomKey = async (plan: PlanType, prefix: string, count: number) => {
    try {
      const generatedList: string[] = [];
      for (let i = 0; i < count; i++) {
        const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const key = `${prefix}-${plan}-${randHex}-${randHex2}`;
        generatedList.push(key);
      }

      await handleUploadStock(plan, generatedList);
      setGeneratedModal({
        isOpen: true,
        keys: generatedList,
        plan,
        totalCost: 0,
        balanceLeft: userData?.balance || 0,
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Batch Key Generation (Reseller)
  const handleGenerateKeysBatch = async (plan: PlanType, count: number) => {
    if (!userData) return;

    const unitPrice = pricesData[plan] ?? DEFAULT_PRICES[plan];
    const totalCost = unitPrice * count;

    if ((userData.balance || 0) < totalCost) {
      return showToast('Insufficient wallet balance for this order', 'error');
    }

    const planStock = stockData[plan]?.keys || [];
    const availableKeys = planStock.filter((k) => !k.used);

    if (availableKeys.length < count) {
      return showToast(`Out of stock! Only ${availableKeys.length} key(s) available for ${plan}`, 'error');
    }

    const selectedKeys = availableKeys.slice(0, count);
    const selectedKeyStrs = selectedKeys.map((k) => k.key);

    const updatedStockKeys = planStock.map((k) => {
      if (selectedKeyStrs.includes(k.key)) {
        return {
          ...k,
          used: true,
          usedBy: userData.name || userData.telegramId,
          usedAt: new Date().toISOString(),
        };
      }
      return k;
    });

    try {
      await setDoc(doc(db, 'stock', plan), { keys: updatedStockKeys });

      // Deduct balance
      const resellerDocRef = doc(db, 'users', userData.docId || userData.telegramId);
      await updateDoc(resellerDocRef, {
        balance: increment(-totalCost),
      });

      const newBal = (userData.balance || 0) - totalCost;

      // Add to activity logs
      for (const kStr of selectedKeyStrs) {
        await addDoc(collection(db, 'logs'), {
          resellerDocId: userData.docId || userData.telegramId,
          resellerId: userData.telegramId || userData.docId,
          resellerName: userData.name,
          resellerUsername: userData.username || '',
          plan,
          generatedKey: kStr,
          price: unitPrice,
          balanceLeft: newBal,
          createdAt: serverTimestamp(),
        });
      }

      setGeneratedModal({
        isOpen: true,
        keys: selectedKeyStrs,
        plan,
        totalCost,
        balanceLeft: newBal,
      });

      showToast(`Successfully generated ${count} ${plan} Key(s)!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
        <p className="font-display text-sm tracking-wider text-slate-400">Loading NovaEsp System...</p>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return (
      <SecurityGuard user={null} onShowWarning={(msg) => showToast(msg, 'warning')}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <AuthPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
        />
      </SecurityGuard>
    );
  }

  // Single Device Lock Screen if logged in on another device
  if (isDeviceLocked && userData) {
    return (
      <SecurityGuard user={userData} onShowWarning={(msg) => showToast(msg, 'warning')}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <DeviceLockModal
          user={userData}
          activeDeviceName={boundDeviceName}
          onRefreshStatus={() => showToast('Checked status. Contact admin if lock persists.', 'info')}
          onLogout={handleLogout}
        />
      </SecurityGuard>
    );
  }

  const isOwner = userData.role === 'owner';
  const effectiveRole = isOwner && !isViewAsReseller ? 'owner' : 'reseller';

  // Compute low stock items
  const lowStockCount = Object.keys(PLAN_LABELS).filter((p) => {
    const keys = stockData[p]?.keys;
    const count = Array.isArray(keys) ? keys.filter((k) => !k.used).length : 0;
    return count < 5;
  }).length;

  const pageTitles: Record<string, [string, string]> = {
    dashboard: ['Admin Control Center', 'Overview of system health, revenue, and inventory'],
    stock: ['Stock & Key Inventory', 'Manage duration plans, upload bulk keys, and clear inventory'],
    resellers: ['Reseller Directory', 'Register, inspect, and manage reseller accounts'],
    prices: ['Price Plan Rates', 'Configure cost in ₹ per key for each plan duration'],
    balance: ['Balance Control Ledger', 'Credit or deduct funds from reseller wallets'],
    analytics: ['Sales Analytics & Metrics', 'Revenue breakdowns and reseller rankings'],
    logs: ['System Activity Audit Logs', 'Complete generation logs and transaction receipts'],
    resellerDashboard: ['Reseller Portal', 'Generate keys instantly with live stock availability'],
    myBalance: ['My Wallet & History', 'Check balance details and past generation receipts'],
    stockLeft: ['Stock & Rate Card', 'Available stock counts and active key prices'],
    help: ['Help Center & Guides', 'Documentation and operational instructions'],
  };

  const [currentTitle, currentSubtitle] = pageTitles[currentPage] || ['Panel', ''];

  return (
    <SecurityGuard user={userData} onShowWarning={(msg) => showToast(msg, 'warning')}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-teal-500/30 selection:text-teal-200 max-w-full overflow-x-hidden">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Generated Keys Output Modal */}
      <KeyModal
        isOpen={generatedModal.isOpen}
        onClose={() => setGeneratedModal((prev) => ({ ...prev, isOpen: false }))}
        keys={generatedModal.keys}
        plan={generatedModal.plan}
        totalCost={generatedModal.totalCost}
        balanceLeft={generatedModal.balanceLeft}
      />

      {/* Session Timeout Inactivity Warning Modal */}
      <SessionTimeoutModal onLogout={handleLogout} />

      {/* Key Inspector Modal */}
      <KeyInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        stockData={stockData}
        logsData={logsData}
      />

      {/* Sidebar */}
      <Sidebar
        user={userData}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onQuickGenerateKey={(plan) => handleGenerateKeysBatch(plan, 1)}
        onOpenInspector={() => setIsInspectorOpen(true)}
        lowStockCount={lowStockCount}
        pricesData={pricesData}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <Navbar
          user={userData}
          title={currentTitle}
          subtitle={currentSubtitle}
          onRefresh={() => showToast('Refreshed data!', 'info')}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenInspector={() => setIsInspectorOpen(true)}
          onLogout={handleLogout}
          isViewAsReseller={isViewAsReseller}
          onToggleViewMode={() => {
            setIsViewAsReseller(!isViewAsReseller);
            setCurrentPage(!isViewAsReseller ? 'resellerDashboard' : 'dashboard');
          }}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar max-w-full min-w-0">
          {effectiveRole === 'owner' ? (
            <>
              {currentPage === 'dashboard' && (
                <AdminDashboard
                  resellersCount={resellersData.length}
                  logs={logsData}
                  stockData={stockData}
                  pricesData={pricesData}
                  onNavigate={setCurrentPage}
                  onGenerateCustomKey={handleGenerateCustomKey}
                />
              )}

              {currentPage === 'stock' && (
                <StockManagement
                  stockData={stockData}
                  pricesData={pricesData}
                  onUploadKeys={handleUploadStock}
                  onDeleteKeyFromStock={handleDeleteKeyFromStock}
                  onClearUsedKeys={handleClearUsedKeys}
                  onRefresh={() => showToast('Stock refreshed', 'info')}
                />
              )}

              {currentPage === 'resellers' && (
                <ResellerManagement
                  resellers={resellersData}
                  onAddReseller={handleAddReseller}
                  onRemoveReseller={handleRemoveReseller}
                  onQuickAddBalance={handleAddBalance}
                  onResetDeviceLock={handleResetDeviceLock}
                />
              )}

              {currentPage === 'prices' && (
                <PriceSettings pricesData={pricesData} onUpdatePrice={handleUpdatePrice} />
              )}

              {currentPage === 'balance' && (
                <BalanceControl
                  resellers={resellersData}
                  onAddBalance={handleAddBalance}
                  onRemoveBalance={handleRemoveBalance}
                />
              )}

              {currentPage === 'analytics' && (
                <AnalyticsView logs={logsData} resellers={resellersData} />
              )}

              {currentPage === 'logs' && (
                <LogsViewer
                  logs={logsData}
                  onRefresh={() => showToast('Logs refreshed', 'info')}
                />
              )}

              {currentPage === 'help' && <HelpPage />}
            </>
          ) : (
            <>
              {(currentPage === 'resellerDashboard' || currentPage === 'dashboard') && (
                <ResellerPortal
                  user={userData}
                  stockData={stockData}
                  pricesData={pricesData}
                  logs={logsData}
                  onGenerateKeysBatch={handleGenerateKeysBatch}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === 'myBalance' && (
                <div className="space-y-6 max-w-3xl animate-fadeIn">
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-500/20 via-slate-900 to-slate-900 border border-teal-500/30 text-center shadow-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Current Wallet Balance
                    </p>
                    <p className="font-display text-5xl font-extrabold text-teal-300 font-mono my-2">
                      ₹{(userData.balance || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">Contact admin to recharge or add funds</p>
                  </div>

                  <LogsViewer logs={logsData.filter((l) => l.resellerDocId === userData.docId || l.resellerId === userData.telegramId)} onRefresh={() => {}} />
                </div>
              )}

              {currentPage === 'stockLeft' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-display font-bold text-white text-lg mb-4">Stock & Price Catalog</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(Object.keys(PLAN_LABELS) as PlanType[]).map((p) => {
                        const price = pricesData[p] ?? DEFAULT_PRICES[p];
                        const keys = stockData[p]?.keys;
                        const count = Array.isArray(keys) ? keys.filter((k) => !k.used).length : 0;
                        const canAfford = (userData.balance || 0) >= price;

                        return (
                          <div key={p} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-display text-base">{p}</span>
                              <span className="text-xs text-slate-400">{PLAN_LABELS[p]}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                              <span className="font-bold text-teal-300 font-mono text-base">₹{price} / key</span>
                              <span className={canAfford ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                                {canAfford ? 'Affordable' : 'Low Balance'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {currentPage === 'help' && <HelpPage isAdmin={userData?.role === 'owner'} />}
            </>
          )}
        </main>
      </div>
    </div>
  </SecurityGuard>
  );
}
