'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';
import { supabase } from '@/lib/supabase';
import Calendar from 'react-calendar'; // You need to install this or another calendar lib
import 'react-calendar/dist/Calendar.css';

export default function ViewPage() {
  const [foodItems, setFoodItems] = useState([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   router.replace('/login');
    //   return;
    // }

    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        console.log(userId);
        const { data, error } = await supabase
          .from('food_items')
          .select('*')
          .eq('userId', userId)
          .order('exp_date', { ascending: true });

        if (error) throw new Error(error.message);

        setFoodItems(data);
      } catch (err) {
        console.error('Error loading food items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📦 Your Food Items</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
        >
          Switch to {viewMode === 'list' ? 'Calendar' : 'List'} View
        </button>
      </div>

      {/* TODO: List View */}
      {viewMode === 'list' && (
        <ul className="space-y-2">
          {foodItems.map((item) => (
            <li
              key={item.foodId}
              className="border p-4 rounded bg-white shadow flex justify-between"
            >
              <div>
                <p className="font-bold">{item.name}</p>
                <p>Brand: {item.brand}</p>
                <p>Exp: {item.exp_date}</p>
              </div>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </li>
          ))}
        </ul>
      )}

      {/* TODO: Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white p-4 rounded shadow">
          <Calendar
            tileContent={({ date }) => {
              const found = foodItems.find(
                (item) => new Date(item.exp_date).toDateString() === date.toDateString()
              );
              return found ? (
                <div className="text-red-600 text-xs font-bold">🍽</div>
              ) : null;
            }}
          />
        </div>
      )}
    </div>
  );
}
