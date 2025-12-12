import { CAL_API_KEY, CAL_BASE_URL, CAL_EVENT_TYPE_ID } from '../constants';
import { Booking, BookingPayload } from '../types';

export const fetchBookings = async (): Promise<Booking[]> => {
  try {
    const response = await fetch(`${CAL_BASE_URL}/bookings?apiKey=${CAL_API_KEY}&eventTypeId=${CAL_EVENT_TYPE_ID}`);
    if (!response.ok) {
      throw new Error(`Error fetching bookings: ${response.statusText}`);
    }
    const data = await response.json();
    return data.bookings || [];
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
};

export const createBooking = async (
  name: string,
  email: string,
  startTime: string,
  notes: string = ""
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Basic validation
    if (!name || !email || !startTime) {
      return { success: false, error: "Missing required fields" };
    }

    // Calculate end time (default to 30 minutes if not specified)
    // Providing an end time is often required or safer for Cal.com API v1
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60000); // 30 minutes duration

    const payload: BookingPayload = {
      eventTypeId: CAL_EVENT_TYPE_ID,
      start: start.toISOString(),
      end: end.toISOString(),
      responses: {
        name: name,
        email: email,
        notes: notes || ""
      },
      metadata: {},
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "en"
    };

    const response = await fetch(`${CAL_BASE_URL}/bookings?apiKey=${CAL_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Cal.com Booking API Error:", data);
        const errorMsg = data.message || "Failed to create booking";
        return { success: false, error: errorMsg };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Booking creation failed:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

export const deleteBooking = async (bookingId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${CAL_BASE_URL}/bookings/${bookingId}?apiKey=${CAL_API_KEY}`, {
      method: 'DELETE',
    });
    
    // Some APIs return 200 or 204 for delete
    return response.ok;
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return false;
  }
};