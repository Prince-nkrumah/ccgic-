document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eventsGrid = document.querySelector('.events-grid');
    const modalOverlay = document.getElementById('modal');
    const closeModalBtn = document.querySelector('.close-modal'); 
    const bookingForm = document.getElementById('booking-form');

    let currentEventId = null;

    // Determine backend base URL (local vs deployed)
    const BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://cosmic-church.onrender.com';

    // Fetch events from backend
    async function fetchEvents() {
        eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';
        try {
            const response = await fetch(`${BASE_URL}/api/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            const result = await response.json();

            // Log the full event objects
            console.log('Fetched events:', result.data);

            displayEvents(result.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            eventsGrid.innerHTML = '<p class="error-message">Failed to load events. Please try again later.</p>';
        }
    }

    // Display events in the grid
    function displayEvents(events) {
        eventsGrid.innerHTML = '';

        if (!events || events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-events">No upcoming events at this time. Please check back later.</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.eventId = event.id;

            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            // Generate image URL
            const imageUrl = event.imageUrl
                ? `${BASE_URL}/${event.imageUrl.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`
                : 'https://via.placeholder.com/400x250?text=Event+Image';

            // Log each image URL
            console.log('Image URL for event:', imageUrl);

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

        // Event listeners for Book Now buttons
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

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });

    // Booking form submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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

        try {
            const res = await fetch(`${BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            document.getElementById('booking-loader').style.display = 'none';

            if (res.ok && data.success) {
                const toast = document.getElementById('success-toast');
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 4000);
                e.target.reset();
                closeModal();
            } else {
                alert('Booking failed: ' + (data.error || 'Please try again.'));
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred. Please try again.');
            document.getElementById('booking-loader').style.display = 'none';
        }
    });

    // Initialize page
    fetchEvents();
});
