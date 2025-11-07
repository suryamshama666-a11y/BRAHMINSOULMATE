# Requirements Document

## Introduction

This specification outlines the remaining features needed to complete the Brahmin Soulmate Connect matrimonial platform. The system currently has a solid UI/UX foundation with account management, navigation, and basic profile displays. This document focuses on implementing core matrimonial functionality including backend integration, matching algorithms, messaging, and payment processing.

## Glossary

- **System**: The Brahmin Soulmate Connect web application
- **User**: A registered member seeking matrimonial matches
- **Profile**: A user's matrimonial information including personal, family, and preference details
- **Match**: A potential matrimonial connection between two users based on compatibility
- **Interest**: An expression of interest from one user to another
- **Connection**: A mutual acceptance of interest between two users
- **Gotra**: A lineage or clan in Hindu culture, important for matrimonial compatibility
- **Horoscope**: Astrological birth chart used for compatibility matching
- **Premium Member**: A user with paid subscription access to advanced features
- **Backend Service**: Supabase database and API endpoints
- **Payment Gateway**: Third-party service (Razorpay) for processing subscription payments

## Requirements

### Requirement 1: Backend Integration and Data Persistence

**User Story:** As a user, I want my profile data to be saved and retrieved from the database, so that my information persists across sessions.

#### Acceptance Criteria

1. WHEN a user creates or updates their profile, THE System SHALL store the data in the Supabase database
2. WHEN a user logs in, THE System SHALL retrieve and display their complete profile from the database
3. WHEN a user uploads photos, THE System SHALL store images in Supabase storage and link them to the profile
4. WHEN a user updates preferences, THE System SHALL persist the changes immediately to the database
5. IF database connection fails, THEN THE System SHALL display an error message and retry the operation

### Requirement 2: Advanced Search and Filtering

**User Story:** As a user, I want to search for matches using specific criteria including Gotra, location, and education, so that I can find compatible partners efficiently.

#### Acceptance Criteria

1. WHEN a user accesses the search page, THE System SHALL display filter options for age, height, location, education, occupation, Gotra, and sub-caste
2. WHEN a user applies filters, THE System SHALL query the database and return matching profiles within 2 seconds
3. WHEN a user searches by Gotra, THE System SHALL exclude profiles with the same Gotra (as per matrimonial customs)
4. WHEN search results are displayed, THE System SHALL show profile cards with key information and match percentage
5. WHEN a user saves search criteria, THE System SHALL store preferences and allow quick re-application

### Requirement 3: Matching Algorithm Implementation

**User Story:** As a user, I want to receive personalized match recommendations based on my preferences and compatibility, so that I can find suitable partners.

#### Acceptance Criteria

1. WHEN a user completes their profile, THE System SHALL calculate compatibility scores with other users based on preferences
2. WHEN calculating matches, THE System SHALL consider age range, height, location, education, occupation, and Gotra compatibility
3. WHEN displaying matches, THE System SHALL show compatibility percentage (0-100%) for each profile
4. WHEN a premium user views matches, THE System SHALL prioritize profiles with higher compatibility scores
5. WHEN preferences are updated, THE System SHALL recalculate match scores within 5 seconds

### Requirement 4: Real-time Messaging System

**User Story:** As a connected user, I want to send and receive messages in real-time, so that I can communicate with potential matches.

#### Acceptance Criteria

1. WHEN two users are connected, THE System SHALL enable messaging between them
2. WHEN a user sends a message, THE System SHALL deliver it to the recipient within 1 second
3. WHEN a user receives a message, THE System SHALL display a notification badge with unread count
4. WHEN a user opens a conversation, THE System SHALL mark messages as read and update the sender's status
5. WHEN a user is offline, THE System SHALL store messages and deliver them when the user returns online

### Requirement 5: Interest Management System

**User Story:** As a user, I want to send and receive expressions of interest, so that I can initiate connections with potential matches.

#### Acceptance Criteria

1. WHEN a user views a profile, THE System SHALL display a "Send Interest" button
2. WHEN a user sends interest, THE System SHALL notify the recipient via email and in-app notification
3. WHEN a user receives interest, THE System SHALL display it in the "Interests Received" section with profile details
4. WHEN a user accepts interest, THE System SHALL create a connection and enable messaging
5. WHEN a user declines interest, THE System SHALL remove it from the list and notify the sender

### Requirement 6: Payment Integration and Subscription Management

**User Story:** As a user, I want to upgrade to premium membership using secure payment methods, so that I can access advanced features.

#### Acceptance Criteria

1. WHEN a user selects a subscription plan, THE System SHALL redirect to Razorpay payment gateway
2. WHEN payment is successful, THE System SHALL activate the subscription immediately and update user status
3. WHEN subscription expires, THE System SHALL downgrade the user to free tier and send renewal reminder
4. WHEN auto-renewal is enabled, THE System SHALL process payment 3 days before expiry
5. WHEN payment fails, THE System SHALL retry twice and notify the user via email

### Requirement 7: Profile Photo Management

**User Story:** As a user, I want to upload, manage, and control visibility of my photos, so that I can present myself appropriately.

#### Acceptance Criteria

