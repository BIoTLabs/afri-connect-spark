import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const coinGeckoApiKey = Deno.env.get('COINGECKO_API_KEY');
    
    // Supported cryptocurrencies
    const supportedCoins = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'cardano'];
    
    // Fetch rates from CoinGecko API
    const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${supportedCoins.join(',')}&vs_currencies=usd,ngn&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (coinGeckoApiKey) {
      headers['x-cg-demo-api-key'] = coinGeckoApiKey;
    }

    console.log('Fetching rates from CoinGecko...');
    const response = await fetch(coinGeckoUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('CoinGecko response:', data);

    // Update exchange rates in database
    const updates = [];
    for (const [coinId, rates] of Object.entries(data)) {
      const coinData = rates as any;
      
      const updateData = {
        currency: coinId,
        usd_price: coinData.usd || 0,
        ngn_price: coinData.ngn || 0,
        price_change_24h: coinData.usd_24h_change || 0,
        market_cap: coinData.usd_market_cap || 0,
        volume_24h: coinData.usd_24h_vol || 0,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabaseClient
        .from('crypto_exchange_rates')
        .upsert(updateData, { onConflict: 'currency' });

      if (error) {
        console.error(`Error updating ${coinId}:`, error);
        updates.push({ currency: coinId, success: false, error: error.message });
      } else {
        console.log(`Updated rates for ${coinId}`);
        updates.push({ currency: coinId, success: true });
      }
    }

    // Fetch updated rates from database
    const { data: exchangeRates, error: fetchError } = await supabaseClient
      .from('crypto_exchange_rates')
      .select('*')
      .order('currency');

    if (fetchError) {
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        rates: exchangeRates,
        updates: updates,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in coingecko-rates function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch exchange rates', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});