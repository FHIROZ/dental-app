import React, { useState, useEffect } from 'react';
import { AI_AGENT_PHONE } from '../constants';
import { chatWithGemini } from '../services/geminiService';
import { createBooking, fetchBookings } from '../services/calService';
import { Booking } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

interface PatientDashboardProps {
  userEmail: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'manual' | 'history'>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hello! I am the DentalCare AI assistant. How can I help you book an appointment today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Manual Booking State
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: userEmail || '',
    date: '',
    time: '',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // History State
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- Chat Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: inputMsg }];
    setMessages(newMessages);
    setInputMsg('');
    setChatLoading(true);

    try {
      // Format history for Gemini
      const geminiHistory = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithGemini(geminiHistory, inputMsg);
      
      setMessages([...newMessages, { role: 'model', text: response }]);
      
      // If booking was successful in chat (heuristically checked here, but really handled in service),
      // we could refresh history.
      if (response.toLowerCase().includes("booked") || response.toLowerCase().includes("confirmed")) {
         fetchHistory(); // refresh in background
      }

    } catch (err) {
      setMessages([...newMessages, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- Manual Booking Logic ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingSuccess(null);

    const startDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`).toISOString();
    
    const result = await createBooking(bookingForm.name, bookingForm.email, startDateTime, bookingForm.notes);
    
    if (result.success) {
      setBookingSuccess("Appointment confirmed! A confirmation email has been sent.");
      setBookingForm({ ...bookingForm, notes: '', date: '', time: '' });
      fetchHistory(); // Refresh history
    } else {
      alert(`Booking failed: ${result.error}`);
    }
    setBookingLoading(false);
  };

  // --- History Logic ---
  const fetchHistory = async () => {
    setHistoryLoading(true);
    const allBookings = await fetchBookings();
    // Filter by user email (mock auth check)
    const userBookings = allBookings.filter(b => 
      b.attendees.some(a => a.email.toLowerCase() === userEmail.toLowerCase()) || 
      b.attendees.some(a => a.email.toLowerCase() === bookingForm.email.toLowerCase())
    );
    setMyBookings(userBookings);
    setHistoryLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="space-y-8">
      {/* AI Call Agent Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
             Prefer to Call?
          </h2>
          <p className="opacity-90 mt-1">Our AI Voice Agent is available 24/7 to take your call.</p>
        </div>
        <a href={`tel:${AI_AGENT_PHONE}`} className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow hover:bg-indigo-50 transition transform hover:scale-105">
          {AI_AGENT_PHONE}
        </a>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'chat' ? 'border-b-2 border-teal-600 text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            AI Chat Assistant
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'manual' ? 'border-b-2 border-teal-600 text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Manual Booking
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'history' ? 'border-b-2 border-teal-600 text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            My Appointments
          </button>
        </div>

        <div className="p-6">
          {/* TAB: Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[500px]">
              <div className="flex-grow overflow-y-auto mb-4 space-y-4 px-2 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-teal-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                   <div className="flex justify-start">
                     <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                     </div>
                   </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
                <input 
                  type="text" 
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type your request (e.g., 'Book a cleaning for tomorrow at 2pm')..."
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  disabled={chatLoading}
                />
                <Button type="submit" isLoading={chatLoading}>Send</Button>
              </form>
            </div>
          )}

          {/* TAB: Manual Form */}
          {activeTab === 'manual' && (
            <div className="max-w-xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Book an Appointment</h3>
              {bookingSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <div>
                    <p className="font-semibold">Success!</p>
                    <p className="text-sm">{bookingSuccess}</p>
                    <button onClick={() => setBookingSuccess(null)} className="text-green-800 underline mt-2 text-sm">Book another</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <Input 
                    label="Full Name" 
                    value={bookingForm.name} 
                    onChange={e => setBookingForm({...bookingForm, name: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    value={bookingForm.email} 
                    onChange={e => setBookingForm({...bookingForm, email: e.target.value})} 
                    required 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Date" 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingForm.date} 
                      onChange={e => setBookingForm({...bookingForm, date: e.target.value})} 
                      required 
                    />
                    <Input 
                      label="Time" 
                      type="time" 
                      value={bookingForm.time} 
                      onChange={e => setBookingForm({...bookingForm, time: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit / Notes</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none h-24 resize-none"
                      value={bookingForm.notes}
                      onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full" isLoading={bookingLoading}>Confirm Booking</Button>
                </form>
              )}
            </div>
          )}

          {/* TAB: History */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Your Appointment History</h3>
                <Button variant="outline" onClick={fetchHistory} className="text-xs px-2 py-1">Refresh</Button>
              </div>
              
              {historyLoading ? (
                 <div className="text-center py-10 text-gray-500">Loading appointments...</div>
              ) : myBookings.length === 0 ? (
                 <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No appointments found for {userEmail}.</p>
                    <p className="text-xs text-gray-400 mt-1">Make sure you used this email when booking.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map(booking => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{booking.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">ID: {booking.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {booking.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;