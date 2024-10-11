// Base URL for Nager.Date API (no API key required)
const nagerBaseUrl = 'https://date.nager.at/api/v3/PublicHolidays/2024/AT';

// Fetch holidays for the selected country and year from Nager.Date
async function fetchHolidaysNager(countryCode, year) {
    const url = `${nagerBaseUrl}/${year}/${countryCode}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new alert(`HTTP error! status: ${response.status}`);
        }
        const holidays = await response.json();
        return holidays;  // Nager.Date returns an array of holidays
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

// Suggest leave days based on holidays and available leave days
function suggestLeaveDaysWithInput(holidays, leaveDays) {
    let leaveSuggestions = [];
    let leaveDaysRemaining = leaveDays;

    holidays.forEach(holiday => {
        let holidayDate = new Date(holiday.date);

        if (holidayDate.getDay() === 5) {  // Friday
            if (leaveDaysRemaining > 0) {
                leaveSuggestions.push({
                    leaveDay: new Date(holidayDate.setDate(holidayDate.getDate() - 1)),
                    reason: `Extend break before ${holiday.localName}`
                });
                leaveDaysRemaining--;
            }
        } else if (holidayDate.getDay() === 1) {  // Monday
            if (leaveDaysRemaining > 0) {
                leaveSuggestions.push({
                    leaveDay: new Date(holidayDate.setDate(holidayDate.getDate() - 3)),
                    reason: `Extend break after ${holiday.localName}`
                });
                leaveDaysRemaining--;
            }
        }
    });

    return leaveSuggestions;
}

// Display leave suggestions
function displayLeaveSuggestions(leaveSuggestions) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '<h3>Leave Suggestions:</h3>';

    leaveSuggestions.forEach(suggestion => {
        suggestionsDiv.innerHTML += `<p>Take leave on ${suggestion.leaveDay.toDateString()} to ${suggestion.reason}</p>`;
    });
}

// Initialize FullCalendar and mark leave suggestions
function initializeCalendar(leaveSuggestions) {
    const calendarEl = document.getElementById('calendar');
    
    // Prepare events for FullCalendar (leave days)
    const events = leaveSuggestions.map(suggestion => ({
        title: suggestion.reason,
        start: suggestion.leaveDay.toISOString().split('T')[0],  // Format date to YYYY-MM-DD
        allDay: true
    }));
    
    // Initialize FullCalendar with events
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events
    });
    
    calendar.render();
}

// Event listener for the optimize button
document.getElementById('optimize-btn').addEventListener('click', async () => {
    const selectedCountry = document.getElementById('country').value;
    const year = document.getElementById('year').value;
    const leaveDays = parseInt(document.getElementById('leave-days').value);

    // Fetch holidays and suggest leave days
    const holidays = await fetchHolidaysNager(selectedCountry, year);
    if (holidays.length === 0) {
        alert('No holidays found for this country or year.');
        return;
    }

    const leaveSuggestions = suggestLeaveDaysWithInput(holidays, leaveDays);

    // Display suggestions
    displayLeaveSuggestions(leaveSuggestions);

    // Initialize the calendar with leave suggestions
    initializeCalendar(leaveSuggestions);
});
