"use client";

import React, { useState } from "react";
import styles from "../styles/contact.module.css";

export default function Contact() {
  //variable to store form data inputted by the user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  return (
    <div>
      <h2>Contact Us</h2>
      <form>
        <div>
          <label>Name</label>
          <input type="text" />
        </div>

        <div>
          <label>Email</label>
          <input type="email" />
        </div>

        <div>
          <label>Message</label>
          <textarea></textarea>
        </div>

        <button type="submit">Send</button>
      </form>
    </div>
  );
}
