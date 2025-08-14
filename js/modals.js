document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eventsGrid = document.querySelector('.events-grid');
    const modalOverlay = document.getElementById('modal');
    const closeModalBtn = document.querySelector('.close-modal'); // ✅ new name
    const bookingForm = document.getElementById('booking-form');
    
    // Current event being booked (set when Book Now is clicked)
    let currentEventId = null;

    // Fetch events from backend
    async function fetchEvents() {
        eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';
        try {
            // Replace with your actual backend endpoint
            const response = await fetch('https://church-backend-eez4.onrender.com/api/events');
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const result = await response.json();
            displayEvents(result.data);

        } catch (error) {
            console.error('Error fetching events:', error);
            // Display error message to user
            eventsGrid.innerHTML = '<p class="error-message">Failed to load events. Please try again later.</p>';
        }
    }

    // Display events in the grid
    function displayEvents(events) {
        // Clear existing events
        eventsGrid.innerHTML = '';

        if (!events || events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">No upcoming events at this time. Please check back later.</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.eventId = event.id;

            // Format date and time for display
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const imageUrl = event.imageUrl ?
                `https://church-backend-eez4.onrender.com/${event.imageUrl.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`:
                'https://via.placeholder.com/400x250?text=Event+Image';

            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${imageUrl}" alt="${event.title}">
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <span class="event-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        <span class="event-time"><i class="far fa-clock"></i> ${formattedTime}</span>
                    </div>
                    <p class="event-desc">${event.description}</p>
                    <button class="btn btn-primary book-ticket">Book a Ticket</button>
                </div>
            `;

            eventsGrid.appendChild(eventCard);
        });

        // Add event listeners to all Book Now buttons
        document.querySelectorAll('.book-ticket').forEach(button => {
            button.addEventListener('click', function() {
                const eventCard = this.closest('.event-card');
                currentEventId = eventCard.dataset.eventId;
                openModal();
            });
        });
    }

    // Modal functions
    function openModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentEventId = null;
}


    // Event listeners for modal
   closeModalBtn.addEventListener('click', closeModal); // ✅ use the renamed variable
modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});


    // Handle form submission
    bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Show loader
  document.getElementById('booking-loader').style.display = 'flex';

  const formData = {
    eventId: currentEventId,
    attendee: {
      name: document.getElementById('booking-name').value,
      phone: document.getElementById('booking-phone').value,
      location: document.getElementById('booking-location').value,
      email: document.getElementById('booking-email').value,
    },
    totalTickets: document.getElementById('booking-guests').value
  };

//   https://church-backend-eez4.onrender.com

  try {
    const res = await fetch('https://church-backend-eez4.onrender.com/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    // Hide loader
    document.getElementById('booking-loader').style.display = 'none';

    if (res.ok && data.success) {
  // Show toast
  const toast = document.getElementById('success-toast');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);

  // Reset form and close modal
  e.target.reset();
  closeModal();
}
else {
      alert('Booking failed: ' + (data.error || 'Please try again.'));
    }

  } catch (error) {
    console.error('Booking error:', error);
    alert('An error occurred. Please try again.');
    document.getElementById('booking-loader').style.display = 'none';
  }
});


    // Initialize the page
    fetchEvents();
});