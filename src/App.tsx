/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PemasaranView } from './components/PemasaranView';
import { KeuanganView } from './components/KeuanganView';
import { ProduksiView } from './components/ProduksiView';
import { PesananView } from './components/PesananView';
import { AnalisisView } from './components/AnalisisView';
import { ManajemenView } from './components/ManajemenView';
import { SarpraView } from './components/SarpraView';
import { DigitalView } from './components/DigitalView';
import { HRDView } from './components/HRDView';
import { AbsensiView } from './components/AbsensiView';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'manajemen':
        return <ManajemenView />;
      case 'hrd':
        return <HRDView />;
      case 'absensi':
        return <AbsensiView />;
      case 'pemasaran':
        return <PemasaranView />;
      case 'keuangan':
        return <KeuanganView />;
      case 'produksi':
        return <ProduksiView />;
      case 'pesanan':
        return <PesananView />;
      case 'sarpra':
        return <SarpraView />;
      case 'digital':
        return <DigitalView />;
      case 'analisis':
        return <AnalisisView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
}


