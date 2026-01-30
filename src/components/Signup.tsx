"use client";

import { useState } from "react";

export default function Signup() {
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
        <form action="">
          <h2>Sign up </h2>
          <label>First & Last Name</label>
          <br />
          <input type="text" id="name" placeholder="First & Last Name" />
          <br />
          <label>Password</label> <br />
          <input type="password" id="password" placeholder="Password" />
          <br />
          <label>Email</label> <br />
          <input type="email" id="email" placeholder="Email" />
          <br />
          <label>Phone Number</label> <br />
          <input type="tel" id="number" placeholder="Phone Number" />
          <br />
          <label>Are you over 18?</label> <br />
          <input type="radio" id="age" name="drone" value="Yes" />
          <label htmlFor="Yes">Yes</label>
          <input type="radio" id="age" name="drone" value="No" />
          <label htmlFor="Yes">No</label>
          <br />
        </form>
      </div>
    </div>
  );
}
