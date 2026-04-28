// frontend/src/components/Donation.tsx
"use client";

import React, { useMemo, useState } from "react";
import AuthLayout from "@/app/AuthLayout";
import styles from "@/styles/donation.module.css";

const presetAmounts = ["25", "50", "75", "100"];
const impactCards = [
  {
    amount: "25",
    description: "Provides a warm meal and hygiene kit for one person",
  },
  {
    amount: "50",
    description: "Funds two nights of emergency shelter access",
  },
  {
    amount: "75",
    description: "Supplies a week of groceries for a family in need",
  },
  {
    amount: "100",
    description: "Covers job-readiness training for one individual",
  },
  {
    amount: "250",
    description: "Funds a month of case-management services",
  },
];

const paymentTypes = [
  {
    type: "Credit Card",
    icon: "CC",
    name: "Credit Card",
    description: "Visa, Mastercard, Amex, Discover",
  },
  {
    type: "Debit Card",
    icon: "DB",
    name: "Debit Card",
    description: "Pay directly from your bank account",
  },
  {
    type: "PayPal",
    icon: "PP",
    name: "PayPal",
    description: "Fast and secure via your PayPal balance",
  },
  {
    type: "Bank Transfer",
    icon: "ACH",
    name: "Bank Transfer",
    description: "ACH direct transfer, no card needed",
  },
];

type Frequency = "One-time" | "Monthly";
type PaymentType = "Credit Card" | "Debit Card" | "PayPal" | "Bank Transfer";
type DonationStep = 1 | 2 | 3 | 4;

