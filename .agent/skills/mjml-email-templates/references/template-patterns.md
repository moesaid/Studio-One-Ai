# Template Patterns

Production-ready MJML patterns for common email layouts. Each pattern is fully compatible with the MailEngine builder's `fromMjml()` parser.

---

## Pattern 1: Header / Hero Banner

A colored section with centered heading and subtext.

```xml
<mj-section background-color="#4F46E5" padding="40px 20px">
  <mj-column>
    <mj-text font-size="28px" font-weight="700" color="#ffffff" align="center">
      Welcome to Our Newsletter
    </mj-text>
    <mj-text font-size="16px" color="#e0e7ff" align="center">
      The latest updates, tips, and news.
    </mj-text>
  </mj-column>
</mj-section>
```

---

## Pattern 2: Single Column Content

```xml
<mj-section padding="20px 0" background-color="#ffffff">
  <mj-column>
    <mj-text font-size="16px" color="#333333" line-height="1.6" padding="0 24px">
      Your email content goes here. Keep paragraphs short and scannable.
    </mj-text>
  </mj-column>
</mj-section>
```

---

## Pattern 3: Two-Column Feature Grid

```xml
<mj-section padding="20px 0" background-color="#ffffff">
  <mj-column width="50%">
    <mj-image src="https://placehold.co/260x160" alt="Feature 1" border-radius="8px" />
    <mj-text font-size="16px" font-weight="600" padding="12px 0 4px">Feature One</mj-text>
    <mj-text font-size="14px" color="#6B7280">Short description of the feature.</mj-text>
  </mj-column>
  <mj-column width="50%">
    <mj-image src="https://placehold.co/260x160" alt="Feature 2" border-radius="8px" />
    <mj-text font-size="16px" font-weight="600" padding="12px 0 4px">Feature Two</mj-text>
    <mj-text font-size="14px" color="#6B7280">Short description of the feature.</mj-text>
  </mj-column>
</mj-section>
```

---

## Pattern 4: Image + Text Side-by-Side

```xml
<mj-section padding="20px 0" background-color="#ffffff">
  <mj-column width="40%">
    <mj-image src="https://placehold.co/240x240" alt="Product" border-radius="8px" />
  </mj-column>
  <mj-column width="60%">
    <mj-text font-size="20px" font-weight="600">Product Name</mj-text>
    <mj-text font-size="14px" color="#6B7280" line-height="1.6">
      Description text wraps alongside the image on desktop, stacks on mobile.
    </mj-text>
    <mj-button href="https://example.com" background-color="#4F46E5" border-radius="6px">
      Shop Now
    </mj-button>
  </mj-column>
</mj-section>
```

---

## Pattern 5: Social Links Footer

```xml
<mj-section background-color="#1f2937" padding="20px 0">
  <mj-column>
    <mj-social align="center" mode="horizontal" icon-size="24px" border-radius="50px">
      <mj-social-element name="facebook" href="https://facebook.com" />
      <mj-social-element name="twitter" href="https://twitter.com" />
      <mj-social-element name="instagram" href="https://instagram.com" />
      <mj-social-element name="linkedin" href="https://linkedin.com" />
    </mj-social>
    <mj-text font-size="12px" color="#9CA3AF" align="center" padding="10px 0 0">
      © 2025 Your Company. All rights reserved.
    </mj-text>
  </mj-column>
</mj-section>
```

---

## Pattern 6: Navigation Bar

```xml
<mj-section background-color="#111827" padding="0">
  <mj-column>
    <mj-navbar align="center">
      <mj-navbar-link href="https://example.com" color="#ffffff" font-size="14px" padding="10px 16px">Home</mj-navbar-link>
      <mj-navbar-link href="https://example.com/products" color="#ffffff" font-size="14px" padding="10px 16px">Products</mj-navbar-link>
      <mj-navbar-link href="https://example.com/about" color="#ffffff" font-size="14px" padding="10px 16px">About</mj-navbar-link>
      <mj-navbar-link href="https://example.com/contact" color="#ffffff" font-size="14px" padding="10px 16px">Contact</mj-navbar-link>
    </mj-navbar>
  </mj-column>
</mj-section>
```

---

## Pattern 7: Accordion / FAQ

