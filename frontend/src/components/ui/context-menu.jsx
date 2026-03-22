const handleSubmit = async (e) => {
  e.preventDefault();

 try {
  const rawDate = formData.preferred_date;

  console.log("RAW DATE:", formData.preferred_date);

  const formattedDate = new Date(rawDate)
    .toISOString()
    .split("T")[0];

  console.log("FORMATTED DATE:", formattedDate);

    // 🔥 API call
    const response = await fetch("https://dishu-website.onrender.com/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...formData,
        preferred_date: formattedDate
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Booking Successful ✅");
      console.log(data);
    } else {
      alert("Failed to submit booking ❌");
      console.log(data);
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong ❌");
  }
};
