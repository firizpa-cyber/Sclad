/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Terminal } from './pages/Terminal';
import { Inventory } from './pages/Inventory';
import { Finance } from './pages/Finance';
import { Debts } from './pages/Debts';
import { Returns } from './pages/Returns';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

export default function App() {
 return (
 <BrowserRouter>
 <Routes>
 <Route path="/" element={<Layout />}>
 <Route index element={<Terminal />} />
 <Route path="inventory" element={<Inventory />} />
 <Route path="finance" element={<Finance />} />
 <Route path="debts" element={<Debts />} />
 <Route path="returns" element={<Returns />} />
 <Route path="notifications" element={<Notifications />} />
 <Route path="settings" element={<Settings />} />
 </Route>
 </Routes>
 </BrowserRouter>
 );
}
