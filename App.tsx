import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { LoanCalculator } from './screens/LoanCalculator';
import { PersonalInfo } from './screens/PersonalInfo';
import { FXTrading } from './screens/FXTrading';
import { TravelInsurance } from './screens/TravelInsurance';
import { DocumentUpload } from './screens/DocumentUpload';
import { Transfer } from './screens/Transfer';
import { PayBills } from './screens/PayBills';
import { Home } from './screens/Home';

const ScreenRouter: React.FC = () => {
  const { state } = useApp();

  switch (state.currentScreen) {
    case 'home': return <Home />;
    case 'loan-calculator': return <LoanCalculator />;
    case 'personal-info': return <PersonalInfo />;
    case 'fx-trading': return <FXTrading />;
    case 'travel-insurance': return <TravelInsurance />;
    case 'document-upload': return <DocumentUpload />;
    case 'transfer': return <Transfer />;
    case 'pay-bills': return <PayBills />;
    default: return <Home />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Layout>
        <ScreenRouter />
      </Layout>
    </AppProvider>
  );
};

export default App;