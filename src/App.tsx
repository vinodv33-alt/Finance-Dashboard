import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import LoanManagement from './components/LoanManagement/LoanManagement';
import Savings from './components/Savings/Savings';
import Suggestions from './components/Suggestions/Suggestions';
import DataManagement from './components/DataManagement';
import { motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '💰 Dashboard', component: Dashboard },
    { id: 'loans', label: '✏️ Loan Management', component: LoanManagement },
    { id: 'savings', label: '💼 Savings', component: Savings },
    { id: 'suggestions', label: '💡 Suggestions', component: Suggestions },
    { id: 'data', label: '💾 Data Management', component: DataManagement },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Personal Finance Dashboard
              </h1>
              <p className="text-white/70">
                Manage your loans, track savings, and get financial insights
              </p>
            </motion.div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;
