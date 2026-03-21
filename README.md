# OmniWound Website

Official marketing website for OmniWound - an AI-powered wound care documentation platform.

## Pages

- **index.html** - Homepage with hero, features overview, and exit-intent popup
- **about.html** - Company information and team
- **features.html** - Detailed product features
- **demo.html** - Request a demo form
- **contact.html** - Contact form
- **pricing.html** - Pricing information
- **roi-calculator.html** - Interactive ROI calculator
- **case-studies.html** - Customer success stories
- **resources.html** - Educational resources
- **newsletter.html** - Newsletter archive
- **support.html** - Support information
- **system-status.html** - System status page
- **compliance.html** - HIPAA compliance information
- **documentation.html** - Product documentation
- **training.html** - Training resources
- **implementation.html** - Implementation guide
- **privacy.html** - Privacy policy
- **terms.html** - Terms of service

## Lead Capture Integration

All forms are integrated with the OmniWound Lead Generator API:

- **API Endpoint:** `https://salesapp.simplichart.com/api/public/leads`
- **Spam Protection:** Cloudflare Turnstile
- **Form Types:** newsletter, exit_intent, demo_request, contact, roi_calculator

## Development

This is a static HTML website. To run locally, simply open any HTML file in a browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Related Projects

- [omniwound-lead-generator](https://github.com/fgoncalv83/omniwound-lead-generator) - Lead capture API and dashboard
