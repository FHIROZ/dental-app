import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { fetchBookings, deleteBooking } from '../services/calService';
import Button from '../components/Button';

const DoctorDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    const data = await fetchBookings();
    
    // Sort by date
    const sorted = data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Filter for today and future
    const now = new Date();
    now.setHours(0,0,0,0);
    const upcoming = sorted.filter(b => new Date(b.startTime) >= now);

    setBookings(upcoming);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    setDeletingId(id);
    const success = await deleteBooking(id);
    if (success) {
      setBookings(prev => prev.filter(b => b.id !== id));
    } else {
      alert("Failed to delete booking. Please try again.");
    }
    setDeletingId(null);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Appointments Dashboard</h1>
           <p className="text-gray-500">Manage your upcoming dental consultations.</p>
        </div>
        <Button onClick={loadBookings} variant="outline" className="text-sm">
          Refresh List
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Upcoming Appointments</h3>
          <p className="text-gray-500 mt-1">You are all clear for the upcoming schedule!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    {booking.status || 'Confirmed'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{booking.title}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {formatDate(booking.startTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {booking.attendees[0]?.name || booking.attendees[0]?.email || 'Unknown Patient'}
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {booking.attendees[0]?.email}
                  </div>
                </div>
                {booking.description && (
                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                    Notes: {booking.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <Button 
                  variant="danger" 
                  onClick={() => handleDelete(booking.id)}
                  isLoading={deletingId === booking.id}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;