export default function Donation() {
  const [step, setStep] = useState<DonationStep>(1);
  const [frequency, setFrequency] = useState<Frequency>("One-time");
  const [selectedAmount, setSelectedAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [highlightedImpact, setHighlightedImpact] = useState("25");
  const [coverExpenses, setCoverExpenses] = useState(false);
  const [addMessage, setAddMessage] = useState(false);
  const [personalMessage, setPersonalMessage] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("Credit Card");
  const [billingOpen, setBillingOpen] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    paypalEmail: "",
    accountHolderName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "Checking",
    streetAddress: "",
    city: "",
    zip: "",
    country: "United States",
  });

  const amountForContinue = customAmount || selectedAmount;
  const numericAmount = Number(amountForContinue || 0);
  const totalAmount = useMemo(() => {
    if (!Number.isFinite(numericAmount)) {
      return 0;
    }

    return coverExpenses ? numericAmount * 1.03 : numericAmount;
  }, [coverExpenses, numericAmount]);

  const frequencyLabel = frequency === "Monthly" ? "Monthly recurring gift" : "One-time gift";

  const updatePaymentDetails = (field: keyof typeof paymentDetails, value: string) => {
    setPaymentDetails((current) => ({ ...current, [field]: value }));
  };

  const selectAmount = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setHighlightedImpact(amount);
  };

  const clearPills = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(value);
    setHighlightedImpact("");
  };

  const selectImpact = (amount: string) => {
    setHighlightedImpact(amount);
    setSelectedAmount(amount);

    if (presetAmounts.includes(amount)) {
      setCustomAmount("");
      return;
    }

    setCustomAmount(amount);
  };

  const validateAmount = () => {
    return amountForContinue && Number.isFinite(numericAmount) && numericAmount >= 5;
  };

  const goToStep = (nextStep: DonationStep) => {
    if (nextStep === 2 && !validateAmount()) {
      window.alert("Please select or enter a donation amount of at least $5.");
      return;
    }

    setStep(nextStep);
  };

  const formatCardNumber = (value: string) => {
    return (
      value
        .replace(/\D/g, "")
        .substring(0, 16)
        .match(/.{1,4}/g)
        ?.join("  ") ?? value.replace(/\D/g, "")
    );
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").substring(0, 4);
    if (digits.length < 3) {
      return digits;
    }

    return `${digits.substring(0, 2)} / ${digits.substring(2)}`;
  };

  const submitDonation = () => {
    const donationData = {
      amount: numericAmount,
      totalAmount: Number(totalAmount.toFixed(2)),
      frequency,
      coverTransactionExpenses: coverExpenses,
      personalMessage: addMessage ? personalMessage.trim() : "",
      paymentType,
      paymentDetails,
    };

    console.log("Donation data:", donationData);
    setStep(4);
  };

  const restart = () => {
    setStep(1);
    setFrequency("One-time");
    setSelectedAmount("25");
    setCustomAmount("");
    setHighlightedImpact("25");
    setCoverExpenses(false);
    setAddMessage(false);
    setPersonalMessage("");
    setPaymentType("Credit Card");
    setBillingOpen(false);
    setPaymentDetails({
      nameOnCard: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      paypalEmail: "",
      accountHolderName: "",
      routingNumber: "",
      accountNumber: "",
      accountType: "Checking",
      streetAddress: "",
      city: "",
      zip: "",
      country: "United States",
    });
  };

  return (
    <AuthLayout>
      <div className={styles.page}>
        <section className={styles.left}>
          <div className={styles.heroImagePlaceholder}>
            <img src="/cat-placeholder.jpg" alt="" />
          </div>

          <div className={styles.heroText}>
            <h2>
              You Can
              <br />
              <em>Give Hope</em>
            </h2>
            <p>
              Your gift helps us provide meals, shelter, and resources to the homeless community - transforming lives
              one day at a time.
            </p>
          </div>

          {step > 1 && step < 4 ? (
            <div className={styles.orderSummary}>
              <div className={styles.orderSummaryLabel}>Your Gift Summary</div>
              <div className={styles.orderRow}>
                <span className={styles.orderLabel}>Donation</span>
                <span className={styles.orderValue}>${numericAmount || 0}</span>
              </div>
              <div className={styles.orderRow}>
                <span className={styles.orderLabel}>Frequency</span>
                <span className={styles.orderValue}>{frequency}</span>
              </div>
              {step > 2 ? (
                <div className={styles.orderRow}>
                  <span className={styles.orderLabel}>Method</span>
                  <span className={styles.orderValue}>{paymentType}</span>
                </div>
              ) : null}
              <div className={`${styles.orderRow} ${styles.orderTotal}`}>
                <span className={styles.orderLabel}>Total</span>
                <span className={styles.orderValue}>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ) : null}
        </section>

        <section className={styles.right}>
          <nav className={styles.steps} aria-label="Donation steps">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`${styles.step} ${step === stepNumber ? styles.stepActive : ""} ${
                  step > stepNumber ? styles.stepDone : ""
                }`}
              >
                <span className={styles.stepCheck}>✓</span>
                {stepNumber === 1 ? "My Gift" : stepNumber === 2 ? "Payment Type" : "Payment Details"}
              </div>
            ))}
          </nav>

          {step < 4 ? (
            <div className={styles.formArea}>
              {step === 1 ? (
                <section className={styles.panel}>
                  <div className={styles.frequencyToggle}>
                    <button
                      type="button"
                      className={`${styles.freqBtn} ${frequency === "One-time" ? styles.freqActive : ""}`}
                      onClick={() => setFrequency("One-time")}
                    >
                      One-Time
                    </button>
                    <button
                      type="button"
                      className={`${styles.freqBtn} ${frequency === "Monthly" ? styles.freqActive : ""}`}
                      onClick={() => setFrequency("Monthly")}
                    >
                      <span className={styles.heart} aria-hidden="true">
                        &#9825;
                      </span>
                      Monthly
                    </button>
                  </div>

                  <p className={styles.sectionLabel}>
                    Choose a {frequency === "Monthly" ? "Monthly" : "One-Time"} Amount
                  </p>

                  <div className={styles.amountGrid}>
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`${styles.amountPill} ${
                          !customAmount && selectedAmount === amount ? styles.amountSelected : ""
                        }`}
                        onClick={() => selectAmount(amount)}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  <div className={styles.customAmountWrapper}>
                    <span className={styles.dollar}>$</span>
                    <input
                      type="number"
                      className={styles.customAmountInput}
                      placeholder="Other Amount"
                      min="1"
                      value={customAmount}
                      onChange={(e) => clearPills(e.target.value)}
                    />
                  </div>
                  <p className={styles.customAmountHint}>Minimum donation is $5</p>

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={coverExpenses}
                        onChange={(e) => setCoverExpenses(e.target.checked)}
                      />
                      Cover transaction expenses (~3%)
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={addMessage}
                        onChange={(e) => {
                          setAddMessage(e.target.checked);
                          if (!e.target.checked) {
                            setPersonalMessage("");
                          }
                        }}
                      />
                      Add a personal message
                    </label>
                  </div>

                  {addMessage ? (
                    <div className={styles.messageField}>
                      <label htmlFor="personalMessage" className={styles.messageLabel}>
                        Personal message
                      </label>
                      <textarea
                        id="personalMessage"
                        className={styles.messageTextarea}
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write your message here..."
                        rows={4}
                      />
                    </div>
                  ) : null}

                  <button className={styles.continueBtn} type="button" onClick={() => goToStep(2)}>
                    Continue
                  </button>

                  <div className={styles.secureFooter}>
                    <span className={styles.lock} aria-hidden="true" />
                    Secure Donation - Your information is protected
                  </div>
                  <div className={styles.paymentLogos}>
                    <div className={styles.paymentLogo}>Visa</div>
                    <div className={styles.paymentLogo}>MC</div>
                    <div className={styles.paymentLogo}>PayPal</div>
                    <div className={styles.paymentLogo}>Amex</div>
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section className={styles.panel}>
                  <p className={styles.sectionLabel}>Select a Payment Method</p>
                  <div className={styles.paymentTypeGrid}>
                    {paymentTypes.map((payment) => (
                      <button
                        key={payment.type}
                        type="button"
                        className={`${styles.paymentTypeCard} ${
                          paymentType === payment.type ? styles.paymentTypeSelected : ""
                        }`}
                        onClick={() => setPaymentType(payment.type as PaymentType)}
                      >
                        <span className={styles.paymentTypeCheck}>✓</span>
                        <span className={styles.paymentTypeIcon}>{payment.icon}</span>
                        <span className={styles.paymentTypeName}>{payment.name}</span>
                        <span className={styles.paymentTypeDesc}>{payment.description}</span>
                      </button>
                    ))}
                  </div>
                  <button className={styles.continueBtn} type="button" onClick={() => goToStep(3)}>
                    Continue
                  </button>
                  <button className={styles.backBtn} type="button" onClick={() => goToStep(1)}>
                    Back
                  </button>
                  <div className={styles.secureFooter}>
                    <span className={styles.lock} aria-hidden="true" />
                    All payment methods are encrypted and secure
                  </div>
                </section>
              ) : null}

              {step === 3 ? (
                <section className={styles.panel}>
                  {paymentType === "Credit Card" || paymentType === "Debit Card" ? (
                    <>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Name on Card</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          placeholder="Jane Smith"
                          value={paymentDetails.nameOnCard}
                          onChange={(e) => updatePaymentDetails("nameOnCard", e.target.value)}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Card Number</label>
                        <div className={styles.cardInputWrapper}>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="1234  5678  9012  3456"
                            maxLength={22}
                            value={paymentDetails.cardNumber}
                            onChange={(e) => updatePaymentDetails("cardNumber", formatCardNumber(e.target.value))}
                          />
                          <span className={styles.cardIcon}>card</span>
                        </div>
                      </div>
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>Expiry</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="MM / YY"
                            maxLength={7}
                            value={paymentDetails.expiry}
                            onChange={(e) => updatePaymentDetails("expiry", formatExpiry(e.target.value))}
                          />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>CVV</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="123"
                            maxLength={4}
                            value={paymentDetails.cvv}
                            onChange={(e) => updatePaymentDetails("cvv", e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}

                  {paymentType === "PayPal" ? (
                    <div className={styles.paypalInfo}>
                      <div className={styles.paypalLogoBig}>PayPal</div>
                      <p>Enter your PayPal email below. You will be redirected to complete payment securely.</p>
                      <input
                        type="email"
                        className={styles.fieldInput}
                        placeholder="your@paypal.com"
                        value={paymentDetails.paypalEmail}
                        onChange={(e) => updatePaymentDetails("paypalEmail", e.target.value)}
                      />
                    </div>
                  ) : null}

                  {paymentType === "Bank Transfer" ? (
                    <>
                      <div className={styles.bankInfo}>
                        <p>
                          <strong>ACH Bank Transfer</strong> - Transfers typically process in 2-3 business days.
                        </p>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Account Holder Name</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          placeholder="Jane Smith"
                          value={paymentDetails.accountHolderName}
                          onChange={(e) => updatePaymentDetails("accountHolderName", e.target.value)}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Routing Number</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          placeholder="9-digit routing number"
                          maxLength={9}
                          value={paymentDetails.routingNumber}
                          onChange={(e) => updatePaymentDetails("routingNumber", e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Account Number</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          placeholder="Account number"
                          value={paymentDetails.accountNumber}
                          onChange={(e) => updatePaymentDetails("accountNumber", e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Account Type</label>
                        <select
                          className={styles.fieldInput}
                          value={paymentDetails.accountType}
                          onChange={(e) => updatePaymentDetails("accountType", e.target.value)}
                        >
                          <option>Checking</option>
                          <option>Savings</option>
                        </select>
                      </div>
                    </>
                  ) : null}

                  <button
                    type="button"
                    className={`${styles.billingToggle} ${billingOpen ? styles.billingOpen : ""}`}
                    onClick={() => setBillingOpen((current) => !current)}
                  >
                    <span>
                      Billing Address <span className={styles.optionalText}>(optional)</span>
                    </span>
                    <span className={styles.toggleArrow}>▼</span>
                  </button>

                  {billingOpen ? (
                    <div className={styles.billingFields}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Street Address</label>
                        <input
                          type="text"
                          className={styles.fieldInput}
                          placeholder="123 Main St"
                          value={paymentDetails.streetAddress}
                          onChange={(e) => updatePaymentDetails("streetAddress", e.target.value)}
                        />
                      </div>
                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>City</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="City"
                            value={paymentDetails.city}
                            onChange={(e) => updatePaymentDetails("city", e.target.value)}
                          />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>ZIP</label>
                          <input
                            type="text"
                            className={styles.fieldInput}
                            placeholder="ZIP Code"
                            maxLength={10}
                            value={paymentDetails.zip}
                            onChange={(e) => updatePaymentDetails("zip", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Country</label>
                        <select
                          className={styles.fieldInput}
                          value={paymentDetails.country}
                          onChange={(e) => updatePaymentDetails("country", e.target.value)}
                        >
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Australia</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  ) : null}

                  <button
                    className={`${styles.continueBtn} ${styles.greenButton}`}
                    type="button"
                    onClick={submitDonation}
                  >
                    Complete Donation
                  </button>
                  <button className={styles.backBtn} type="button" onClick={() => goToStep(2)}>
                    Back
                  </button>
                  <div className={styles.secureFooter}>
                    <span className={styles.lock} aria-hidden="true" />
                    256-bit SSL - Your card is never stored
                  </div>
                  <div className={styles.paymentLogos}>
                    <div className={styles.paymentLogo}>Visa</div>
                    <div className={styles.paymentLogo}>MC</div>
                    <div className={styles.paymentLogo}>PayPal</div>
                    <div className={styles.paymentLogo}>Amex</div>
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className={styles.successScreen}>
              <div className={styles.successCircle}>✓</div>
              <div className={styles.successAmount}>${numericAmount}</div>
              <div className={styles.successFreq}>{frequencyLabel}</div>
              <h2>Thank You!</h2>
              <p>Your generous gift is making a real difference in the lives of those in need.</p>
              <p>A receipt has been sent to your email address.</p>
              <button className={styles.restartBtn} type="button" onClick={restart}>
                Make another donation
              </button>
            </div>
          )}
        </section>

        {step === 1 ? (
          <section className={styles.impactSection}>
            <p className={styles.impactLabel}>Your gift in action</p>
            <div className={styles.impactCards}>
              {impactCards.map((card) => (
                <button
                  key={card.amount}
                  type="button"
                  className={`${styles.impactCard} ${
                    highlightedImpact === card.amount ? styles.impactHighlighted : ""
                  }`}
                  onClick={() => selectImpact(card.amount)}
                >
                  <span className={styles.impactAmount}>${card.amount}</span>
                  <span className={styles.impactDesc}>{card.description}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AuthLayout>
  );
}
