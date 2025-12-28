export const dynamic = 'force-dynamic';

import { AccountingForm } from './accounting-form';

// Function to get options from environment variables or use defaults (runs on server)
const getOptions = (envVar: string | undefined, defaultOptions: string[]) => {
  if (envVar) {
    const options = envVar.split(',').map(option => option.trim()).filter(option => option !== '');
    if (options.length > 0) {
      return options;
    }
  }
  return defaultOptions;
};

// --- Server Component (Default Export) ---
export default async function Page() {
  // These are now read on the server at runtime for every request
  const storeOptions = getOptions(process.env.STORE_OPTIONS, ['スーパーA', 'コンビニB', 'ドラッグストアC']);
  const paymentMethodOptions = getOptions(process.env.PAYMENT_METHOD_OPTIONS, ['現金', 'クレジットカード', 'QRコード決済']);

  return (
    <AccountingForm
      storeOptions={storeOptions}
      paymentMethodOptions={paymentMethodOptions}
    />
  );
}

