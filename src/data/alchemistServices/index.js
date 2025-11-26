/**
 * ALCHEMIST SERVICES INDEX
 * Central export for all Alchemist services
 * Modular system for easy addition/removal of services
 */

// Import all service configurations
import { blogPostGenerator } from './contentCreation/blogPostGenerator'
import { videoScriptWriter } from './contentCreation/videoScriptWriter'
import { caseStudyWriter } from './contentCreation/caseStudyWriter'

import { emailSequenceGenerator } from './marketing/emailSequenceGenerator'
import { socialMediaGenerator } from './marketing/socialMediaGenerator'
import { adCopyGenerator } from './marketing/adCopyGenerator'

import { salesPageGenerator } from './sales/salesPageGenerator'
import { landingPageGenerator } from './sales/landingPageGenerator'
import { productDescriptionGenerator } from './sales/productDescriptionGenerator'

import { pressReleaseGenerator } from './pr/pressReleaseGenerator'

// Export all services organized by category
export const alchemistServices = {
  contentCreation: [
    blogPostGenerator,
    videoScriptWriter,
    caseStudyWriter
  ],
  marketing: [
    emailSequenceGenerator,
    socialMediaGenerator,
    adCopyGenerator
  ],
  sales: [
    salesPageGenerator,
    landingPageGenerator,
    productDescriptionGenerator
  ],
  pr: [
    pressReleaseGenerator
  ]
}

// Flatten all services for easy access
export const getAllAlchemistServices = () => {
  return Object.values(alchemistServices).flat()
}

// Get services by category
export const getServicesByCategory = (category) => {
  return alchemistServices[category] || []
}

// Get service by ID
export const getServiceById = (serviceId) => {
  const allServices = getAllAlchemistServices()
  return allServices.find(service => service.id === serviceId)
}

// Get all categories
export const getAlchemistCategories = () => {
  return Object.keys(alchemistServices)
}

export default {
  alchemistServices,
  getAllAlchemistServices,
  getServicesByCategory,
  getServiceById,
  getAlchemistCategories
}