```xml
<mj-section padding="20px 0" background-color="#ffffff">
  <mj-column>
    <mj-text font-size="20px" font-weight="600" align="center" padding="0 0 16px">
      Frequently Asked Questions
    </mj-text>
    <mj-accordion border="1px solid #E5E7EB" font-family="Arial, sans-serif">
      <mj-accordion-element>
        <mj-accordion-title font-size="14px" font-weight="600" padding="12px 16px" background-color="#f9fafb">
          What is your return policy?
        </mj-accordion-title>
        <mj-accordion-text font-size="14px" padding="12px 16px" color="#6B7280">
          You can return any item within 30 days of purchase for a full refund.
        </mj-accordion-text>
      </mj-accordion-element>
      <mj-accordion-element>
        <mj-accordion-title font-size="14px" font-weight="600" padding="12px 16px" background-color="#f9fafb">
          How long does shipping take?
        </mj-accordion-title>
        <mj-accordion-text font-size="14px" padding="12px 16px" color="#6B7280">
          Standard shipping takes 5-7 business days. Express is 1-2 days.
        </mj-accordion-text>
      </mj-accordion-element>
    </mj-accordion>
  </mj-column>
</mj-section>
```

---

## Pattern 8: Pricing Table

```xml
<mj-section padding="20px 0" background-color="#ffffff">
  <mj-column>
    <mj-text font-size="20px" font-weight="600" align="center" padding="0 0 16px">
      Order Summary
    </mj-text>
    <mj-table width="100%" font-size="14px" color="#333333" padding="0 24px">
      <tr><th style="text-align:left;padding:8px;border-bottom:2px solid #E5E7EB;">Item</th><th style="text-align:right;padding:8px;border-bottom:2px solid #E5E7EB;">Price</th></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;">Pro Plan (Annual)</td><td style="text-align:right;padding:8px;border-bottom:1px solid #f3f4f6;">$99.00</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #f3f4f6;">Extra Storage (50GB)</td><td style="text-align:right;padding:8px;border-bottom:1px solid #f3f4f6;">$12.00</td></tr>
      <tr><td style="padding:8px;font-weight:600;">Total</td><td style="text-align:right;padding:8px;font-weight:600;">$111.00</td></tr>
    </mj-table>
  </mj-column>
</mj-section>
```

---

## Pattern 9: Raw HTML Block

```xml
<mj-section padding="0">
  <mj-column>
    <mj-raw>
      <div style="background:#f0f9ff;padding:16px 24px;border-left:4px solid #3b82f6;font-size:14px;color:#1e40af;">
        <strong>Pro Tip:</strong> You can use raw HTML for elements not supported by MJML.
      </div>
    </mj-raw>
  </mj-column>
</mj-section>
```

---

## Pattern 10: Clickable Text Link

```xml
<mj-section padding="20px 0" background-color="#ffffff">
  <mj-column>
    <mj-text font-size="14px" color="#4F46E5" align="center" href="https://example.com">
      Click here to read more →
    </mj-text>
  </mj-column>
</mj-section>
```

> Note: The builder wraps text content in `<a href="...">` during serialization when `href` is set.

---

## Full Template Skeleton

```xml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" font-size="14px" color="#333333" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <!-- Navbar -->
    <mj-section background-color="#111827" padding="0">
      <mj-column>
        <mj-navbar align="center">
          <mj-navbar-link href="#" color="#fff" font-size="14px" padding="10px 16px">Home</mj-navbar-link>
          <mj-navbar-link href="#" color="#fff" font-size="14px" padding="10px 16px">About</mj-navbar-link>
        </mj-navbar>
      </mj-column>
    </mj-section>

    <!-- Hero -->
    <mj-section background-color="#4F46E5" padding="40px 20px">
      <mj-column>
        <mj-text font-size="28px" font-weight="700" color="#ffffff" align="center">Heading</mj-text>
        <mj-text font-size="16px" color="#e0e7ff" align="center">Subtitle text</mj-text>
        <mj-button href="https://example.com" background-color="#ffffff" color="#4F46E5" border-radius="6px">
          Get Started
        </mj-button>
      </mj-column>
    </mj-section>

    <!-- Content -->
    <mj-section padding="30px 0" background-color="#ffffff">
      <mj-column>
        <mj-text font-size="16px" line-height="1.6" padding="0 24px">Body content</mj-text>
        <mj-divider border-color="#E5E7EB" border-width="1px" padding="16px 24px" />
        <mj-table width="100%" font-size="14px" padding="0 24px">
          <tr><td>Item</td><td style="text-align:right;">$10</td></tr>
        </mj-table>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="#1f2937" padding="20px 0">
      <mj-column>
        <mj-social align="center" mode="horizontal" icon-size="20px">
          <mj-social-element name="facebook" href="https://facebook.com" />
          <mj-social-element name="twitter" href="https://twitter.com" />
          <mj-social-element name="instagram" href="https://instagram.com" />
        </mj-social>
        <mj-text font-size="12px" color="#9CA3AF" align="center">
          © 2025 Company • Unsubscribe
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```
