import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign, MapPin, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { stripePayment } from '@/functions/all';
import { Transaction } from '@/entities/all';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

export default function POSPage() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const storeLocation = [30.6954, -88.0399]; // Mobile, AL

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const transactions = await Transaction.list('-created_date', 5);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const result = await stripePayment({
        amount: parseFloat(amount),
        description: description || 'POS Payment',
        customerName,
        customerEmail
      });

      if (result.data.success) {
        setShowSuccess(true);
        toast.success('Payment processed successfully!');
        
        // Reset form
        setAmount('');
        setDescription('');
        setCustomerName('');
        setCustomerEmail('');
        
        // Reload transactions
        await loadRecentTransactions();
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white mb-4">Point of Sale</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Payment Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-cyan-400" />
              New Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-400 mb-4" />
                <p className="text-white text-lg font-semibold">Payment Successful!</p>
                <p className="text-gray-400 text-sm">${amount}</p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Amount ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Description</Label>
                  <Input 
                    placeholder="Product or service"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Customer Name</Label>
                  <Input 
                    placeholder="Optional"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Customer Email</Label>
                  <Input 
                    type="email"
                    placeholder="Optional"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-600"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Process Payment'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Store Location */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-cyan-400" />
              Store Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-lg overflow-hidden">
              <MapContainer
                center={storeLocation}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <Marker position={storeLocation}>
                  <Popup>Cloud Connect Store</Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{transaction.description}</p>
                    {transaction.customer_name && (
                      <p className="text-gray-400 text-sm">{transaction.customer_name}</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {new Date(transaction.created_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold">
                      ${(transaction.amount / 100).toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-400' : 
                      transaction.status === 'failed' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}