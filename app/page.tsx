'use client';

import { useState } from 'react';

// An entry in the accounting book
type Entry = {
  id: number;
  date: string;
  store: string;
  amount: number | '';
  paymentMethod: string;
  notes: string;
};

// Pre-defined options for store names and payment methods
const STORE_OPTIONS_DEFAULT = ['スーパーA', 'コンビニB', 'ドラッグストアC'];
const PAYMENT_METHOD_OPTIONS_DEFAULT = ['現金', 'クレジットカード', 'QRコード決済'];

// Function to get options from environment variables or use defaults
const getOptions = (envVar: string | undefined, defaultOptions: string[]) => {
  if (envVar) {
    const options = envVar.split(',').map(option => option.trim()).filter(option => option !== '');
    if (options.length > 0) {
      return options;
    }
  }
  return defaultOptions;
};

const STORE_OPTIONS = getOptions(process.env.NEXT_PUBLIC_STORE_OPTIONS, STORE_OPTIONS_DEFAULT);
const PAYMENT_METHOD_OPTIONS = getOptions(process.env.NEXT_PUBLIC_PAYMENT_METHOD_OPTIONS, PAYMENT_METHOD_OPTIONS_DEFAULT);

// Function to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: 1,
      date: getTodayString(),
      store: '',
      amount: '',
      paymentMethod: '',
      notes: '',
    },
  ]);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now(), // Use timestamp for a unique ID
        date: getTodayString(),
        store: '',
        amount: '',
        paymentMethod: '',
        notes: '',
      },
    ]);
  };

  const removeEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };


  const handleInputChange = (id: number, field: keyof Entry, value: string | number) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entries),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`成功: ${result.message}`);
        // Reset the form to a single blank entry
        setEntries([
          {
            id: 1,
            date: getTodayString(),
            store: '',
            amount: '',
            paymentMethod: '',
            notes: '',
          },
        ]);
      } else {
        alert(`エラー: ${result.message}\n\n${result.error || ''}`);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      alert('予期せぬエラーが発生しました。コンソールを確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">家計簿入力</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-2 min-w-[700px]">
            {/* Headers */}
            <div className="font-semibold p-2">日付</div>
            <div className="font-semibold p-2">店名</div>
            <div className="font-semibold p-2">金額</div>
            <div className="font-semibold p-2">支払い方法</div>
            <div className="font-semibold p-2">備考</div>
            <div />

            {/* Entry Rows */}
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="grid grid-cols-subgrid col-span-6 items-center gap-2"
              >
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => handleInputChange(entry.id, 'date', e.target.value)}
                  className="p-2 border rounded-md"
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  list="store-options"
                  value={entry.store}
                  onChange={(e) => handleInputChange(entry.id, 'store', e.target.value)}
                  className="p-2 border rounded-md"
                  placeholder="店名を入力"
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="number"
                  value={entry.amount}
                  onChange={(e) => handleInputChange(entry.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                  className="p-2 border rounded-md"
                  placeholder="金額"
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  list="payment-method-options"
                  value={entry.paymentMethod}
                  onChange={(e) =>
                    handleInputChange(entry.id, 'paymentMethod', e.target.value)
                  }
                  className="p-2 border rounded-md"
                  placeholder="支払い方法"
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  value={entry.notes}
                  onChange={(e) => handleInputChange(entry.id, 'notes', e.target.value)}
                  className="p-2 border rounded-md"
                  placeholder="備考"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-500 hover:text-red-700 font-semibold disabled:opacity-50"
                  disabled={entries.length <= 1 || isSubmitting}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Datalists for suggestions */}
        <datalist id="store-options">
          {STORE_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="payment-method-options">
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={addEntry}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            行を追加
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 disabled:bg-green-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
      </form>
    </main>
  );
}
