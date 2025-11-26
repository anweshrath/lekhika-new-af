import React from 'react'

/**
 * FOOTER BRANDING COMPONENT
 * Shows "Powered By CopyAlche.My and anwe.sh" at bottom
 */
const PoweredByFooter = () => {
  return (
    <div className="powered-by-footer">
      Powered by{' '}
      <a href="https://copyalche.my" target="_blank" rel="noopener noreferrer">
        CopyAlche.My
      </a>
      {' '}and{' '}
      <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer">
        anwe.sh
      </a>
    </div>
  )
}

export default PoweredByFooter
