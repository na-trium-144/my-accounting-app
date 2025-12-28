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

// Props for the client component
type AccountingFormProps = {
  storeOptions: string[];
  paymentMethodOptions: string[];
};

// Function to get today's date in YYYY-MM-DD format (runs on client)
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function AccountingForm({ storeOptions, paymentMethodOptions }: AccountingFormProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 md:min-w-[700px]">
            {/* Headers: Visible only on medium screens and up */}
            <div className="hidden md:block font-semibold p-2">日付</div>
            <div className="hidden md:block font-semibold p-2">店名</div>
            <div className="hidden md:block font-semibold p-2">金額</div>
            <div className="hidden md:block font-semibold p-2">支払い方法</div>
            <div className="hidden md:block font-semibold p-2">備考</div>
            <div />

            {/* Entry Rows */}
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-1 md:grid-cols-subgrid md:col-span-6 gap-y-2 gap-x-4 border p-4 rounded-md md:border-none md:p-0"
              >
                {/* Date */}
                <div className="grid grid-cols-[80px_1fr] items-center md:contents">
                  <label htmlFor={`date-${entry.id}`} className="text-sm font-medium md:hidden">日付</label>
                  <input
                    id={`date-${entry.id}`}
                    type="date"
                    value={entry.date}
                    onChange={(e) => handleInputChange(entry.id, 'date', e.target.value)}
                    className="p-2 border rounded-md w-full"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Store */}
                <div className="grid grid-cols-[80px_1fr] items-center md:contents">
                  <label htmlFor={`store-${entry.id}`} className="text-sm font-medium md:hidden">店名</label>
                  <input
                    id={`store-${entry.id}`}
                    type="text"
                    list="store-options"
                    value={entry.store}
                    onChange={(e) => handleInputChange(entry.id, 'store', e.target.value)}
                    className="p-2 border rounded-md w-full"
                    placeholder="店名を入力"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Amount */}
                <div className="grid grid-cols-[80px_1fr] items-center md:contents">
                  <label htmlFor={`amount-${entry.id}`} className="text-sm font-medium md:hidden">金額</label>
                  <input
                    id={`amount-${entry.id}`}
                    type="number"
                    value={entry.amount}
                    onChange={(e) => handleInputChange(entry.id, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-2 border rounded-md w-full"
                    placeholder="金額"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-[80px_1fr] items-center md:contents">
                  <label htmlFor={`payment-${entry.id}`} className="text-sm font-medium md:hidden">支払い方法</label>
                  <input
                    id={`payment-${entry.id}`}
                    type="text"
                    list="payment-method-options"
                    value={entry.paymentMethod}
                    onChange={(e) =>
                      handleInputChange(entry.id, 'paymentMethod', e.target.value)
                    }
                    className="p-2 border rounded-md w-full"
                    placeholder="支払い方法"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Notes */}
                <div className="grid grid-cols-[80px_1fr] items-center md:contents">
                  <label htmlFor={`notes-${entry.id}`} className="text-sm font-medium md:hidden">備考</label>
                  <input
                    id={`notes-${entry.id}`}
                    type="text"
                    value={entry.notes}
                    onChange={(e) => handleInputChange(entry.id, 'notes', e.target.value)}
                    className="p-2 border rounded-md w-full"
                    placeholder="備考"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Remove Button */}
                <div className="flex justify-end md:contents">
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 font-semibold disabled:opacity-50 mt-2 md:mt-0 md:p-2"
                    disabled={entries.length <= 1 || isSubmitting}
                  >
                    <span className="md:hidden">行を</span>削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datalists for suggestions */}
        <datalist id="store-options">
          {storeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
        <datalist id="payment-method-options">
          {paymentMethodOptions.map((option) => (
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
