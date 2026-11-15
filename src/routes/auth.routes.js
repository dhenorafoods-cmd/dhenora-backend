import express from 'express';
import axios from 'axios';
import { Webhook } from 'standardwebhooks';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Supabase will send the OTP to this endpoint
router.post('/whatsapp-hook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // 1. Verify the request is actually from Supabase
    const secret = process.env.SUPABASE_SMS_HOOK_SECRET;
    if (secret && secret !== 'mock_secret') {
      const wh = new Webhook(secret);
      try {
        wh.verify(req.body, req.headers);
      } catch (err) {
        console.error('❌ Invalid Supabase hook signature');
        return res.status(401).send('Invalid signature');
      }
    }

    // 2. Parse the payload
    const payload = JSON.parse(req.body.toString());
    const { user, sms } = payload;
    const phone = user.phone; // e.g. +919876543210
    const otp = sms.otp;

    console.log(`\n📱 [OTP Request] Sending OTP ${otp} to ${phone}`);

    // 3. MOCK MODE (For testing before Meta Business Approval)
    if (process.env.WHATSAPP_MOCK === 'true') {
      console.log('⚠️ MOCK MODE ACTIVE: No real WhatsApp message sent.');
      console.log(`👉 USE THIS OTP TO LOGIN: ${otp}`);
      return res.status(200).send('OK');
    }

    // 4. Real WhatsApp Cloud API Call
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'dhenora_otp_login', // The template name you create on Meta
          language: { code: 'en_US' },
          components: [{
            type: 'body',
            parameters: [{ type: 'text', text: otp }]
          }]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp message sent successfully');
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ WhatsApp API Error:', error.response?.data || error.message);
    res.status(500).send('Failed to send OTP');
  }
});

export default router;