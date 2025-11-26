import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { supabase, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const PayPalButton = ({ plan, onSuccess, onError }) => {
  const { user, refreshCredits } = useAuth()
  const [loading, setLoading] = useState(false)

  const planDetails = {
    standard: {
      price: '7.00',
      credits: 1000,
      name: 'Standard Plan',
      description: '1000 credits (~10k words)'
    },
    expert: {
      price: '47.00', 
      credits: 7000,
      name: 'Expert Plan',
      description: '7000 credits (~70k words) + advanced features'
    },
    byok: {
      price: '20.00',
      credits: 0,
      name: 'BYOK Plan',
      description: 'Unlimited with your API keys'
    }
  }

  const currentPlan = planDetails[plan]

  if (!currentPlan) {
    return <div>Invalid plan selected</div>
  }

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: currentPlan.price,
          currency_code: 'USD'
        },
        description: `${currentPlan.name} - ${currentPlan.description}`
      }]
    })
  }

  const onApprove = async (data, actions) => {
    setLoading(true)
    
    try {
      const order = await actions.order.capture()
      console.log('PayPal order captured:', order)

      // Create subscription record
      const subscriptionData = {
        user_id: user.id,
        tier: plan,
        status: 'active',
        paypal_order_id: order.id,
        amount: parseFloat(currentPlan.price),
        currency: 'USD',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }

      await db.createSubscription(subscriptionData)

      // Add credits if not BYOK plan
      if (plan !== 'byok' && currentPlan.credits > 0) {
        await db.updateUserCredits(user.id, currentPlan.credits, 'add')
        await refreshCredits()
      }

      // Track the purchase
      await db.trackUsage(user.id, 'subscription_purchase', {
        tier: plan,
        amount: currentPlan.price,
        credits_added: currentPlan.credits,
        paypal_order_id: order.id
      })

      toast.success(`🎉 Welcome to ${currentPlan.name}!`)
      
      if (onSuccess) {
        onSuccess(order, subscriptionData)
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error('Payment successful but there was an error activating your subscription. Please contact support.')
      
      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const onErrorHandler = (error) => {
    console.error('PayPal error:', error)
    toast.error('Payment failed. Please try again.')
    
    if (onError) {
      onError(error)
    }
  }

  return (
    <PayPalScriptProvider 
      options={{ 
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture"
      }}
    >
      <div className="paypal-button-container">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          }}
          disabled={loading}
        />
      </div>
    </PayPalScriptProvider>
  )
}

export default PayPalButton
