(() => {
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll(".nav-links a, .footer-links a").forEach((link) => {
    const linkPath = new URL(link.href, window.location.href).pathname.toLowerCase();
    if (linkPath === currentPath) link.setAttribute("aria-current", "page");
  });

  const form = document.querySelector("#enquiry-form");
  if (form) {
    form.noValidate = true;
    const fields = [...form.querySelectorAll("input, textarea")];
    const message = form.elements.namedItem("message");
    const counter = document.querySelector("#message-count");
    const status = document.querySelector("#enquiry-status");

    const errorElement = (field) => {
      const errorId = `${field.id}-error`;
      let error = document.getElementById(errorId);
      if (!error) {
        error = document.createElement("span");
        error.className = "field-error";
        error.id = errorId;
        error.setAttribute("aria-live", "polite");
        field.insertAdjacentElement("afterend", error);
      }
      return error;
    };

    const validate = (field) => {
      const value = field.value.trim();
      let messageText = "";
      field.setCustomValidity("");

      if (field.required && !value) {
        messageText = "This field is required.";
      } else if (field.id === "name" && value.length < 2) {
        messageText = "Enter a name with at least 2 characters.";
      } else if (field.id === "subject" && value.length < 3) {
        messageText = "Enter a subject with at least 3 characters.";
      } else if (field.id === "message" && value.length < 10) {
        messageText = "Please include at least 10 characters in your message.";
      } else if (field.id === "phone" && value && !/^[+0-9() -]{7,20}$/.test(value)) {
        messageText = "Use 7 to 20 digits, spaces, parentheses, plus signs, or hyphens.";
      } else if (field.validity.typeMismatch) {
        messageText = "Enter a valid email address.";
      } else if (field.validity.patternMismatch) {
        messageText = "Use 7 to 20 digits, spaces, parentheses, plus signs, or hyphens.";
      } else if (field.validity.tooLong) {
        messageText = `Keep this field under ${field.maxLength} characters.`;
      }

      field.setCustomValidity(messageText);
      field.setAttribute("aria-invalid", String(Boolean(messageText)));
      const error = errorElement(field);
      error.textContent = messageText;
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      if (messageText) describedBy.add(error.id);
      else describedBy.delete(error.id);
      if (describedBy.size) field.setAttribute("aria-describedby", [...describedBy].join(" "));
      else field.removeAttribute("aria-describedby");
      return !messageText;
    };

    fields.forEach((field) => {
      field.addEventListener("blur", () => validate(field));
      field.addEventListener("input", () => {
        if (field.hasAttribute("aria-invalid")) validate(field);
        if (field === message && counter) counter.textContent = `${field.value.length} / ${field.maxLength} characters`;
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const valid = fields.map(validate).every(Boolean);
      if (!valid) {
        status.textContent = "Please correct the highlighted fields before continuing.";
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      status.textContent = "Your details passed validation. This demo does not send enquiries yet; please use the Contact page to reach the arena.";
    });
  }

  const plan = document.querySelector("#membership-plan");
  const months = document.querySelector("#membership-months");
  const total = document.querySelector("#membership-total");
  if (plan && months && total) {
    const currency = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });
    const updateEstimate = () => {
      const count = Number(months.value);
      if (!Number.isInteger(count) || count < 1 || count > 12) {
        total.textContent = "Choose between 1 and 12 months.";
        months.setAttribute("aria-invalid", "true");
        return;
      }

      months.removeAttribute("aria-invalid");
      total.textContent = `Estimated total: ${currency.format(Number(plan.value) * count)} for ${count} ${count === 1 ? "month" : "months"}.`;
    };
    plan.addEventListener("change", updateEstimate);
    months.addEventListener("input", updateEstimate);
    updateEstimate();
  }

  const copyButton = document.querySelector("[data-copy-phone]");
  if (copyButton) {
    const status = document.querySelector("#phone-copy-status");
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copyPhone);
        status.textContent = "Phone number copied.";
      } catch {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = copyButton.dataset.copyPhone;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.left = "-9999px";
        document.body.append(temporaryInput);
        temporaryInput.select();
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        status.textContent = copied ? "Phone number copied." : `Select and copy this number: ${copyButton.dataset.copyPhone}`;
      }
    });
  }
})();