1. WHEN a user uploads a photo, THE System SHALL validate file type (JPEG, PNG) and size (max 5MB)
2. WHEN a photo is uploaded, THE System SHALL compress and store it in Supabase storage
3. WHEN a user sets privacy, THE System SHALL enforce photo visibility rules (all/premium/connections)
4. WHEN a user deletes a photo, THE System SHALL remove it from storage and update the profile
5. WHEN a user sets a primary photo, THE System SHALL display it as the profile picture across the platform

### Requirement 8: Horoscope Matching Service

**User Story:** As a user, I want to upload my horoscope and view compatibility with matches, so that I can make informed decisions based on astrological compatibility.

#### Acceptance Criteria

1. WHEN a user uploads a horoscope, THE System SHALL store the PDF/image in Supabase storage
2. WHEN a premium user views a match, THE System SHALL display horoscope compatibility score if both horoscopes are available
3. WHEN horoscope data is entered manually, THE System SHALL validate birth time, place, and date
4. WHEN calculating compatibility, THE System SHALL consider moon sign, nakshatra, and manglik status
5. WHEN horoscope is missing, THE System SHALL prompt the user to complete this section

### Requirement 9: Email and SMS Notifications

**User Story:** As a user, I want to receive timely notifications about matches, interests, and messages, so that I stay informed about my matrimonial search.

#### Acceptance Criteria

1. WHEN a user receives interest, THE System SHALL send an email notification within 5 minutes
2. WHEN a user gets a new match, THE System SHALL send a notification based on user preferences (instant/daily/weekly)
3. WHEN a user receives a message, THE System SHALL send SMS alert if SMS notifications are enabled
4. WHEN a user's subscription is expiring, THE System SHALL send reminder emails 7 days and 1 day before expiry
5. WHEN a user disables notifications, THE System SHALL stop sending emails/SMS immediately

### Requirement 10: Profile Verification System

**User Story:** As a user, I want to verify my profile with documents, so that I can build trust with potential matches.

#### Acceptance Criteria

1. WHEN a user submits verification documents, THE System SHALL store them securely in Supabase storage
2. WHEN documents are submitted, THE System SHALL notify admin for review within 24 hours
3. WHEN profile is verified, THE System SHALL display a verification badge on the profile
4. WHEN verification is rejected, THE System SHALL notify the user with reasons and allow resubmission
5. WHEN viewing profiles, THE System SHALL prioritize verified profiles in search results

### Requirement 11: Video Date (V-Dates) Functionality

**User Story:** As a connected user, I want to schedule and conduct video calls, so that I can meet potential matches virtually before meeting in person.

#### Acceptance Criteria

1. WHEN two users are connected, THE System SHALL enable video call scheduling
2. WHEN a user schedules a V-Date, THE System SHALL send calendar invites to both parties
3. WHEN V-Date time arrives, THE System SHALL provide a "Join Call" button with video conferencing link
4. WHEN video call is active, THE System SHALL support audio, video, and screen sharing
5. WHEN call ends, THE System SHALL allow users to provide feedback and notes

### Requirement 12: Event Management and Registration

**User Story:** As a user, I want to browse and register for matrimonial events, so that I can meet potential matches in person.

#### Acceptance Criteria

1. WHEN a user views events page, THE System SHALL display upcoming events with details and participant count
2. WHEN a user registers for an event, THE System SHALL confirm registration and send email with event details
3. WHEN event capacity is reached, THE System SHALL disable registration and show "Event Full" status
4. WHEN event date approaches, THE System SHALL send reminder notifications 3 days and 1 day before
5. WHEN user cancels registration, THE System SHALL update participant count and send cancellation confirmation

### Requirement 13: Success Stories Submission

**User Story:** As a married user, I want to share my success story, so that I can inspire others and contribute to the community.

#### Acceptance Criteria

1. WHEN a user submits a success story, THE System SHALL collect couple photos, story text, and marriage date
2. WHEN story is submitted, THE System SHALL send it for admin approval
3. WHEN story is approved, THE System SHALL display it on the success stories page
4. WHEN viewing success stories, THE System SHALL show couple photos, story, and marriage date
5. WHEN story is featured, THE System SHALL send congratulations email to the couple

### Requirement 14: Community Forum Integration

**User Story:** As a user, I want to participate in community discussions, so that I can seek advice and share experiences.

#### Acceptance Criteria

1. WHEN a user creates a forum post, THE System SHALL publish it in the appropriate category
2. WHEN a user comments on a post, THE System SHALL notify the post author
3. WHEN a post receives likes, THE System SHALL update the like count in real-time
4. WHEN inappropriate content is reported, THE System SHALL flag it for admin review
5. WHEN viewing forum, THE System SHALL display posts sorted by recent activity

### Requirement 15: Analytics and Reporting Dashboard

**User Story:** As a user, I want to view analytics about my profile performance, so that I can optimize my matrimonial search.

#### Acceptance Criteria

1. WHEN a user accesses dashboard, THE System SHALL display profile views, interests sent/received, and message statistics
2. WHEN viewing analytics, THE System SHALL show trends over time (daily, weekly, monthly)
3. WHEN profile completion is below 80%, THE System SHALL suggest sections to complete
4. WHEN user engagement is low, THE System SHALL provide tips to improve profile visibility
5. WHEN premium features are available, THE System SHALL highlight benefits with usage statistics
