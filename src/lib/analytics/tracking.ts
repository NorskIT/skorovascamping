import { siteConfig } from '$lib/site';

export enum AnalyticsEvent {
	Contact = 'contact',
	GenerateLead = 'generate_lead',
	BeginBooking = 'begin_booking'
}

export enum ContactMethod {
	Phone = 'phone',
	Email = 'email',
	Form = 'form',
	Booking = 'booking'
}

export function trackContact(method: ContactMethod): void {
	if (!siteConfig.analyticsEnabled || typeof window === 'undefined' || !window.gtag) return;

	window.gtag('event', AnalyticsEvent.Contact, { method });
}

export function trackLead(): void {
	if (!siteConfig.analyticsEnabled || typeof window === 'undefined' || !window.gtag) return;

	window.gtag('event', AnalyticsEvent.GenerateLead);
}
