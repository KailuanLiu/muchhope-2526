// const BASE_URL = "http://localhost:5000/events";

// export const getEvents = async () => {
//   const res = await fetch(BASE_URL);
//   return res.json();
// };

// export const createEvent = async (eventData) => {
//   const res = await fetch(BASE_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(eventData),
//   });
//   return res.json();
// };

// export const updateEvent = async (id, updates) => {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(updates),
//   });
//   return res.json();
// };

// export const deleteEvent = async (id) => {
//   const res = await fetch(`${BASE_URL}/${id}`, {
//     method: "DELETE",
//   });
//   return res.json();
// };
