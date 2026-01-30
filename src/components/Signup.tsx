"use client";

import { useState } from "react";

export default function Signup() {
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    number: "",
    age: "",
  });
  return (
    <div className="">
      <h1>Sign Up or Login to your Account</h1>

      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <h2>Sign up </h2>
          <label>First & Last Name</label>
          <br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="First & Last Name"
          />
          <br />
          <label>Password</label> <br />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <br />
          <label>Email</label> <br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          <br />
          <label>Phone Number</label> <br />
          <input type="tel" name="number" value={formData.number} onChange={handleChange} placeholder="Phone Number" />
          <br />
          <label>Are you over 18?</label> <br />
          <input
            type="radio"
            id="over18"
            name="age"
            value="Yes"
            checked={formData.age === "Yes"}
            onChange={handleChange}
          />
          <label htmlFor="over18">Yes</label>
          <input
            type="radio"
            id="under18"
            name="age"
            value="No"
            checked={formData.age === "No"}
            onChange={handleChange}
          />
          <label htmlFor="under18">No</label>
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
