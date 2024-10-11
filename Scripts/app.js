//API Key

const HOLIDAY_API_URL = 'https://date.nager.at/Api/v3/PublicHolidays/';

async function fetchHolidays(countryCode, year) {
  const url = `${HOLIDAY_API_URL}${year}/${countryCode}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }
    const holidays = await response.json();
    return holidays;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
}

function optimizeLeaveDays(holidays, leaveDays) {
  let optimizedLeave = [];
  let remainingLeaveDays = leaveDays;

  // Sort holidays by date
  holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Loop through holidays to suggest the best days for leave
  holidays.forEach(holiday => {
    let holidayDate = new Date(holiday.date);
    let dayBefore = new Date(holidayDate);
    dayBefore.setDate(holidayDate.getDate() - 1);
    let dayAfter = new Date(holidayDate);
    dayAfter.setDate(holidayDate.getDate() + 1);

    // Check if the user has enough leave days and if the days are workdays (Mon-Fri)
    if (remainingLeaveDays > 0 && dayBefore.getDay() >= 1 && dayBefore.getDay() <= 5) {
      optimizedLeave.push(dayBefore.toDateString());
      remainingLeaveDays--;
    }
    if (remainingLeaveDays > 0 && dayAfter.getDay() >= 1 && dayAfter.getDay() <= 5) {
      optimizedLeave.push(dayAfter.toDateString());
      remainingLeaveDays--;
    }
  });

  return optimizedLeave;
}

function displaySuggestions(leaveDays) {
  const suggestionsDiv = document.getElementById('suggestions');
  suggestionsDiv.innerHTML = '';

  if (leaveDays.length === 0) {
    suggestionsDiv.innerHTML = '<p>No optimized leave days found.</p>';
  } else {
    const list = document.createElement('ul');
    leaveDays.forEach(day => {
      const listItem = document.createElement('li');
      listItem.textContent = day;
      list.appendChild(listItem);
    });
    suggestionsDiv.appendChild(list);
  }
}

// Initialize FullCalendar and render leave days and public holidays as events
function renderCalendar(leaveDays, holidays) {
    const calendarEl = document.getElementById('calendar');
    
    // Prepare events for leave days
    const leaveEvents = leaveDays.map(day => ({
      title: 'Leave Day',
      start: new Date(day),  // Add leave day as event
      backgroundColor: '#28a745',  // Optional: green color for leave days
      borderColor: '#28a745',
    }));
  
    // Prepare events for public holidays
    const holidayEvents = holidays.map(holiday => ({
      title: holiday.localName,  // Use holiday name as the title
      start: holiday.date,       // Use the holiday date
      backgroundColor: '#dc3545',  // Optional: red color for public holidays
      borderColor: '#dc3545',
    }));
  
    // Combine both events
    const allEvents = [...leaveEvents, ...holidayEvents];
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: allEvents,  // Add all events (leave days and public holidays)
    });
  
    calendar.render();
  }
  
  // Event listener for the Optimize Leave Days button
  document.getElementById('optimize-btn').addEventListener('click', async (event) => {
    event.preventDefault();
  
    const countryCode = document.getElementById('countryCode').value;
    const year = document.getElementById('year').value;
    const leaveDays = parseInt(document.getElementById('leave-days').value, 10);
  
    // Fetch holidays
    const holidays = await fetchHolidays(countryCode, year);
  
    // Optimize leave days based on holidays
    const optimizedLeave = optimizeLeaveDays(holidays, leaveDays);
  
    // Display optimized leave suggestions
    displaySuggestions(optimizedLeave);
  
    // Render calendar with optimized leave days and public holidays
    renderCalendar(optimizedLeave, holidays);
  });
  