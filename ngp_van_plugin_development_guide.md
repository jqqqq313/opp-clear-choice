# NGP VAN Plugin Development Guide

## Overview

NGP VAN is the leading technology provider for Democratic and progressive campaigns, offering a comprehensive CRM system. Building a plugin for NGP VAN allows you to extend their functionality and integrate with external systems. This guide covers everything you need to know to build a successful NGP VAN plugin.

## Table of Contents

1. [Understanding NGP VAN Architecture](#understanding-ngp-van-architecture)
2. [Authentication & API Access](#authentication--api-access)
3. [Plugin Architecture](#plugin-architecture)
4. [Core Implementation](#core-implementation)
5. [Common Plugin Types](#common-plugin-types)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)
8. [Testing & Deployment](#testing--deployment)
9. [Maintenance & Support](#maintenance--support)

## Understanding NGP VAN Architecture

### NGP VAN Components

**NGP VAN CRM System:**
- **My Voters**: Database mode 0 - Contains voter file data
- **My Campaign**: Database mode 1 - Traditional CRM for supporters/donors
- **NGP 8**: Modern platform with blue UI
- **NGP 7**: Legacy platform with grey UI

**Key Entities:**
- **People**: Individual contacts/voters
- **Events**: Campaign events and activities
- **Contributions**: Financial donations
- **Canvass Responses**: Voter interaction data
- **Activist Codes**: Supporter categorization
- **Survey Questions**: Voter opinion data

### API Architecture

**Base URL:** `https://api.securevan.com/v4/`
**Authentication:** HTTP Basic Auth
**Format:** JSON
**Methods:** GET, POST, PUT, PATCH, DELETE

## Authentication & API Access

### Getting API Keys

1. **Request API Key**: Contact NGP VAN at `APIDevelopers@ngpvan.com`
2. **Specify Integration**: Provide your application name and use case
3. **Security Review**: Complete NGP VAN's security review process
4. **Receive Credentials**: Get Application Name and API Key

### API Key Format

```
API Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7|1
         [GUID]                              |[Mode]
```

**Database Modes:**
- `|0` - My Voters (requires special permissions)
- `|1` - My Campaign (standard CRM)

### Authentication Implementation

**HTTP Basic Auth:**
- Username: Application Name
- Password: API Key

**Example Headers:**
```
Authorization: Basic <base64(applicationName:apiKey)>
Content-Type: application/json
```

## Plugin Architecture

### 1. Web-Based Plugin

**Structure:**
```
my-ngp-plugin/
├── src/
│   ├── api/
│   │   ├── client.js
│   │   └── endpoints.js
│   ├── components/
│   │   ├── Dashboard.js
│   │   └── Forms.js
│   ├── services/
│   │   ├── ngpService.js
│   │   └── dataSync.js
│   └── utils/
│       ├── validation.js
│       └── helpers.js
├── config/
│   └── settings.js
├── tests/
└── docs/
```

### 2. WordPress Plugin

**Structure:**
```
wp-ngp-plugin/
├── wp-ngp-plugin.php
├── includes/
│   ├── class-ngp-api.php
│   ├── class-ngp-forms.php
│   └── class-ngp-admin.php
├── admin/
│   ├── admin-menu.php
│   └── settings.php
├── public/
│   ├── shortcodes.php
│   └── widgets.php
└── assets/
    ├── css/
    └── js/
```

### 3. Standalone Application

**Structure:**
```
ngp-integration-app/
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── middleware/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
├── database/
│   └── migrations/
└── config/
```

## Core Implementation

### 1. NGP VAN API Client

**JavaScript Implementation:**

```javascript
class NgpVanClient {
  constructor(applicationName, apiKey, baseUrl = 'https://api.securevan.com/v4') {
    this.applicationName = applicationName;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Basic ${Buffer.from(`${applicationName}:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.headers,
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('NGP VAN API Error:', error);
      throw error;
    }
  }

  // People endpoints
  async getPeople(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/people?${query}`);
  }

  async getPerson(vanId) {
    return this.makeRequest(`/people/${vanId}`);
  }

  async createPerson(personData) {
    return this.makeRequest('/people', 'POST', personData);
  }

  async updatePerson(vanId, updates) {
    return this.makeRequest(`/people/${vanId}`, 'POST', updates);
  }

  // Events endpoints
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/events?${query}`);
  }

  async createEvent(eventData) {
    return this.makeRequest('/events', 'POST', eventData);
  }

  async createSignup(signupData) {
    return this.makeRequest('/signups', 'POST', signupData);
  }

  // Contributions endpoints
  async getContributions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.makeRequest(`/contributions?${query}`);
  }

  async createContribution(contributionData) {
    return this.makeRequest('/contributions', 'POST', contributionData);
  }

  // Canvass responses
  async createCanvassResponse(vanId, responseData) {
    return this.makeRequest(`/people/${vanId}/canvassResponses`, 'POST', responseData);
  }

  // Activist codes
  async getActivistCodes() {
    return this.makeRequest('/activistCodes');
  }

  async addActivistCode(vanId, codeData) {
    return this.makeRequest(`/people/${vanId}/codes`, 'POST', codeData);
  }

  // Survey questions
  async getSurveyQuestions() {
    return this.makeRequest('/surveyQuestions');
  }

  // Bulk operations
  async bulkImport(importData) {
    return this.makeRequest('/bulkImportJobs', 'POST', importData);
  }

  async getBulkImportStatus(jobId) {
    return this.makeRequest(`/bulkImportJobs/${jobId}`);
  }
}

module.exports = NgpVanClient;
```

### 2. Data Synchronization Service

```javascript
class NgpDataSync {
  constructor(ngpClient) {
    this.ngpClient = ngpClient;
    this.syncQueue = [];
    this.isProcessing = false;
  }

  async syncPerson(personData) {
    try {
      // Try to find existing person
      const existingPerson = await this.findPersonByEmail(personData.email);
      
      if (existingPerson) {
        // Update existing person
        return await this.ngpClient.updatePerson(existingPerson.vanId, personData);
      } else {
        // Create new person
        return await this.ngpClient.createPerson(personData);
      }
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  async findPersonByEmail(email) {
    try {
      const response = await this.ngpClient.makeRequest('/people/find', 'POST', {
        firstName: '',
        lastName: '',
        emails: [{ email }]
      });
      return response.person;
    } catch (error) {
      return null;
    }
  }

  async batchSync(peopleData) {
    const results = [];
    
    for (const person of peopleData) {
      try {
        const result = await this.syncPerson(person);
        results.push({ success: true, person, result });
      } catch (error) {
        results.push({ success: false, person, error });
      }
    }
    
    return results;
  }

  async syncContribution(contributionData) {
    try {
      // Ensure person exists first
      const person = await this.syncPerson(contributionData.person);
      
      // Create contribution
      const contribution = {
        ...contributionData,
        person: { vanId: person.vanId }
      };
      
      return await this.ngpClient.createContribution(contribution);
    } catch (error) {
      console.error('Contribution sync error:', error);
      throw error;
    }
  }
}
```

### 3. Form Handler Service

```javascript
class NgpFormHandler {
  constructor(ngpClient) {
    this.ngpClient = ngpClient;
  }

  async handleVolunteerSignup(formData) {
    try {
      // Create/update person
      const personData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emails: [{ email: formData.email }],
        phones: formData.phone ? [{ phoneNumber: formData.phone }] : [],
        addresses: formData.address ? [this.formatAddress(formData.address)] : []
      };

      const person = await this.syncPerson(personData);

      // Add volunteer activist code
      await this.ngpClient.addActivistCode(person.vanId, {
        activistCodeId: formData.volunteerCodeId || 123, // Your volunteer code ID
        type: 'Apply'
      });

      // Create event signup if event specified
      if (formData.eventId) {
        await this.ngpClient.createSignup({
          person: { vanId: person.vanId },
          event: { eventId: formData.eventId },
          role: { roleId: 1 }, // Volunteer role
          status: { statusId: 2 } // Confirmed
        });
      }

      return { success: true, person };
    } catch (error) {
      console.error('Volunteer signup error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleDonationForm(formData) {
    try {
      // Process donation
      const contributionData = {
        person: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          emails: [{ email: formData.email }],
          addresses: [this.formatAddress(formData.address)]
        },
        amount: formData.amount,
        dateReceived: new Date().toISOString(),
        contactType: { contactTypeId: 1 }, // Online
        attributions: [{
          attributionId: formData.attributionId || 1
        }]
      };

      return await this.ngpClient.createContribution(contributionData);
    } catch (error) {
      console.error('Donation error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSurveyResponse(formData) {
    try {
      const person = await this.syncPerson({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emails: [{ email: formData.email }]
      });

      // Submit survey responses
      const canvassResponse = {
        canvassContext: {
          inputTypeId: 11, // API input
          contactTypeId: 1, // Online
          dateCanvassed: new Date().toISOString()
        },
        responses: formData.responses.map(response => ({
          surveyQuestionId: response.questionId,
          surveyResponseId: response.responseId
        }))
      };

      await this.ngpClient.createCanvassResponse(person.vanId, canvassResponse);

      return { success: true, person };
    } catch (error) {
      console.error('Survey error:', error);
      return { success: false, error: error.message };
    }
  }

  formatAddress(addressData) {
    return {
      addressLine1: addressData.street,
      city: addressData.city,
      stateOrProvince: addressData.state,
      zipOrPostalCode: addressData.zip,
      countryCode: addressData.country || 'US'
    };
  }

  async syncPerson(personData) {
    const sync = new NgpDataSync(this.ngpClient);
    return await sync.syncPerson(personData);
  }
}
```

## Common Plugin Types

### 1. WordPress Plugin Example

**Main Plugin File (`wp-ngp-plugin.php`):**

```php
<?php
/**
 * Plugin Name: NGP VAN Integration
 * Description: Integrate WordPress forms with NGP VAN
 * Version: 1.0.0
 * Author: Your Name
 */

if (!defined('ABSPATH')) {
    exit;
}

class NgpVanPlugin {
    private $api_key;
    private $app_name;
    private $base_url = 'https://api.securevan.com/v4';

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_ngp_submit_form', array($this, 'handle_form_submission'));
        add_action('wp_ajax_nopriv_ngp_submit_form', array($this, 'handle_form_submission'));
        add_shortcode('ngp_volunteer_form', array($this, 'volunteer_form_shortcode'));
        add_shortcode('ngp_donation_form', array($this, 'donation_form_shortcode'));
    }

    public function init() {
        $this->api_key = get_option('ngp_api_key');
        $this->app_name = get_option('ngp_app_name', 'WordPressPlugin');
    }

    public function enqueue_scripts() {
        wp_enqueue_script('ngp-forms', plugin_dir_url(__FILE__) . 'assets/js/forms.js', array('jquery'), '1.0.0', true);
        wp_localize_script('ngp-forms', 'ngp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('ngp_nonce')
        ));
    }

    public function volunteer_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'event_id' => '',
            'volunteer_code_id' => '123'
        ), $atts);

        ob_start();
        ?>
        <form id="ngp-volunteer-form" class="ngp-form">
            <input type="hidden" name="action" value="ngp_submit_form">
            <input type="hidden" name="form_type" value="volunteer">
            <input type="hidden" name="event_id" value="<?php echo esc_attr($atts['event_id']); ?>">
            <input type="hidden" name="volunteer_code_id" value="<?php echo esc_attr($atts['volunteer_code_id']); ?>">
            <?php wp_nonce_field('ngp_nonce', 'ngp_nonce'); ?>
            
            <div class="form-group">
                <label for="first_name">First Name *</label>
                <input type="text" id="first_name" name="first_name" required>
            </div>
            
            <div class="form-group">
                <label for="last_name">Last Name *</label>
                <input type="text" id="last_name" name="last_name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" name="phone">
            </div>
            
            <div class="form-group">
                <label for="zip">ZIP Code</label>
                <input type="text" id="zip" name="zip">
            </div>
            
            <button type="submit">Sign Up to Volunteer</button>
        </form>
        <?php
        return ob_get_clean();
    }

    public function donation_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'amounts' => '25,50,100,250',
            'attribution_id' => '1'
        ), $atts);

        $amounts = explode(',', $atts['amounts']);
        
        ob_start();
        ?>
        <form id="ngp-donation-form" class="ngp-form">
            <input type="hidden" name="action" value="ngp_submit_form">
            <input type="hidden" name="form_type" value="donation">
            <input type="hidden" name="attribution_id" value="<?php echo esc_attr($atts['attribution_id']); ?>">
            <?php wp_nonce_field('ngp_nonce', 'ngp_nonce'); ?>
            
            <div class="form-group">
                <label>Donation Amount *</label>
                <?php foreach ($amounts as $amount): ?>
                    <label>
                        <input type="radio" name="amount" value="<?php echo esc_attr(trim($amount)); ?>" required>
                        $<?php echo esc_html(trim($amount)); ?>
                    </label>
                <?php endforeach; ?>
                <label>
                    <input type="radio" name="amount" value="other" required>
                    Other: $<input type="number" name="custom_amount" min="1" step="0.01">
                </label>
            </div>
            
            <div class="form-group">
                <label for="donor_first_name">First Name *</label>
                <input type="text" id="donor_first_name" name="first_name" required>
            </div>
            
            <div class="form-group">
                <label for="donor_last_name">Last Name *</label>
                <input type="text" id="donor_last_name" name="last_name" required>
            </div>
            
            <div class="form-group">
                <label for="donor_email">Email *</label>
                <input type="email" id="donor_email" name="email" required>
            </div>
            
            <button type="submit">Donate Now</button>
        </form>
        <?php
        return ob_get_clean();
    }

    public function handle_form_submission() {
        if (!wp_verify_nonce($_POST['ngp_nonce'], 'ngp_nonce')) {
            wp_die('Security check failed');
        }

        $form_type = sanitize_text_field($_POST['form_type']);
        
        try {
            switch ($form_type) {
                case 'volunteer':
                    $result = $this->handle_volunteer_signup();
                    break;
                case 'donation':
                    $result = $this->handle_donation();
                    break;
                default:
                    throw new Exception('Invalid form type');
            }
            
            wp_send_json_success($result);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    private function handle_volunteer_signup() {
        $person_data = array(
            'firstName' => sanitize_text_field($_POST['first_name']),
            'lastName' => sanitize_text_field($_POST['last_name']),
            'emails' => array(
                array('email' => sanitize_email($_POST['email']))
            )
        );

        if (!empty($_POST['phone'])) {
            $person_data['phones'] = array(
                array('phoneNumber' => sanitize_text_field($_POST['phone']))
            );
        }

        if (!empty($_POST['zip'])) {
            $person_data['addresses'] = array(
                array('zipOrPostalCode' => sanitize_text_field($_POST['zip']))
            );
        }

        // Create/update person
        $person = $this->sync_person($person_data);

        // Add volunteer activist code
        $volunteer_code_id = intval($_POST['volunteer_code_id']);
        $this->add_activist_code($person['vanId'], $volunteer_code_id);

        // Create event signup if event specified
        if (!empty($_POST['event_id'])) {
            $event_id = intval($_POST['event_id']);
            $this->create_event_signup($person['vanId'], $event_id);
        }

        return array('message' => 'Thank you for volunteering!', 'person' => $person);
    }

    private function handle_donation() {
        $amount = $_POST['amount'] === 'other' ? floatval($_POST['custom_amount']) : floatval($_POST['amount']);
        
        $contribution_data = array(
            'person' => array(
                'firstName' => sanitize_text_field($_POST['first_name']),
                'lastName' => sanitize_text_field($_POST['last_name']),
                'emails' => array(
                    array('email' => sanitize_email($_POST['email']))
                )
            ),
            'amount' => $amount,
            'dateReceived' => date('c'),
            'contactType' => array('contactTypeId' => 1), // Online
            'attributions' => array(
                array('attributionId' => intval($_POST['attribution_id']))
            )
        );

        $result = $this->make_api_request('/contributions', 'POST', $contribution_data);
        
        return array('message' => 'Thank you for your donation!', 'contribution' => $result);
    }

    private function sync_person($person_data) {
        // Try to find existing person
        $find_data = array(
            'firstName' => $person_data['firstName'],
            'lastName' => $person_data['lastName'],
            'emails' => $person_data['emails']
        );

        try {
            $existing = $this->make_api_request('/people/find', 'POST', $find_data);
            if ($existing && isset($existing['person'])) {
                // Update existing person
                $this->make_api_request('/people/' . $existing['person']['vanId'], 'POST', $person_data);
                return $existing['person'];
            }
        } catch (Exception $e) {
            // Person not found, create new
        }

        // Create new person
        $result = $this->make_api_request('/people', 'POST', $person_data);
        return $result;
    }

    private function add_activist_code($van_id, $code_id) {
        $code_data = array(
            'activistCodeId' => $code_id,
            'type' => 'Apply'
        );
        
        return $this->make_api_request("/people/{$van_id}/codes", 'POST', $code_data);
    }

    private function create_event_signup($van_id, $event_id) {
        $signup_data = array(
            'person' => array('vanId' => $van_id),
            'event' => array('eventId' => $event_id),
            'role' => array('roleId' => 1), // Volunteer
            'status' => array('statusId' => 2) // Confirmed
        );
        
        return $this->make_api_request('/signups', 'POST', $signup_data);
    }

    private function make_api_request($endpoint, $method = 'GET', $data = null) {
        $url = $this->base_url . $endpoint;
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'Authorization' => 'Basic ' . base64_encode($this->app_name . ':' . $this->api_key),
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30
        );

        if ($data) {
            $args['body'] = json_encode($data);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            throw new Exception('API request failed: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $code = wp_remote_retrieve_response_code($response);

        if ($code >= 400) {
            throw new Exception('API error: ' . $body);
        }

        return json_decode($body, true);
    }
}

new NgpVanPlugin();
```

### 2. React Component Plugin

```jsx
import React, { useState, useEffect } from 'react';
import { NgpVanClient } from './ngp-client';

const NgpVolunteerForm = ({ eventId, volunteerCodeId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [ngpClient] = useState(new NgpVanClient(
    process.env.REACT_APP_NGP_APP_NAME,
    process.env.REACT_APP_NGP_API_KEY
  ));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const formHandler = new NgpFormHandler(ngpClient);
      const result = await formHandler.handleVolunteerSignup({
        ...formData,
        eventId,
        volunteerCodeId
      });

      if (result.success) {
        setMessage('Thank you for volunteering!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          zip: ''
        });
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ngp-volunteer-form">
      <h3>Sign Up to Volunteer</h3>
      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="zip">ZIP Code</label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

const NgpDashboard = () => {
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngpClient] = useState(new NgpVanClient(
    process.env.REACT_APP_NGP_APP_NAME,
    process.env.REACT_APP_NGP_API_KEY
  ));

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [eventsData, recentContributions] = await Promise.all([
        ngpClient.getEvents({ limit: 10 }),
        ngpClient.getContributions({ limit: 100 })
      ]);

      setEvents(eventsData.events || []);
      setStats({
        totalEvents: eventsData.events?.length || 0,
        totalContributions: recentContributions.contributions?.length || 0,
        totalAmount: recentContributions.contributions?.reduce((sum, c) => sum + c.amount, 0) || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ngp-dashboard">
      <h2>Campaign Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{stats.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Contributions</h3>
          <p>{stats.totalContributions}</p>
        </div>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <p>${stats.totalAmount}</p>
        </div>
      </div>

      <div className="events-section">
        <h3>Recent Events</h3>
        <div className="events-list">
          {events.map(event => (
            <div key={event.eventId} className="event-card">
              <h4>{event.name}</h4>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {event.location?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { NgpVolunteerForm, NgpDashboard };
```

## Best Practices

### 1. Security

**API Key Management:**
```javascript
// Never hardcode API keys
const API_KEY = process.env.NGP_API_KEY;

// Use environment variables
const config = {
  apiKey: process.env.NGP_API_KEY,
  appName: process.env.NGP_APP_NAME,
  environment: process.env.NODE_ENV
};

// Implement key rotation
class ApiKeyManager {
  constructor() {
    this.currentKey = process.env.NGP_API_KEY;
    this.backupKey = process.env.NGP_API_KEY_BACKUP;
  }

  async rotateKey() {
    // Implement key rotation logic
    this.currentKey = this.backupKey;
    this.backupKey = await this.getNewKey();
  }
}
```

**Data Validation:**
```javascript
const validatePersonData = (data) => {
  const errors = [];
  
  if (!data.firstName || data.firstName.length < 1) {
    errors.push('First name is required');
  }
  
  if (!data.lastName || data.lastName.length < 1) {
    errors.push('Last name is required');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return errors;
};

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isValidPhone = (phone) => {
  // US/Canada phone validation
  const regex = /^1?[2-9][0-8]\d[2-9]\d{6}$/;
  return regex.test(phone.replace(/\D/g, ''));
};
```

### 2. Error Handling

**Robust Error Handling:**
```javascript
class NgpErrorHandler {
  static handle(error, context = {}) {
    console.error('NGP VAN Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Log to external service
    if (process.env.NODE_ENV === 'production') {
      this.logToExternalService(error, context);
    }

    // Return user-friendly message
    return this.getUserFriendlyMessage(error);
  }

  static getUserFriendlyMessage(error) {
    if (error.message.includes('401')) {
      return 'Authentication failed. Please check your API credentials.';
    }
    
    if (error.message.includes('403')) {
      return 'Access denied. You may not have permission for this action.';
    }
    
    if (error.message.includes('429')) {
      return 'Rate limit exceeded. Please try again later.';
    }
    
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  static async logToExternalService(error, context) {
    // Implement external logging (e.g., Sentry, LogRocket)
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString()
        })
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}
```

### 3. Rate Limiting

**Rate Limiting Implementation:**
```javascript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  async checkLimit(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old requests
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
  }
}

// Usage in API client
class NgpVanClient {
  constructor(applicationName, apiKey) {
    this.applicationName = applicationName;
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    await this.rateLimiter.checkLimit(this.applicationName);
    
    // ... rest of request logic
  }
}
```

### 4. Caching

**Smart Caching Strategy:**
```javascript
class NgpCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  set(key, value, customTtl = null) {
    const ttl = customTtl || this.ttl;
    const expires = Date.now() + ttl;
    
    this.cache.set(key, { value, expires });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Usage in API client
class NgpVanClient {
  constructor(applicationName, apiKey) {
    this.applicationName = applicationName;
    this.apiKey = apiKey;
    this.cache = new NgpCache();
  }

  async getActivistCodes() {
    const cacheKey = 'activist-codes';
    let codes = this.cache.get(cacheKey);
    
    if (!codes) {
      codes = await this.makeRequest('/activistCodes');
      this.cache.set(cacheKey, codes, 30 * 60 * 1000); // 30 minutes
    }
    
    return codes;
  }
}
```

## Testing & Deployment

### 1. Unit Tests

**Jest Testing Example:**
```javascript
// __tests__/ngp-client.test.js
import { NgpVanClient } from '../src/ngp-client';

// Mock fetch
global.fetch = jest.fn();

describe('NgpVanClient', () => {
  let client;
  
  beforeEach(() => {
    client = new NgpVanClient('TestApp', 'test-key|1');
    fetch.mockClear();
  });

  test('should authenticate properly', () => {
    const expectedAuth = Buffer.from('TestApp:test-key|1').toString('base64');
    expect(client.headers.Authorization).toBe(`Basic ${expectedAuth}`);
  });

  test('should make GET request', async () => {
    const mockResponse = { events: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.getEvents();
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.securevan.com/v4/events?',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic')
        })
      })
    );
    
    expect(result).toEqual(mockResponse);
  });

  test('should handle API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    });

    await expect(client.getEvents()).rejects.toThrow('HTTP 401: Unauthorized');
  });

  test('should create person', async () => {
    const personData = {
      firstName: 'John',
      lastName: 'Doe',
      emails: [{ email: 'john@example.com' }]
    };

    const mockResponse = { vanId: 12345 };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.createPerson(personData);
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.securevan.com/v4/people',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(personData)
      })
    );
    
    expect(result).toEqual(mockResponse);
  });
});
```

### 2. Integration Tests

**Integration Testing:**
```javascript
// __tests__/integration.test.js
import { NgpVanClient } from '../src/ngp-client';
import { NgpFormHandler } from '../src/form-handler';

describe('NGP VAN Integration', () => {
  let client;
  let formHandler;
  
  beforeAll(() => {
    if (!process.env.NGP_TEST_API_KEY) {
      throw new Error('NGP_TEST_API_KEY environment variable required for integration tests');
    }
    
    client = new NgpVanClient('TestApp', process.env.NGP_TEST_API_KEY);
    formHandler = new NgpFormHandler(client);
  });

  test('should handle volunteer signup end-to-end', async () => {
    const formData = {
      firstName: 'Test',
      lastName: 'Volunteer',
      email: 'test@example.com',
      phone: '555-123-4567',
      volunteerCodeId: 123
    };

    const result = await formHandler.handleVolunteerSignup(formData);
    
    expect(result.success).toBe(true);
    expect(result.person).toBeDefined();
    expect(result.person.vanId).toBeDefined();
  });

  test('should handle survey responses', async () => {
    const formData = {
      firstName: 'Test',
      lastName: 'Respondent',
      email: 'respondent@example.com',
      responses: [
        { questionId: 1, responseId: 1 },
        { questionId: 2, responseId: 3 }
      ]
    };

    const result = await formHandler.handleSurveyResponse(formData);
    
    expect(result.success).toBe(true);
    expect(result.person).toBeDefined();
  });
});
```

### 3. Deployment

**Docker Deployment:**
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'

services:
  ngp-plugin:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NGP_API_KEY=${NGP_API_KEY}
      - NGP_APP_NAME=${NGP_APP_NAME}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ngp-plugin
    restart: unless-stopped
```

**Kubernetes Deployment:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ngp-plugin
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ngp-plugin
  template:
    metadata:
      labels:
        app: ngp-plugin
    spec:
      containers:
      - name: ngp-plugin
        image: your-registry/ngp-plugin:latest
        ports:
        - containerPort: 3000
        env:
        - name: NGP_API_KEY
          valueFrom:
            secretKeyRef:
              name: ngp-secrets
              key: api-key
        - name: NGP_APP_NAME
          value: "YourApp"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ngp-plugin-service
spec:
  selector:
    app: ngp-plugin
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Maintenance & Support

### 1. Monitoring

**Health Checks:**
```javascript
class HealthChecker {
  constructor(ngpClient) {
    this.ngpClient = ngpClient;
  }

  async checkHealth() {
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    try {
      // Test API connectivity
      await this.ngpClient.makeRequest('/echo', 'POST', { echo: 'test' });
      checks.checks.api = { status: 'healthy' };
    } catch (error) {
      checks.checks.api = { status: 'unhealthy', error: error.message };
      checks.status = 'unhealthy';
    }

    try {
      // Test database connectivity (if applicable)
      await this.checkDatabase();
      checks.checks.database = { status: 'healthy' };
    } catch (error) {
      checks.checks.database = { status: 'unhealthy', error: error.message };
      checks.status = 'unhealthy';
    }

    return checks;
  }

  async checkDatabase() {
    // Implement database health check
    return true;
  }
}

// Express.js health endpoint
app.get('/health', async (req, res) => {
  const healthChecker = new HealthChecker(ngpClient);
  const health = await healthChecker.checkHealth();
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### 2. Logging

**Structured Logging:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ngp-plugin' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage in API client
class NgpVanClient {
  async makeRequest(endpoint, method = 'GET', data = null) {
    const requestId = generateRequestId();
    
    logger.info('API Request', {
      requestId,
      endpoint,
      method,
      hasData: !!data
    });

    try {
      const response = await fetch(url, options);
      
      logger.info('API Response', {
        requestId,
        status: response.status,
        endpoint
      });
      
      return await response.json();
    } catch (error) {
      logger.error('API Error', {
        requestId,
        endpoint,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
}
```

### 3. Performance Monitoring

**Performance Metrics:**
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(operation) {
    const timer = {
      start: Date.now(),
      operation
    };
    
    const timerId = generateTimerId();
    this.metrics.set(timerId, timer);
    
    return timerId;
  }

  endTimer(timerId) {
    const timer = this.metrics.get(timerId);
    if (!timer) return;
    
    const duration = Date.now() - timer.start;
    this.metrics.delete(timerId);
    
    logger.info('Performance Metric', {
      operation: timer.operation,
      duration,
      timestamp: new Date().toISOString()
    });
    
    return duration;
  }

  async measureAsync(operation, asyncFn) {
    const timerId = this.startTimer(operation);
    
    try {
      const result = await asyncFn();
      this.endTimer(timerId);
      return result;
    } catch (error) {
      this.endTimer(timerId);
      throw error;
    }
  }
}

// Usage
const monitor = new PerformanceMonitor();

class NgpVanClient {
  async makeRequest(endpoint, method = 'GET', data = null) {
    return await monitor.measureAsync(`API:${method}:${endpoint}`, async () => {
      // ... actual request logic
    });
  }
}
```

## Conclusion

Building an NGP VAN plugin requires understanding their API architecture, implementing proper authentication, handling errors gracefully, and following best practices for security and performance. The examples provided should give you a solid foundation for creating your own NGP VAN integration.

**Key Takeaways:**
1. Start with the sandbox environment for testing
2. Implement proper error handling and rate limiting
3. Use secure authentication practices
4. Follow NGP VAN's API guidelines and conventions
5. Test thoroughly before deploying to production
6. Monitor performance and maintain proper logging
7. Keep your plugin updated with API changes

**Next Steps:**
1. Request sandbox API credentials from NGP VAN
2. Choose your plugin architecture (web app, WordPress, etc.)
3. Implement core functionality using the examples above
4. Test with sandbox data
5. Request production API credentials
6. Deploy and monitor your plugin

For support and questions, contact NGP VAN at `APIDevelopers@ngpvan.com`.

---

*This guide is based on NGP VAN API documentation and best practices as of 2024. Always refer to the official NGP VAN documentation for the most current information.*