import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";

const DAYS_IN_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    return storedEvents ? JSON.parse(storedEvents) : {};
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [newEvent, setNewEvent] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const grid = [];
    let currentWeek = Array(7).fill(null);

    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek[i] = null;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDayOfMonth + day - 1) % 7;
      currentWeek[dayOfWeek] = day;

      if (dayOfWeek === 6 || day === daysInMonth) {
        grid.push([...currentWeek]);
        currentWeek = Array(7).fill(null);
      }
    }

    return grid;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDay(null);
    setNewEvent({
      name: "",
      startTime: "",
      endTime: "",
    });
  };

  const handleAddEvent = () => {
    const dayKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`;

    // Validate event input
    if (!newEvent.name || !newEvent.startTime || !newEvent.endTime) {
      alert("Please fill in all fields.");
      return;
    }

    const start = new Date(`1970-01-01T${newEvent.startTime}:00`);
    const end = new Date(`1970-01-01T${newEvent.endTime}:00`);

    if (start >= end) {
      alert("End time must be after start time.");
      return;
    }

    // Prevent overlapping events
    const existingEvents = events[dayKey] || [];
    const hasOverlap = existingEvents.some((event) => {
      const existingStart = new Date(`1970-01-01T${event.startTime}:00`);
      const existingEnd = new Date(`1970-01-01T${event.endTime}:00`);
      return (
        (start >= existingStart && start < existingEnd) ||
        (end > existingStart && end <= existingEnd)
      );
    });

    if (hasOverlap) {
      alert("This event overlaps with an existing event.");
      return;
    }

    // Add the event
    setEvents((prev) => ({
      ...prev,
      [dayKey]: [...(prev[dayKey] || []), newEvent],
    }));

    handleModalClose();
  };

  const filteredEvents = filterKeyword
    ? Object.entries(events).reduce((acc, [key, dayEvents]) => {
        const filtered = dayEvents.filter((event) =>
          event.name.toLowerCase().includes(filterKeyword.toLowerCase())
        );
        if (filtered.length > 0) acc[key] = filtered;
        return acc;
      }, {})
    : events;

  const calendarGrid = generateCalendarGrid();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  return (
    <div className="container m-4">
      <div className="text-center mb-3">
        <Button variant="outlined" onClick={handlePrevMonth}>
          Previous
        </Button>
        <h2 className="d-inline-block mx-2">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <Button variant="outlined" onClick={handleNextMonth}>
          Next
        </Button>
      </div>

      <TextField
        label="Filter events by keyword"
        variant="outlined"
        fullWidth
        className="mb-3"
        value={filterKeyword}
        onChange={(e) => setFilterKeyword(e.target.value)}
      />

      <div className="row text-center">
        {DAYS_IN_WEEK.map((day) => (
          <div key={day} className="col border bg-light fw-bold py-2">
            {day}
          </div>
        ))}
      </div>

      {calendarGrid.map((week, weekIndex) => (
        <div key={weekIndex} className="row">
          {week.map((date, dayIndex) => {
            const dayKey = `${year}-${month + 1}-${date}`;
            const hasFilteredEvents = filteredEvents[dayKey]?.length > 0;
            const isToday =
              today.getDate() === date &&
              today.getMonth() === month &&
              today.getFullYear() === year;

            return (
              <div
                key={dayIndex}
                className={`col border py-4 text-center ${
                  isToday
                    ? "bg-black text-light"
                    : hasFilteredEvents
                    ? "border-success"
                    : ""
                }`}
                style={{ cursor: date ? "pointer" : "default" }}
                onClick={() => date && handleDayClick(date)}
              >
                {date}
              </div>
            );
          })}
        </div>
      ))}

      <Dialog open={showModal} onClose={handleModalClose}>
        <DialogTitle>Events for {selectedDay}</DialogTitle>
        <DialogContent>
          <ul>
            {(filteredEvents[
              `${year}-${month + 1}-${selectedDay}`
            ] || []).map((event, idx) => (
              <li key={idx}>
                {event.name} ({event.startTime} - {event.endTime})
              </li>
            ))}
          </ul>
          <TextField
            label="Event Name"
            variant="outlined"
            fullWidth
            className="my-2"
            value={newEvent.name}
            onChange={(e) =>
              setNewEvent({ ...newEvent, name: e.target.value })
            }
          />
          <TextField
            label="Start Time"
            type="time"
            variant="outlined"
            fullWidth
            className="my-2"
            value={newEvent.startTime}
            onChange={(e) =>
              setNewEvent({ ...newEvent, startTime: e.target.value })
            }
          />
          <TextField
            label="End Time"
            type="time"
            variant="outlined"
            fullWidth
            className="my-2"
            value={newEvent.endTime}
            onChange={(e) =>
              setNewEvent({ ...newEvent, endTime: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAddEvent} variant="contained" color="primary">
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Calendar;
